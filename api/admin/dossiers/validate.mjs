import { query } from '../../_lib/db.mjs';
import { getUserFromRequest } from '../../_lib/auth.mjs';
import { sendTemplateEmail } from '../../_lib/email.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate admin
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès non autorisé - Admin uniquement' });
  }

  try {
    const { dossier_id, montant_valide, commentaire } = req.body;

    if (!dossier_id) {
      return res.status(400).json({ error: 'Dossier ID requis' });
    }

    // Get dossier
    const dossierResult = await query(
      `SELECT d.*, u.email as user_email, u.nom as user_nom, u.prenom as user_prenom
       FROM dossiers d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.id = $1`,
      [dossier_id]
    );

    if (dossierResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }

    const dossier = dossierResult.rows[0];

    // Update dossier status to validated
    await query(
      `UPDATE dossiers
       SET statut = 'valide',
           montant_valide = $1,
           validation_admin_date = NOW(),
           validation_admin_by = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [montant_valide || dossier.montant_estime, user.id, dossier_id]
    );

    // Log action
    await query(
      `INSERT INTO logs (user_id, action, entity_type, entity_id, details, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        user.id,
        'dossier_validate',
        'dossier',
        dossier_id,
        JSON.stringify({ montant_valide, commentaire })
      ]
    );

    // Send email notification
    await sendTemplateEmail(
      'dossier-validated',
      dossier.user_email,
      {
        nom: dossier.user_nom,
        prenom: dossier.user_prenom,
        titre: dossier.titre,
        dossierId: dossier_id,
        montantValide: montant_valide || dossier.montant_estime,
        opcoNom: dossier.opco_nom
      },
      dossier_id
    );

    return res.status(200).json({
      success: true,
      message: 'Dossier validé avec succès'
    });

  } catch (error) {
    console.error('Validate dossier error:', error);
    return res.status(500).json({ error: 'Erreur lors de la validation du dossier' });
  }
}

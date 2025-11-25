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
    const { dossier_id } = req.body;

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

    // Check if dossier is validated
    if (dossier.statut !== 'valide') {
      return res.status(400).json({ error: 'Le dossier doit être validé avant envoi à l\'OPCO' });
    }

    // Update dossier status
    await query(
      `UPDATE dossiers
       SET statut = 'envoye_opco',
           envoi_opco_date = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [dossier_id]
    );

    // Log action
    await query(
      `INSERT INTO logs (user_id, action, entity_type, entity_id, details, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        user.id,
        'dossier_send_opco',
        'dossier',
        dossier_id,
        JSON.stringify({ opco: dossier.opco_nom })
      ]
    );

    // Send email notification to user
    await sendTemplateEmail(
      'dossier-sent-opco',
      dossier.user_email,
      {
        nom: dossier.user_nom,
        prenom: dossier.user_prenom,
        titre: dossier.titre,
        dossierId: dossier_id,
        opcoNom: dossier.opco_nom
      },
      dossier_id
    );

    // TODO: Send actual email to OPCO with documents
    // await sendEmailToOPCO(dossier);

    return res.status(200).json({
      success: true,
      message: 'Dossier envoyé à l\'OPCO avec succès'
    });

  } catch (error) {
    console.error('Send to OPCO error:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'envoi à l\'OPCO' });
  }
}

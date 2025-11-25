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
    const { dossier_id, accepted, motif_refus, montant_final } = req.body;

    if (!dossier_id || accepted === undefined) {
      return res.status(400).json({ error: 'Dossier ID et statut requis' });
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

    // Update dossier status
    const newStatus = accepted ? 'accepte' : 'refuse';
    await query(
      `UPDATE dossiers
       SET statut = $1,
           reponse_opco_date = NOW(),
           motif_refus = $2,
           montant_valide = $3,
           updated_at = NOW()
       WHERE id = $4`,
      [newStatus, motif_refus || null, montant_final || dossier.montant_valide, dossier_id]
    );

    // Log action
    await query(
      `INSERT INTO logs (user_id, action, entity_type, entity_id, details, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        user.id,
        `dossier_opco_${accepted ? 'accept' : 'reject'}`,
        'dossier',
        dossier_id,
        JSON.stringify({ accepted, motif_refus, montant_final })
      ]
    );

    // Send email notification
    const templateName = accepted ? 'dossier-approved' : 'dossier-rejected';
    await sendTemplateEmail(
      templateName,
      dossier.user_email,
      {
        nom: dossier.user_nom,
        prenom: dossier.user_prenom,
        titre: dossier.titre,
        dossierId: dossier_id,
        opcoNom: dossier.opco_nom,
        montantValide: montant_final || dossier.montant_valide,
        typeFormation: dossier.type_formation,
        motifRefus: motif_refus || 'Non spécifié'
      },
      dossier_id
    );

    return res.status(200).json({
      success: true,
      message: accepted ? 'Dossier marqué comme accepté' : 'Dossier marqué comme refusé'
    });

  } catch (error) {
    console.error('OPCO response error:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la réponse OPCO' });
  }
}

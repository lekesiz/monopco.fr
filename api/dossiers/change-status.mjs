import { query } from '../_lib/db.mjs';
import { getUserFromRequest } from '../_lib/auth.mjs';
import { sendTemplateEmail } from '../_lib/email.mjs';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate user
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  try {
    const { dossierId, newStatus, motifRefus, sendNotification = true } = req.body;

    if (!dossierId || !newStatus) {
      return res.status(400).json({ error: 'dossierId et newStatus sont requis' });
    }

    // Validate status
    const validStatuses = ['brouillon', 'en_cours', 'soumis', 'valide', 'refuse', 'termine'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    // Get current dossier
    const dossierResult = await query(
      `SELECT d.*, u.email as user_email, u.contact_nom as user_nom
       FROM dossiers d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.id = $1`,
      [dossierId]
    );

    if (dossierResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }

    const dossier = dossierResult.rows[0];
    const oldStatus = dossier.statut;

    // Check permissions (user owns dossier or is admin)
    if (dossier.user_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Validate status transition
    const allowedTransitions = {
      'brouillon': ['en_cours', 'soumis'],
      'en_cours': ['soumis', 'brouillon'],
      'soumis': ['valide', 'refuse', 'en_cours'],
      'valide': ['termine'],
      'refuse': ['en_cours'],
      'termine': []
    };

    if (!allowedTransitions[oldStatus]?.includes(newStatus)) {
      return res.status(400).json({ 
        error: `Transition de statut non autorisée: ${oldStatus} → ${newStatus}` 
      });
    }

    // Update status
    const updateFields = ['statut = $1', 'updated_at = NOW()'];
    const updateValues = [newStatus];
    let paramIndex = 2;

    // Add specific fields based on new status
    if (newStatus === 'valide') {
      updateFields.push(`validation_admin_date = NOW()`);
      updateFields.push(`validation_admin_by = $${paramIndex}`);
      updateValues.push(user.id);
      paramIndex++;
    }

    if (newStatus === 'soumis') {
      updateFields.push(`envoi_opco_date = NOW()`);
    }

    if (newStatus === 'valide' || newStatus === 'refuse') {
      updateFields.push(`reponse_opco_date = NOW()`);
    }

    if (newStatus === 'refuse' && motifRefus) {
      updateFields.push(`motif_refus = $${paramIndex}`);
      updateValues.push(motifRefus);
      paramIndex++;
    }

    // Execute update
    updateValues.push(dossierId);
    const updateQuery = `
      UPDATE dossiers
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);
    const updatedDossier = result.rows[0];

    // Log action
    await query(
      `INSERT INTO logs (user_id, action, entity_type, entity_id, details, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        user.id,
        'status_change',
        'dossier',
        dossierId,
        JSON.stringify({ oldStatus, newStatus, motifRefus })
      ]
    );

    // Send email notification
    if (sendNotification && dossier.user_email) {
      try {
        const emailData = {
          nom: dossier.user_nom || 'Utilisateur',
          prenom: '',
          titre: dossier.type_formation || 'Formation',
          dossierId: dossier.id,
          typeFormation: dossier.type_formation,
          montantEstime: dossier.montant_estime || 0,
          montantValide: dossier.montant_valide || dossier.montant_estime || 0,
          opcoNom: dossier.opco_nom || 'OPCO',
          motifRefus: motifRefus || 'Non spécifié'
        };

        let templateName = null;

        switch (newStatus) {
          case 'valide':
            templateName = 'dossier-validated';
            break;
          case 'soumis':
            templateName = 'dossier-sent-opco';
            break;
          case 'refuse':
            templateName = 'dossier-rejected';
            break;
        }

        if (templateName) {
          await sendTemplateEmail(templateName, dossier.user_email, emailData, dossierId);
        }
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return res.status(200).json({
      success: true,
      message: `Statut mis à jour: ${oldStatus} → ${newStatus}`,
      dossier: updatedDossier,
      oldStatus,
      newStatus
    });

  } catch (error) {
    console.error('Change status error:', error);
    return res.status(500).json({ 
      error: 'Erreur lors du changement de statut',
      details: error.message 
    });
  }
}

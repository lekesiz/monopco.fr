import { query } from '../_lib/db.mjs';
import { getUserFromRequest } from '../_lib/auth.mjs';

export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate user
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  try {
    const { id, ...updates } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Dossier ID requis' });
    }

    // Get current dossier
    const currentResult = await query(
      'SELECT * FROM dossiers WHERE id = $1',
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }

    const currentDossier = currentResult.rows[0];

    // Check if user owns this dossier or is admin
    if (currentDossier.user_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Build update query
    const allowedFields = [
      'titre', 'type_formation', 'statut',
      'beneficiaire_nom', 'beneficiaire_prenom', 'beneficiaire_email', 'beneficiaire_telephone',
      'entreprise_siret', 'entreprise_nom', 'entreprise_adresse', 'entreprise_effectif',
      'opco_nom', 'opco_contact_email',
      'cout_total_ht', 'montant_estime', 'montant_valide',
      'payment_status', 'payment_date', 'payment_amount',
      'formation_titre', 'formation_objectifs', 'formation_organisme', 'formation_duree_heures',
      'date_debut', 'date_fin', 'justification', 'motif_refus'
    ];

    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        updateValues.push(updates[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
    }

    // Add updated_at
    updateFields.push(`updated_at = NOW()`);

    // Update dossier
    updateValues.push(id);
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
        'dossier_update',
        'dossier',
        id,
        JSON.stringify({ fields: Object.keys(updates) })
      ]
    );

    return res.status(200).json({
      success: true,
      dossier: updatedDossier,
      message: 'Dossier mis à jour avec succès'
    });

  } catch (error) {
    console.error('Update dossier error:', error);
    return res.status(500).json({ error: 'Erreur lors de la mise à jour du dossier' });
  }
}

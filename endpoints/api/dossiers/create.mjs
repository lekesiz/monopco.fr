import { query } from '../_lib/db.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      entreprise_id,
      type_dossier = 'formation',
      beneficiaire_nom,
      beneficiaire_prenom,
      beneficiaire_email,
      beneficiaire_telephone,
      montant_estime
    } = req.body;

    // Validate required fields
    if (!type_dossier) {
      return res.status(400).json({ 
        error: 'Missing required field: type_dossier' 
      });
    }

    // Insert dossier (using French column names)
    const result = await query(
      `INSERT INTO dossiers (
        entreprise_id, type_dossier, statut,
        beneficiaire_nom, beneficiaire_prenom, beneficiaire_email, beneficiaire_telephone,
        montant_estime, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [
        entreprise_id || null,
        type_dossier,
        'brouillon', // draft in French
        beneficiaire_nom || null,
        beneficiaire_prenom || null,
        beneficiaire_email || null,
        beneficiaire_telephone || null,
        montant_estime || null
      ]
    );

    const dossier = result.rows[0];

    return res.status(201).json({ 
      success: true,
      dossier,
      message: 'Dossier créé avec succès'
    });
  } catch (error) {
    console.error('Create dossier error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

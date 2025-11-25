import { query } from '../_lib/db.mjs';
import { getUserFromRequest } from '../_lib/auth.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Dossier ID is required' });
    }

    // Get dossier with entreprise details
    const result = await query(
      `SELECT d.*, 
              e.nom as entreprise_nom, 
              e.siret as entreprise_siret,
              e.adresse as entreprise_adresse,
              e.code_naf as entreprise_code_naf,
              e.opco as entreprise_opco
       FROM dossiers d
       LEFT JOIN entreprises e ON d.entreprise_id = e.id
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dossier not found' });
    }

    const dossier = result.rows[0];

    // Check if user has access to this dossier
    // For now, allow all authenticated users
    // TODO: Add role-based access control

    return res.status(200).json({
      success: true,
      dossier
    });

  } catch (error) {
    console.error('Dossier detail error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

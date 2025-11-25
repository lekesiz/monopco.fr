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

    const { statut, limit = 50, offset = 0 } = req.query;

    let queryText = `
      SELECT f.*, 
             d.beneficiaire_nom, 
             d.beneficiaire_prenom,
             e.nom as entreprise_nom
      FROM factures f
      LEFT JOIN dossiers d ON f.dossier_id = d.id
      LEFT JOIN entreprises e ON d.entreprise_id = e.id
    `;

    const params = [];
    
    if (statut) {
      queryText += ' WHERE f.statut = $1';
      params.push(statut);
    }

    queryText += ' ORDER BY f.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await query(queryText, params);

    return res.status(200).json({
      success: true,
      factures: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Factures list error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

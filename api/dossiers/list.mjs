import { query } from '../_lib/db.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { entreprise_id, statut } = req.query;

    let queryText = 'SELECT * FROM dossiers WHERE 1=1';
    const params = [];

    if (entreprise_id) {
      params.push(entreprise_id);
      queryText += ` AND entreprise_id = $${params.length}`;
    }

    if (statut && typeof statut === 'string') {
      params.push(statut);
      queryText += ` AND statut = $${params.length}`;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);

    return res.status(200).json({ 
      success: true,
      dossiers: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('List dossiers error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

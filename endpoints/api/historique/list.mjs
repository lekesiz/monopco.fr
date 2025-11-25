import { getUserFromRequest } from '../_lib/auth.mjs';
import { getHistorique } from '../_lib/historique.mjs';

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

    const { dossierId } = req.query;

    if (!dossierId) {
      return res.status(400).json({ error: 'Dossier ID is required' });
    }

    const historique = await getHistorique(dossierId);

    return res.status(200).json({
      success: true,
      historique
    });

  } catch (error) {
    console.error('Historique list error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

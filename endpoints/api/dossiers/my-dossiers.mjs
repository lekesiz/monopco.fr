import { query } from '../_lib/db.mjs';
import { getUserFromRequest } from '../_lib/auth.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate user
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  try {
    // Get all dossiers for this user
    const result = await query(
      `SELECT 
        d.*,
        COUNT(DISTINCT doc.id) as document_count,
        (SELECT COUNT(*) FROM emails WHERE dossier_id = d.id) as email_count
       FROM dossiers d
       LEFT JOIN documents doc ON d.id = doc.dossier_id
       WHERE d.user_id = $1
       GROUP BY d.id
       ORDER BY d.created_at DESC`,
      [user.id]
    );

    // Calculate statistics
    const stats = {
      total: result.rows.length,
      brouillon: result.rows.filter(d => d.statut === 'brouillon').length,
      en_cours: result.rows.filter(d => ['en_attente_validation', 'valide', 'envoye_opco'].includes(d.statut)).length,
      accepte: result.rows.filter(d => d.statut === 'accepte').length,
      refuse: result.rows.filter(d => d.statut === 'refuse').length,
      total_montant_estime: result.rows.reduce((sum, d) => sum + (parseFloat(d.montant_estime) || 0), 0),
      total_montant_valide: result.rows.reduce((sum, d) => sum + (parseFloat(d.montant_valide) || 0), 0)
    };

    return res.status(200).json({
      success: true,
      dossiers: result.rows,
      stats
    });

  } catch (error) {
    console.error('Get my dossiers error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des dossiers' });
  }
}

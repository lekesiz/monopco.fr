import { query } from '../_lib/db.mjs';
import { getUserFromRequest } from '../_lib/auth.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate admin
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès non autorisé - Admin uniquement' });
  }

  try {
    // Get overall statistics
    const overallStats = await query(`
      SELECT 
        COUNT(*) as total_dossiers,
        COUNT(*) FILTER (WHERE statut = 'brouillon') as brouillon,
        COUNT(*) FILTER (WHERE statut = 'en_attente_validation') as en_attente,
        COUNT(*) FILTER (WHERE statut = 'valide') as valide,
        COUNT(*) FILTER (WHERE statut = 'envoye_opco') as envoye,
        COUNT(*) FILTER (WHERE statut = 'accepte') as accepte,
        COUNT(*) FILTER (WHERE statut = 'refuse') as refuse,
        SUM(montant_estime) as total_montant_estime,
        SUM(montant_valide) FILTER (WHERE statut IN ('valide', 'envoye_opco', 'accepte')) as total_montant_valide,
        SUM(montant_valide) FILTER (WHERE statut = 'accepte') as total_montant_accepte,
        COUNT(*) FILTER (WHERE type_formation = 'bilan') as bilan_count,
        COUNT(*) FILTER (WHERE type_formation = 'formation') as formation_count,
        COUNT(DISTINCT user_id) as total_users
      FROM dossiers
    `);

    // Get statistics by OPCO
    const opcoStats = await query(`
      SELECT 
        opco_nom,
        COUNT(*) as dossiers_count,
        SUM(montant_valide) FILTER (WHERE statut = 'accepte') as montant_accepte,
        COUNT(*) FILTER (WHERE statut = 'accepte') as accepte_count,
        COUNT(*) FILTER (WHERE statut = 'refuse') as refuse_count
      FROM dossiers
      WHERE opco_nom IS NOT NULL
      GROUP BY opco_nom
      ORDER BY dossiers_count DESC
    `);

    // Get recent activity (last 30 days)
    const recentActivity = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as dossiers_created,
        SUM(montant_estime) as montant_total
      FROM dossiers
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Get pending actions
    const pendingActions = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE statut = 'en_attente_validation') as validation_needed,
        COUNT(*) FILTER (WHERE statut = 'valide' AND envoi_opco_date IS NULL) as ready_to_send,
        COUNT(*) FILTER (WHERE statut = 'envoye_opco' AND reponse_opco_date IS NULL) as waiting_opco_response
      FROM dossiers
    `);

    // Get average processing times
    const processingTimes = await query(`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (validation_admin_date - created_at))/86400) as avg_days_to_validation,
        AVG(EXTRACT(EPOCH FROM (envoi_opco_date - validation_admin_date))/86400) as avg_days_validation_to_send,
        AVG(EXTRACT(EPOCH FROM (reponse_opco_date - envoi_opco_date))/86400) as avg_days_opco_response
      FROM dossiers
      WHERE validation_admin_date IS NOT NULL
    `);

    // Get top entreprises
    const topEntreprises = await query(`
      SELECT 
        entreprise_nom,
        entreprise_siret,
        COUNT(*) as dossiers_count,
        SUM(montant_valide) FILTER (WHERE statut = 'accepte') as montant_total
      FROM dossiers
      WHERE entreprise_nom IS NOT NULL
      GROUP BY entreprise_nom, entreprise_siret
      ORDER BY dossiers_count DESC
      LIMIT 10
    `);

    return res.status(200).json({
      success: true,
      stats: {
        overall: overallStats.rows[0],
        by_opco: opcoStats.rows,
        recent_activity: recentActivity.rows,
        pending_actions: pendingActions.rows[0],
        processing_times: processingTimes.rows[0],
        top_entreprises: topEntreprises.rows
      }
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
}

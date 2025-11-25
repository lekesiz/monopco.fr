import { query } from '../_lib/db.mjs';
import { getUserFromRequest } from '../_lib/auth.mjs';

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate user
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  try {
    const isAdmin = user.role === 'admin';
    const userFilter = isAdmin ? '' : `WHERE user_id = ${user.id}`;

    // Total dossiers
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM dossiers ${userFilter}`
    );
    const totalDossiers = parseInt(totalResult.rows[0].total);

    // Dossiers by status
    const statusResult = await query(
      `SELECT statut, COUNT(*) as count 
       FROM dossiers ${userFilter}
       GROUP BY statut`
    );
    const dossiersByStatus = statusResult.rows.reduce((acc, row) => {
      acc[row.statut] = parseInt(row.count);
      return acc;
    }, {});

    // Dossiers by type
    const typeResult = await query(
      `SELECT type_formation, COUNT(*) as count 
       FROM dossiers ${userFilter}
       GROUP BY type_formation`
    );
    const dossiersByType = typeResult.rows.reduce((acc, row) => {
      acc[row.type_formation || 'Non spécifié'] = parseInt(row.count);
      return acc;
    }, {});

    // Total montants
    const montantsResult = await query(
      `SELECT 
        SUM(CAST(montant_estime AS DECIMAL)) as total_estime,
        SUM(CAST(montant_valide AS DECIMAL)) as total_valide
       FROM dossiers ${userFilter}`
    );
    const totalMontantEstime = parseFloat(montantsResult.rows[0].total_estime || 0);
    const totalMontantValide = parseFloat(montantsResult.rows[0].total_valide || 0);

    // Recent dossiers (last 7 days)
    const recentResult = await query(
      `SELECT COUNT(*) as count 
       FROM dossiers 
       WHERE created_at >= NOW() - INTERVAL '7 days'
       ${userFilter ? `AND ${userFilter.replace('WHERE ', '')}` : ''}`
    );
    const recentDossiers = parseInt(recentResult.rows[0].count);

    // Dossiers timeline (last 30 days)
    const timelineResult = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM dossiers
       WHERE created_at >= NOW() - INTERVAL '30 days'
       ${userFilter ? `AND ${userFilter.replace('WHERE ', '')}` : ''}
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );
    const timeline = timelineResult.rows.map(row => ({
      date: row.date,
      count: parseInt(row.count)
    }));

    // Admin-only stats
    let adminStats = {};
    if (isAdmin) {
      // Total users
      const usersResult = await query('SELECT COUNT(*) as total FROM users');
      const totalUsers = parseInt(usersResult.rows[0].total);

      // Total documents
      const documentsResult = await query('SELECT COUNT(*) as total FROM documents');
      const totalDocuments = parseInt(documentsResult.rows[0].total);

      // Total emails sent
      const emailsResult = await query('SELECT COUNT(*) as total FROM emails');
      const totalEmails = parseInt(emailsResult.rows[0].total);

      // Users by role
      const rolesResult = await query(
        `SELECT role, COUNT(*) as count FROM users GROUP BY role`
      );
      const usersByRole = rolesResult.rows.reduce((acc, row) => {
        acc[row.role] = parseInt(row.count);
        return acc;
      }, {});

      adminStats = {
        totalUsers,
        totalDocuments,
        totalEmails,
        usersByRole
      };
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalDossiers,
        dossiersByStatus,
        dossiersByType,
        totalMontantEstime,
        totalMontantValide,
        recentDossiers,
        timeline,
        ...adminStats
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques',
      details: error.message 
    });
  }
}

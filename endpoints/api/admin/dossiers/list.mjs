import { query } from '../../_lib/db.mjs';
import { getUserFromRequest } from '../../_lib/auth.mjs';

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
    const { 
      statut, 
      opco, 
      type_formation,
      search,
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    // Build WHERE clause
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (statut) {
      conditions.push(`d.statut = $${paramIndex}`);
      params.push(statut);
      paramIndex++;
    }

    if (opco) {
      conditions.push(`d.opco_nom ILIKE $${paramIndex}`);
      params.push(`%${opco}%`);
      paramIndex++;
    }

    if (type_formation) {
      conditions.push(`d.type_formation = $${paramIndex}`);
      params.push(type_formation);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(
        d.titre ILIKE $${paramIndex} OR
        d.beneficiaire_nom ILIKE $${paramIndex} OR
        d.beneficiaire_prenom ILIKE $${paramIndex} OR
        d.entreprise_nom ILIKE $${paramIndex} OR
        d.entreprise_siret ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM dossiers d ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get dossiers
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const allowedSortFields = ['created_at', 'updated_at', 'titre', 'statut', 'montant_estime', 'entreprise_nom'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const dossiersResult = await query(
      `SELECT 
        d.*,
        u.nom as user_nom,
        u.prenom as user_prenom,
        u.email as user_email,
        COUNT(DISTINCT doc.id) as document_count,
        COUNT(DISTINCT e.id) as email_count
       FROM dossiers d
       LEFT JOIN users u ON d.user_id = u.id
       LEFT JOIN documents doc ON d.id = doc.dossier_id
       LEFT JOIN emails e ON d.id = e.dossier_id
       ${whereClause}
       GROUP BY d.id, u.id
       ORDER BY d.${sortField} ${sortDirection}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), offset]
    );

    // Get statistics
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE statut = 'brouillon') as brouillon,
        COUNT(*) FILTER (WHERE statut = 'en_attente_validation') as en_attente,
        COUNT(*) FILTER (WHERE statut = 'valide') as valide,
        COUNT(*) FILTER (WHERE statut = 'envoye_opco') as envoye,
        COUNT(*) FILTER (WHERE statut = 'accepte') as accepte,
        COUNT(*) FILTER (WHERE statut = 'refuse') as refuse,
        SUM(montant_estime) as total_montant_estime,
        SUM(montant_valide) as total_montant_valide,
        COUNT(*) FILTER (WHERE type_formation = 'bilan') as bilan_count,
        COUNT(*) FILTER (WHERE type_formation = 'formation') as formation_count
       FROM dossiers`
    );

    return res.status(200).json({
      success: true,
      dossiers: dossiersResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: statsResult.rows[0]
    });

  } catch (error) {
    console.error('Admin list dossiers error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des dossiers' });
  }
}

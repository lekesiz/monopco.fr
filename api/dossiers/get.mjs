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
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Dossier ID requis' });
    }

    // Get dossier with all related data
    const dossierResult = await query(
      `SELECT d.*, u.nom as user_nom, u.prenom as user_prenom, u.email as user_email
       FROM dossiers d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.id = $1`,
      [id]
    );

    if (dossierResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }

    const dossier = dossierResult.rows[0];

    // Check if user owns this dossier or is admin
    if (dossier.user_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Get documents
    const documentsResult = await query(
      `SELECT d.*, u.nom as uploaded_by_name, u.prenom as uploaded_by_prenom
       FROM documents d
       LEFT JOIN users u ON d.uploaded_by = u.id
       WHERE d.dossier_id = $1
       ORDER BY d.uploaded_at DESC`,
      [id]
    );

    // Get emails
    const emailsResult = await query(
      `SELECT * FROM emails
       WHERE dossier_id = $1
       ORDER BY sent_at DESC`,
      [id]
    );

    // Get logs
    const logsResult = await query(
      `SELECT l.*, u.nom as user_nom, u.prenom as user_prenom
       FROM logs l
       LEFT JOIN users u ON l.user_id = u.id
       WHERE l.entity_type = 'dossier' AND l.entity_id = $1
       ORDER BY l.created_at DESC
       LIMIT 50`,
      [id]
    );

    return res.status(200).json({
      success: true,
      dossier,
      documents: documentsResult.rows,
      emails: emailsResult.rows,
      logs: logsResult.rows
    });

  } catch (error) {
    console.error('Get dossier error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération du dossier' });
  }
}

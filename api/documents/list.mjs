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
    const { dossier_id } = req.query;

    if (!dossier_id) {
      return res.status(400).json({ error: 'Dossier ID requis' });
    }

    // Verify user has access to this dossier
    const dossierResult = await query(
      'SELECT id, user_id FROM dossiers WHERE id = $1',
      [dossier_id]
    );

    if (dossierResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }

    const dossier = dossierResult.rows[0];

    // Check if user owns this dossier or is admin
    if (dossier.user_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Get documents for this dossier
    const result = await query(
      `SELECT d.*, u.nom as uploaded_by_name, u.prenom as uploaded_by_prenom
       FROM documents d
       LEFT JOIN users u ON d.uploaded_by = u.id
       WHERE d.dossier_id = $1
       ORDER BY d.uploaded_at DESC`,
      [dossier_id]
    );

    return res.status(200).json({
      success: true,
      documents: result.rows
    });

  } catch (error) {
    console.error('List documents error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
  }
}

import { query } from '../_lib/db.mjs';
import { getUserFromRequest } from '../_lib/auth.mjs';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
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

    // Get dossier
    const dossierResult = await query(
      'SELECT * FROM dossiers WHERE id = $1',
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

    // Only allow deletion of brouillon status
    if (dossier.statut !== 'brouillon' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Seuls les dossiers en brouillon peuvent être supprimés' });
    }

    // Delete dossier (cascade will delete related documents, emails, etc.)
    await query('DELETE FROM dossiers WHERE id = $1', [id]);

    // Log action
    await query(
      `INSERT INTO logs (user_id, action, entity_type, entity_id, details, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        user.id,
        'dossier_delete',
        'dossier',
        id,
        JSON.stringify({ titre: dossier.titre })
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Dossier supprimé avec succès'
    });

  } catch (error) {
    console.error('Delete dossier error:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression du dossier' });
  }
}

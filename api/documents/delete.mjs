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
      return res.status(400).json({ error: 'Document ID requis' });
    }

    // Get document and verify access
    const documentResult = await query(
      `SELECT d.*, dos.user_id as dossier_user_id
       FROM documents d
       JOIN dossiers dos ON d.dossier_id = dos.id
       WHERE d.id = $1`,
      [id]
    );

    if (documentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    const document = documentResult.rows[0];

    // Check if user owns the dossier or is admin
    if (document.dossier_user_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // TODO: Delete file from S3 or storage
    // await deleteFromS3(document.file_path);

    // Delete document record
    await query('DELETE FROM documents WHERE id = $1', [id]);

    // Log action
    await query(
      `INSERT INTO logs (user_id, action, entity_type, entity_id, details, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        user.id,
        'document_delete',
        'document',
        id,
        JSON.stringify({ fileName: document.file_name })
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Document supprimé avec succès'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression du document' });
  }
}

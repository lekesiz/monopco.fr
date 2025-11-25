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

    // Redirect to the Vercel Blob URL (public access)
    // The file_path contains the full Blob URL
    return res.status(200).json({
      success: true,
      url: document.file_path,
      document: {
        id: document.id,
        nom: document.file_name,
        type: document.file_type,
        taille: document.file_size
      }
    });

  } catch (error) {
    console.error('Download document error:', error);
    return res.status(500).json({ 
      error: 'Erreur lors du téléchargement du document',
      details: error.message 
    });
  }
}

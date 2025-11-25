import { query } from '../_lib/db.mjs';
import { getUserFromRequest } from '../_lib/auth.mjs';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate user
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  try {
    // Parse form data
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await form.parse(req);

    const dossierId = fields.dossier_id?.[0];
    const documentType = fields.document_type?.[0] || 'autre';
    const file = files.file?.[0];

    if (!dossierId || !file) {
      return res.status(400).json({ error: 'Dossier ID et fichier requis' });
    }

    // Verify user has access to this dossier
    const dossierResult = await query(
      'SELECT id, user_id FROM dossiers WHERE id = $1',
      [dossierId]
    );

    if (dossierResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }

    const dossier = dossierResult.rows[0];

    // Check if user owns this dossier or is admin
    if (dossier.user_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // In production, upload to S3 or similar
    // For now, we'll store the file path
    const fileName = file.originalFilename || file.newFilename;
    const fileSize = file.size;
    const fileType = file.mimetype || 'application/octet-stream';

    // TODO: Upload to S3 and get URL
    // const fileUrl = await uploadToS3(file.filepath, fileName);
    const fileUrl = `/uploads/${fileName}`; // Placeholder

    // Save document record to database
    const result = await query(
      `INSERT INTO documents (dossier_id, file_name, file_path, file_type, file_size, uploaded_by, uploaded_at, document_type)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
       RETURNING *`,
      [dossierId, fileName, fileUrl, fileType, fileSize, user.id, documentType]
    );

    const document = result.rows[0];

    // Log action
    await query(
      `INSERT INTO logs (user_id, action, entity_type, entity_id, details, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        user.id,
        'document_upload',
        'document',
        document.id,
        JSON.stringify({ fileName, fileSize, documentType })
      ]
    );

    return res.status(201).json({
      success: true,
      document,
      message: 'Document uploadé avec succès'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'upload du document' });
  }
}

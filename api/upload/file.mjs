import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getUserFromRequest } from '../_lib/auth.mjs';
import { query } from '../_lib/db.mjs';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-3',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'monopco-documents';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { file, dossierId, fileName, fileType } = req.body;

    if (!file || !dossierId || !fileName) {
      return res.status(400).json({ error: 'File, dossierId, and fileName are required' });
    }

    // Decode base64 file
    const fileBuffer = Buffer.from(file, 'base64');

    // Generate unique file key
    const timestamp = Date.now();
    const fileKey = `dossiers/${dossierId}/${timestamp}-${fileName}`;

    // Upload to S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: fileType || 'application/octet-stream',
      ACL: 'private'
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Generate S3 URL
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-west-3'}.amazonaws.com/${fileKey}`;

    // Save document record to database
    const result = await query(
      `INSERT INTO documents (
        dossier_id, nom, type, url, taille, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *`,
      [dossierId, fileName, fileType || 'application/octet-stream', fileUrl, fileBuffer.length]
    );

    const document = result.rows[0];

    return res.status(201).json({
      success: true,
      document,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

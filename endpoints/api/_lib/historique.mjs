import { query } from './db.mjs';

/**
 * Log action to historique table
 */
export async function logAction(dossierId, userId, action, details = null) {
  try {
    await query(
      `INSERT INTO historique (dossier_id, user_id, action, details, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [dossierId, userId, action, details ? JSON.stringify(details) : null]
    );
  } catch (error) {
    console.error('Failed to log action:', error);
    // Don't throw - historique logging should not break the main flow
  }
}

/**
 * Get historique for a dossier
 */
export async function getHistorique(dossierId) {
  const result = await query(
    `SELECT h.*, u.nom as user_nom, u.email as user_email
     FROM historique h
     LEFT JOIN users u ON h.user_id = u.id
     WHERE h.dossier_id = $1
     ORDER BY h.created_at DESC`,
    [dossierId]
  );
  
  return result.rows;
}

/**
 * Action types for historique
 */
export const ACTIONS = {
  DOSSIER_CREATED: 'dossier_created',
  DOSSIER_UPDATED: 'dossier_updated',
  DOSSIER_DELETED: 'dossier_deleted',
  STATUS_CHANGED: 'status_changed',
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_DELETED: 'document_deleted',
  PDF_GENERATED: 'pdf_generated',
  EMAIL_SENT: 'email_sent',
  FACTURE_CREATED: 'facture_created',
  FACTURE_PAID: 'facture_paid',
  COMMENT_ADDED: 'comment_added'
};

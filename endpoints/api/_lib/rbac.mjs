/**
 * Role-Based Access Control (RBAC) utilities
 */

export const ROLES = {
  ADMIN: 'admin',
  RH: 'rh',
  USER: 'user',
  CONSULTANT: 'consultant'
};

export const PERMISSIONS = {
  // Dossier permissions
  DOSSIER_CREATE: 'dossier:create',
  DOSSIER_READ: 'dossier:read',
  DOSSIER_UPDATE: 'dossier:update',
  DOSSIER_DELETE: 'dossier:delete',
  DOSSIER_LIST_ALL: 'dossier:list_all',
  
  // User permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_LIST: 'user:list',
  
  // Facture permissions
  FACTURE_CREATE: 'facture:create',
  FACTURE_READ: 'facture:read',
  FACTURE_UPDATE: 'facture:update',
  FACTURE_DELETE: 'facture:delete',
  
  // Document permissions
  DOCUMENT_UPLOAD: 'document:upload',
  DOCUMENT_DOWNLOAD: 'document:download',
  DOCUMENT_DELETE: 'document:delete',
  
  // Export permissions
  EXPORT_EXCEL: 'export:excel',
  EXPORT_PDF: 'export:pdf'
};

// Role-Permission mapping
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Admin has all permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [ROLES.RH]: [
    // RH can manage dossiers and view factures
    PERMISSIONS.DOSSIER_CREATE,
    PERMISSIONS.DOSSIER_READ,
    PERMISSIONS.DOSSIER_UPDATE,
    PERMISSIONS.DOSSIER_LIST_ALL,
    PERMISSIONS.FACTURE_READ,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_DOWNLOAD,
    PERMISSIONS.EXPORT_EXCEL,
    PERMISSIONS.EXPORT_PDF,
    PERMISSIONS.USER_READ
  ],
  
  [ROLES.CONSULTANT]: [
    // Consultant can manage dossiers and documents
    PERMISSIONS.DOSSIER_CREATE,
    PERMISSIONS.DOSSIER_READ,
    PERMISSIONS.DOSSIER_UPDATE,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_DOWNLOAD,
    PERMISSIONS.EXPORT_PDF
  ],
  
  [ROLES.USER]: [
    // User can only view their own dossiers
    PERMISSIONS.DOSSIER_READ,
    PERMISSIONS.DOCUMENT_DOWNLOAD
  ]
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if user has required permission
 */
export function checkPermission(user, permission) {
  if (!user) {
    return { authorized: false, error: 'User not authenticated' };
  }
  
  if (!hasPermission(user.role, permission)) {
    return { 
      authorized: false, 
      error: `Permission denied: ${permission} required` 
    };
  }
  
  return { authorized: true };
}

/**
 * Middleware to require specific permission
 */
export function requirePermission(permission) {
  return (user) => {
    return checkPermission(user, permission);
  };
}

/**
 * Check if user can access a specific dossier
 */
export function canAccessDossier(user, dossier) {
  if (!user || !dossier) return false;
  
  // Admin and RH can access all dossiers
  if (user.role === ROLES.ADMIN || user.role === ROLES.RH) {
    return true;
  }
  
  // Consultant can access dossiers they created
  if (user.role === ROLES.CONSULTANT && dossier.created_by === user.id) {
    return true;
  }
  
  // User can access their own dossier
  if (user.role === ROLES.USER && dossier.beneficiaire_email === user.email) {
    return true;
  }
  
  return false;
}

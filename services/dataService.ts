import { Dossier, DossierStatus } from '../types';
import { getAuthHeaders } from './authService';

/**
 * Fetch user's dossiers from backend API
 */
export const getDossiers = async (): Promise<Dossier[]> => {
  try {
    const response = await fetch('/api/dossiers/my-dossiers', {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login if not authenticated
        window.location.hash = '/login';
        return [];
      }
      console.error('Failed to fetch dossiers:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (data.success && Array.isArray(data.dossiers)) {
      // Map database fields to frontend Dossier type
      return data.dossiers.map((d: any) => ({
        id: d.id?.toString() || '',
        title: d.titre || (d.type_formation === 'bilan' ? 'Bilan de Compétences' : 'Formation Professionnelle'),
        description: `${d.beneficiaire_prenom || ''} ${d.beneficiaire_nom || ''}`.trim(),
        employeeName: `${d.beneficiaire_prenom || ''} ${d.beneficiaire_nom || ''}`.trim(),
        companyId: d.entreprise_siret || '',
        status: mapStatus(d.statut),
        amount: parseFloat(d.montant_estime) || 0,
        startDate: d.date_debut || '',
        createdAt: d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : '',
        // Additional fields
        opco: d.opco_nom || '',
        typeFormation: d.type_formation || 'formation',
        documentCount: d.document_count || 0,
        emailCount: d.email_count || 0
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching dossiers:', error);
    return [];
  }
};

/**
 * Get single dossier with all details
 */
export const getDossier = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`/api/dossiers/get?id=${id}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dossier');
    }
    
    const data = await response.json();
    
    if (data.success) {
      return {
        dossier: data.dossier,
        documents: data.documents || [],
        emails: data.emails || [],
        logs: data.logs || []
      };
    }
    
    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Error fetching dossier:', error);
    throw error;
  }
};

/**
 * Map database status to DossierStatus enum
 */
function mapStatus(statut: string): DossierStatus {
  const statusMap: Record<string, DossierStatus> = {
    'brouillon': DossierStatus.DRAFT,
    'en_attente_validation': DossierStatus.SUBMITTED,
    'valide': DossierStatus.VALIDATED,
    'envoye_opco': DossierStatus.IN_PROGRESS,
    'accepte': DossierStatus.VALIDATED,
    'refuse': DossierStatus.DRAFT
  };
  
  return statusMap[statut?.toLowerCase()] || DossierStatus.DRAFT;
}

/**
 * Create or update a dossier via backend API
 */
export const saveDossier = async (dossier: Partial<Dossier> & { id?: string }): Promise<Dossier> => {
  try {
    const isUpdate = !!dossier.id;
    const endpoint = isUpdate ? '/api/dossiers/update' : '/api/dossiers/create';
    const method = isUpdate ? 'PUT' : 'POST';
    
    const response = await fetch(endpoint, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...(isUpdate && { id: dossier.id }),
        titre: dossier.title,
        beneficiaire_nom: dossier.employeeName?.split(' ').pop() || '',
        beneficiaire_prenom: dossier.employeeName?.split(' ')[0] || '',
        entreprise_siret: dossier.companyId,
        montant_estime: dossier.amount,
        date_debut: dossier.startDate,
        statut: isUpdate ? undefined : 'brouillon'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save dossier');
    }
    
    const data = await response.json();
    
    if (data.success && data.dossier) {
      const saved = data.dossier;
      return {
        id: saved.id?.toString() || '',
        title: saved.titre || '',
        description: `${saved.beneficiaire_prenom || ''} ${saved.beneficiaire_nom || ''}`.trim(),
        employeeName: `${saved.beneficiaire_prenom || ''} ${saved.beneficiaire_nom || ''}`.trim(),
        companyId: saved.entreprise_siret || '',
        status: mapStatus(saved.statut),
        amount: parseFloat(saved.montant_estime) || 0,
        startDate: saved.date_debut || '',
        createdAt: saved.created_at || ''
      };
    }
    
    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Error saving dossier:', error);
    throw error;
  }
};

/**
 * Update dossier fields
 */
export const updateDossier = async (id: string, updates: any): Promise<any> => {
  try {
    const response = await fetch('/api/dossiers/update', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, ...updates })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update dossier');
    }
    
    const data = await response.json();
    return data.dossier;
  } catch (error) {
    console.error('Error updating dossier:', error);
    throw error;
  }
};

/**
 * Delete a dossier via backend API
 */
export const deleteDossier = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/dossiers/delete?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete dossier');
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting dossier:', error);
    throw error;
  }
};

/**
 * Upload document for a dossier
 */
export const uploadDocument = async (dossierId: string, file: File, type: string): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dossier_id', dossierId);
    formData.append('type', type);
    
    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeaders().Authorization || ''
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload document');
    }
    
    const data = await response.json();
    return data.document;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

/**
 * Get documents for a dossier
 */
export const getDocuments = async (dossierId: string): Promise<any[]> => {
  try {
    const response = await fetch(`/api/documents/list?dossier_id=${dossierId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }
    
    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (documentId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/documents/delete?id=${documentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete document');
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

/**
 * Admin: Get all dossiers with filters
 */
export const getAdminDossiers = async (filters: any = {}): Promise<any> => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/admin/dossiers/list?${params}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin dossiers');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching admin dossiers:', error);
    throw error;
  }
};

/**
 * Admin: Get statistics
 */
export const getAdminStats = async (): Promise<any> => {
  try {
    const response = await fetch('/api/admin/stats', {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin stats');
    }
    
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

/**
 * Admin: Validate dossier
 */
export const validateDossier = async (dossierId: string, montantValide: number, commentaire?: string): Promise<void> => {
  try {
    const response = await fetch('/api/admin/dossiers/validate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ dossier_id: dossierId, montant_valide: montantValide, commentaire })
    });
    
    if (!response.ok) {
      throw new Error('Failed to validate dossier');
    }
  } catch (error) {
    console.error('Error validating dossier:', error);
    throw error;
  }
};

/**
 * Admin: Send dossier to OPCO
 */
export const sendToOPCO = async (dossierId: string): Promise<void> => {
  try {
    const response = await fetch('/api/admin/dossiers/send-to-opco', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ dossier_id: dossierId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send to OPCO');
    }
  } catch (error) {
    console.error('Error sending to OPCO:', error);
    throw error;
  }
};

/**
 * Admin: Record OPCO response
 */
export const recordOPCOResponse = async (
  dossierId: string,
  accepted: boolean,
  motifRefus?: string,
  montantFinal?: number
): Promise<void> => {
  try {
    const response = await fetch('/api/admin/dossiers/opco-response', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        dossier_id: dossierId,
        accepted,
        motif_refus: motifRefus,
        montant_final: montantFinal
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to record OPCO response');
    }
  } catch (error) {
    console.error('Error recording OPCO response:', error);
    throw error;
  }
};

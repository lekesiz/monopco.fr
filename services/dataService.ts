import { Dossier, DossierStatus } from '../types';

/**
 * Fetch dossiers from backend API
 */
export const getDossiers = async (): Promise<Dossier[]> => {
  try {
    const response = await fetch('/api/dossiers/list');
    
    if (!response.ok) {
      console.error('Failed to fetch dossiers:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (data.success && Array.isArray(data.dossiers)) {
      // Map database fields to frontend Dossier type
      return data.dossiers.map((d: any) => ({
        id: d.id?.toString() || '',
        title: d.type_dossier === 'bilan' ? 'Bilan de Compétences' : 'Formation Professionnelle',
        description: `${d.beneficiaire_prenom} ${d.beneficiaire_nom}`,
        employeeName: `${d.beneficiaire_prenom} ${d.beneficiaire_nom}`,
        companyId: d.entreprise_id?.toString() || '',
        status: mapStatus(d.statut),
        amount: parseFloat(d.montant_estime) || 0,
        startDate: d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : '',
        createdAt: d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : ''
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching dossiers:', error);
    return [];
  }
};

/**
 * Map database status to DossierStatus enum
 */
function mapStatus(statut: string): DossierStatus {
  const statusMap: Record<string, DossierStatus> = {
    'brouillon': DossierStatus.DRAFT,
    'soumis': DossierStatus.SUBMITTED,
    'en_cours': DossierStatus.IN_PROGRESS,
    'valide': DossierStatus.VALIDATED,
    'rejete': DossierStatus.DRAFT
  };
  
  return statusMap[statut?.toLowerCase()] || DossierStatus.DRAFT;
}

/**
 * Save or update a dossier via backend API
 */
export const saveDossier = async (dossier: Partial<Dossier>): Promise<Dossier> => {
  try {
    const response = await fetch('/api/dossiers/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        titre: dossier.title,
        description: dossier.description,
        nom_beneficiaire: dossier.employeeName,
        entreprise_id: dossier.companyId ? parseInt(dossier.companyId) : null,
        montant: dossier.amount,
        date_debut: dossier.startDate,
        statut: 'nouveau'
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
        description: saved.description || '',
        employeeName: saved.nom_beneficiaire || '',
        companyId: saved.entreprise_id?.toString() || '',
        status: mapStatus(saved.statut),
        amount: parseFloat(saved.montant) || 0,
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
 * Delete a dossier via backend API
 */
export const deleteDossier = async (id: string) => {
  try {
    const response = await fetch(`/api/dossiers/delete?id=${id}`, {
      method: 'DELETE'
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

import { Dossier, DossierStatus } from '../types';

const STORAGE_KEY = 'monopco_dossiers';

const INITIAL_DATA: Dossier[] = [
  {
    id: '101',
    title: 'Formation React Avancé',
    description: 'Maîtrise des hooks et performance.',
    employeeName: 'Jean Dupont',
    companyId: '2',
    status: DossierStatus.VALIDATED,
    amount: 2500,
    startDate: '2023-10-15',
    createdAt: '2023-09-01'
  },
  {
    id: '102',
    title: 'Management Agile',
    description: 'Certification Scrum Master.',
    employeeName: 'Alice Durant',
    companyId: '2',
    status: DossierStatus.SUBMITTED,
    amount: 1800,
    startDate: '2023-11-20',
    createdAt: '2023-10-10'
  },
  {
    id: '103',
    title: 'Anglais Professionnel B2',
    description: 'Perfectionnement anglais des affaires.',
    employeeName: 'Marc Lefebvre',
    companyId: '2',
    status: DossierStatus.DRAFT,
    amount: 1200,
    startDate: '2024-01-10',
    createdAt: '2023-10-25'
  }
];

export const getDossiers = async (): Promise<Dossier[]> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  return JSON.parse(stored);
};

export const saveDossier = async (dossier: Partial<Dossier>): Promise<Dossier> => {
  const dossiers = await getDossiers();
  
  if (dossier.id) {
    // Update
    const index = dossiers.findIndex(d => d.id === dossier.id);
    const updated = { ...dossiers[index], ...dossier } as Dossier;
    dossiers[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dossiers));
    return updated;
  } else {
    // Create
    const newDossier: Dossier = {
      ...dossier,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split('T')[0],
      status: DossierStatus.DRAFT
    } as Dossier;
    dossiers.unshift(newDossier);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dossiers));
    return newDossier;
  }
};

export const deleteDossier = async (id: string) => {
    const dossiers = await getDossiers();
    const filtered = dossiers.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
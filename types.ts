export enum UserRole {
  ADMIN = 'ADMIN',
  COMPANY = 'COMPANY',
  EMPLOYEE = 'EMPLOYEE'
}

export enum DossierStatus {
  DRAFT = 'BROUILLON',
  SUBMITTED = 'SOUMIS',
  VALIDATED = 'VALIDÉ',
  REJECTED = 'REFUSÉ',
  PAID = 'PAYÉ'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyName?: string;
  siret?: string;
}

export interface Dossier {
  id: string;
  title: string;
  description: string;
  employeeName: string;
  companyId: string;
  status: DossierStatus;
  amount: number;
  startDate: string;
  createdAt: string;
  justification?: string;
}

export interface StatMetric {
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
}
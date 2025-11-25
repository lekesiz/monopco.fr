import { User, UserRole } from '../types';

// Mocked logged in user for demo purposes
// In a real app, this would check localStorage for a JWT
let currentUser: User | null = null;

const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@monopco.fr',
    name: 'Pierre Durand (Admin OPCO)',
    role: UserRole.ADMIN,
    companyName: 'OPCO Commerce'
  },
  {
    id: '2',
    email: 'rh@techsolutions.fr',
    name: 'Sophie Martin (RH)',
    role: UserRole.COMPANY,
    companyName: 'TechSolutions SAS',
    siret: '123 456 789 00012'
  },
  {
    id: '3',
    email: 'jean.dupont@techsolutions.fr',
    name: 'Jean Dupont',
    role: UserRole.EMPLOYEE,
    companyName: 'TechSolutions SAS'
  }
];

export const login = async (email: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email === email);
      if (user) {
        currentUser = user;
        localStorage.setItem('monopco_user', JSON.stringify(user));
        resolve(user);
      } else {
        // Default fallback for demo if email doesn't match predefined
        const fallbackUser = {
            ...MOCK_USERS[1],
            email: email,
            name: email.split('@')[0]
        };
        currentUser = fallbackUser;
        localStorage.setItem('monopco_user', JSON.stringify(fallbackUser));
        resolve(fallbackUser);
      }
    }, 800);
  });
};

export const logout = () => {
  currentUser = null;
  localStorage.removeItem('monopco_user');
  window.location.hash = '/login';
};

export const getCurrentUser = (): User | null => {
  if (currentUser) return currentUser;
  const stored = localStorage.getItem('monopco_user');
  if (stored) {
    currentUser = JSON.parse(stored);
    return currentUser;
  }
  return null;
};
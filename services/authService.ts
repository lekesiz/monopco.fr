import { User, UserRole } from '../types';

// API base URL
const API_BASE = '/api';

// Current user and token
let currentUser: User | null = null;
let authToken: string | null = null;

/**
 * Initialize auth from localStorage
 */
const initAuth = () => {
  const stored = localStorage.getItem('monopco_user');
  const token = localStorage.getItem('monopco_token');
  
  if (stored && token) {
    currentUser = JSON.parse(stored);
    authToken = token;
  }
};

// Initialize on load
initAuth();

/**
 * Get auth headers for API requests
 */
export const getAuthHeaders = () => {
  if (!authToken) {
    initAuth();
  }
  
  return {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
  };
};

/**
 * Login with email and password
 */
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur de connexion');
    }

    // Store user and token
    currentUser = {
      id: data.user.id.toString(),
      email: data.user.email,
      name: `${data.user.prenom || ''} ${data.user.nom || ''}`.trim() || data.user.email,
      role: data.user.role === 'admin' ? UserRole.ADMIN : UserRole.COMPANY,
      companyName: data.user.entreprise_nom || undefined,
      siret: data.user.entreprise_siret || undefined
    };

    authToken = data.token;

    localStorage.setItem('monopco_user', JSON.stringify(currentUser));
    localStorage.setItem('monopco_token', authToken);

    return currentUser;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register new user
 */
export const register = async (
  email: string,
  password: string,
  nom: string,
  prenom: string,
  entreprise_siret?: string
): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nom, prenom, entreprise_siret })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de l\'inscription');
    }

    // Store user and token
    currentUser = {
      id: data.user.id.toString(),
      email: data.user.email,
      name: `${prenom} ${nom}`.trim(),
      role: UserRole.COMPANY,
      companyName: undefined,
      siret: entreprise_siret
    };

    authToken = data.token;

    localStorage.setItem('monopco_user', JSON.stringify(currentUser));
    localStorage.setItem('monopco_token', authToken);

    return currentUser;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

/**
 * Forgot password
 */
export const forgotPassword = async (email: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la demande de réinitialisation');
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

/**
 * Reset password
 */
export const resetPassword = async (token: string, password: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la réinitialisation');
    }
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

/**
 * Logout
 */
export const logout = () => {
  currentUser = null;
  authToken = null;
  localStorage.removeItem('monopco_user');
  localStorage.removeItem('monopco_token');
  window.location.hash = '/login';
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  if (currentUser) return currentUser;
  initAuth();
  return currentUser;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getCurrentUser() && !!authToken;
};

/**
 * Check if user is admin
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === UserRole.ADMIN;
};

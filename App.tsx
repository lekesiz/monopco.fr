import React, { useEffect, useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { HashRouter } from './lib/wouter-hash';
import { Dashboard } from './pages/Dashboard';
import { Dossiers } from './pages/Dossiers';
import { DossierForm } from './pages/DossierForm';
import { Login } from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import DetailDossier from './pages/DetailDossier';
import Basvuru from './pages/Basvuru';
import MentionsLegales from './pages/MentionsLegales';
import CGU from './pages/CGU';
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDossiers } from './pages/AdminDossiers';
import { AdminUsers } from './pages/AdminUsers';
import Users from './pages/Users';
import NotFound from './pages/NotFound';
import { getCurrentUser } from './services/authService';

function AppContent() {
  const [location, navigate] = useLocation();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    const publicPaths = ['/login', '/register', '/home', '/', '/basvuru', '/mentions-legales', '/cgu', '/politique-confidentialite', '/forgot-password', '/reset-password'];
    if (!user && !publicPaths.includes(location)) {
      navigate('/home');
    } else {
      setIsAuth(!!user);
    }
  }, [location, navigate]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dossiers" component={Dossiers} />
      <Route path="/dossier/new" component={DossierForm} />
      <Route path="/dossier/edit/:id" component={DossierForm} />
      <Route path="/dossier/:id" component={DetailDossier} />
      <Route path="/basvuru" component={Basvuru} />
      <Route path="/mentions-legales" component={MentionsLegales} />
      <Route path="/cgu" component={CGU} />
      <Route path="/politique-confidentialite" component={PolitiqueConfidentialite} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/profile" component={Profile} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/dossiers" component={AdminDossiers} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/users" component={Users} />
      {/* Fallback - 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
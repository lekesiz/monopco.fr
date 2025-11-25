import React, { useEffect, useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { HashRouter } from './lib/wouter-hash';
import { Dashboard } from './pages/Dashboard';
import { Dossiers } from './pages/Dossiers';
import { DossierForm } from './pages/DossierForm';
import { Login } from './pages/Login';
import Home from './pages/Home';
import DetailDossier from './pages/DetailDossier';
import Basvuru from './pages/Basvuru';
import MentionsLegales from './pages/MentionsLegales';
import CGU from './pages/CGU';
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite';
import { getCurrentUser } from './services/authService';

function AppContent() {
  const [location, navigate] = useLocation();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    const publicPaths = ['/login', '/home', '/', '/basvuru', '/mentions-legales', '/cgu', '/politique-confidentialite'];
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
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dossiers" component={Dossiers} />
      <Route path="/dossier/new" component={DossierForm} />
      <Route path="/dossier/edit/:id" component={DossierForm} />
      <Route path="/dossier/:id" component={DetailDossier} />
      <Route path="/basvuru" component={Basvuru} />
      <Route path="/mentions-legales" component={MentionsLegales} />
      <Route path="/cgu" component={CGU} />
      <Route path="/politique-confidentialite" component={PolitiqueConfidentialite} />
      {/* Fallback */}
      <Route>
        {isAuth ? <Dashboard /> : <Home />}
      </Route>
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
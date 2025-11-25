import React, { useEffect, useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { HashRouter } from './lib/wouter-hash';
import { Dashboard } from './pages/Dashboard';
import { Dossiers } from './pages/Dossiers';
import { DossierForm } from './pages/DossierForm';
import { Login } from './pages/Login';
import { getCurrentUser } from './services/authService';

function AppContent() {
  const [location, navigate] = useLocation();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user && location !== '/login') {
      navigate('/login');
    } else {
      setIsAuth(!!user);
    }
  }, [location, navigate]);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/dossiers" component={Dossiers} />
      <Route path="/dossier/new" component={DossierForm} />
      <Route path="/dossier/edit/:id" component={DossierForm} />
      {/* Fallback */}
      <Route>
        {isAuth ? <Dashboard /> : <Login />}
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
import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Briefcase
} from 'lucide-react';
import { getCurrentUser, logout } from '../services/authService';
import { UserRole } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const user = getCurrentUser();

  const isActive = (path: string) => location === path;

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const navItems = [
    { label: 'Tableau de bord', path: '/', icon: LayoutDashboard },
    { label: 'Dossiers', path: '/dossiers', icon: FileText },
    { label: 'Mon Profil', path: '/profile', icon: Briefcase },
  ];

  if (user?.role === UserRole.ADMIN) {
    navItems.push({ label: 'Utilisateurs', path: '/users', icon: Users });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            MonOPCO
          </span>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a className={`
                group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                ${isActive(item.path) 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
              `}>
                <item.icon className={`mr-3 h-5 w-5 ${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {item.label}
              </a>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate w-32">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm h-16 flex items-center px-4 justify-between">
          <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-slate-800">MonOPCO</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
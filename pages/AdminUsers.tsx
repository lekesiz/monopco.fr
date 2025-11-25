import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Search, UserPlus, Mail, Phone, Building2, Calendar, MoreVertical } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  siret: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin: string;
  dossiersCount: number;
  totalAmount: number;
}

export const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Mock data
  const [users] = useState<User[]>([
    {
      id: 1,
      firstName: 'Mikail',
      lastName: 'Lekesiz',
      email: 'mikail@netz-informatique.fr',
      phone: '+33 6 12 34 56 78',
      companyName: 'Netz Informatique',
      siret: '84899333300018',
      role: 'user',
      createdAt: '2025-01-15',
      lastLogin: '2025-11-25',
      dossiersCount: 3,
      totalAmount: 32000,
    },
    {
      id: 2,
      firstName: 'Pierre',
      lastName: 'Durand',
      email: 'admin@monopco.fr',
      phone: '+33 6 98 76 54 32',
      companyName: 'MonOPCO',
      siret: '12345678900012',
      role: 'admin',
      createdAt: '2025-01-01',
      lastLogin: '2025-11-25',
      dossiersCount: 0,
      totalAmount: 0,
    },
    {
      id: 3,
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie@entreprise.fr',
      phone: '+33 6 11 22 33 44',
      companyName: 'Entreprise Martin',
      siret: '98765432100019',
      role: 'user',
      createdAt: '2025-02-10',
      lastLogin: '2025-11-20',
      dossiersCount: 2,
      totalAmount: 18000,
    },
  ]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-500 mt-1">Gérez tous les utilisateurs de la plateforme.</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Nouvel Utilisateur
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Rechercher par nom, email ou entreprise..." 
                className="pl-10 w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tous les rôles</option>
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{filteredUsers.length} utilisateur(s) trouvé(s)</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activité</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dossiers</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail className="h-3 w-3 mr-1 text-gray-400" />
                      {user.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Phone className="h-3 w-3 mr-1 text-gray-400" />
                      {user.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Building2 className="h-3 w-3 mr-1 text-gray-400" />
                      {user.companyName}
                    </div>
                    <div className="text-sm text-gray-500">{user.siret}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                      {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Dernière connexion</div>
                    <div className="text-sm text-gray-500">{new Date(user.lastLogin).toLocaleDateString('fr-FR')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.dossiersCount} dossier(s)</div>
                    <div className="text-sm text-gray-500">{user.totalAmount.toLocaleString('fr-FR')} €</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              Aucun utilisateur trouvé.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

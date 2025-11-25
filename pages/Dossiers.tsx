import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { getDossiers, saveDossier } from '../services/dataService';
import { Dossier, DossierStatus } from '../types';
import { Plus, Search, Filter, FileText } from 'lucide-react';
import { useLocation } from 'wouter';

export const Dossiers: React.FC = () => {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getDossiers().then(setDossiers);
  }, []);

  const getStatusColor = (status: DossierStatus) => {
    switch (status) {
      case DossierStatus.VALIDATED: return 'bg-emerald-100 text-emerald-800';
      case DossierStatus.SUBMITTED: return 'bg-amber-100 text-amber-800';
      case DossierStatus.REJECTED: return 'bg-red-100 text-red-800';
      case DossierStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDossiers = dossiers.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dossiers de Formation</h1>
          <p className="text-gray-500 mt-1">Gérez vos demandes de prise en charge.</p>
        </div>
        <Button onClick={() => navigate('/dossier/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Dossier
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Rechercher par formation ou salarié..." 
              className="pl-10 w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="hidden sm:flex">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formation</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salarié</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Début</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDossiers.map((dossier) => (
                <tr key={dossier.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText size={20} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{dossier.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{dossier.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dossier.employeeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dossier.amount.toLocaleString('fr-FR')} €</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{new Date(dossier.startDate).toLocaleDateString('fr-FR')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(dossier.status)}`}>
                      {dossier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a 
                      href="#" 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={(e) => { e.preventDefault(); navigate(`/dossier/edit/${dossier.id}`); }}
                    >
                      Voir
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDossiers.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              Aucun dossier trouvé.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
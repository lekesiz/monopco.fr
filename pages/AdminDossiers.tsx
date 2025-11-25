import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { getDossiers } from '../services/dataService';
import { Dossier, DossierStatus } from '../types';
import { Search, Filter, Download, CheckCircle, XCircle, Send, FileText } from 'lucide-react';
import { useLocation } from 'wouter';

export const AdminDossiers: React.FC = () => {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [opcoFilter, setOpcoFilter] = useState<string>('all');

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

  const filteredDossiers = dossiers.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         d.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesOpco = opcoFilter === 'all' || d.opco === opcoFilter;
    return matchesSearch && matchesStatus && matchesOpco;
  });

  const handleValidate = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir valider ce dossier ?')) {
      alert(`Dossier ${id} validé !`);
      // Update dossier status
    }
  };

  const handleReject = (id: number) => {
    const reason = prompt('Raison du rejet :');
    if (reason) {
      alert(`Dossier ${id} rejeté : ${reason}`);
      // Update dossier status
    }
  };

  const handleSendToOpco = (id: number) => {
    if (confirm('Envoyer ce dossier à l\'OPCO ?')) {
      alert(`Dossier ${id} envoyé à l'OPCO !`);
      // Send to OPCO
    }
  };

  const handleExport = () => {
    alert('Export Excel en cours...');
    // Export to Excel
  };

  const uniqueOpcos = Array.from(new Set(dossiers.map(d => d.opco)));

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Dossiers</h1>
          <p className="text-gray-500 mt-1">Gérez tous les dossiers de formation de la plateforme.</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exporter Excel
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
                placeholder="Rechercher par formation, salarié ou entreprise..." 
                className="pl-10 w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value={DossierStatus.DRAFT}>Brouillon</option>
              <option value={DossierStatus.SUBMITTED}>En attente</option>
              <option value={DossierStatus.VALIDATED}>Validé</option>
              <option value={DossierStatus.REJECTED}>Rejeté</option>
            </select>
            <select 
              className="rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
              value={opcoFilter}
              onChange={(e) => setOpcoFilter(e.target.value)}
            >
              <option value="all">Tous les OPCO</option>
              {uniqueOpcos.map(opco => (
                <option key={opco} value={opco}>{opco}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{filteredDossiers.length} dossier(s) trouvé(s)</span>
            <span>Total: {filteredDossiers.reduce((acc, d) => acc + d.amount, 0).toLocaleString('fr-FR')} €</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formation</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salarié</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OPCO</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDossiers.map((dossier) => (
                <tr key={dossier.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{dossier.companyName}</div>
                    <div className="text-sm text-gray-500">{dossier.siret}</div>
                  </td>
                  <td className="px-6 py-4">
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
                    <div className="text-sm text-gray-900">{dossier.opco}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dossier.amount.toLocaleString('fr-FR')} €</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(dossier.status)}`}>
                      {dossier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {dossier.status === DossierStatus.SUBMITTED && (
                        <>
                          <button
                            onClick={() => handleValidate(dossier.id)}
                            className="text-emerald-600 hover:text-emerald-900"
                            title="Valider"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleReject(dossier.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Rejeter"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {dossier.status === DossierStatus.VALIDATED && (
                        <button
                          onClick={() => handleSendToOpco(dossier.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Envoyer à l'OPCO"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      )}
                      <a 
                        href={`/#/admin/dossiers/${dossier.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Voir
                      </a>
                    </div>
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

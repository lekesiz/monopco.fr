import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Layout } from '../components/Layout';
import { getDossiers } from '../services/dataService';
import { Dossier, DossierStatus } from '../types';
import { FileText, Euro, Building2, Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; trend?: string }> = ({ title, value, icon, color, trend }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <p className="text-sm text-emerald-600 mt-1 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        {React.cloneElement(icon as React.ReactElement, { className: `h-6 w-6 ${color.replace('bg-', 'text-')}` })}
      </div>
    </div>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);

  useEffect(() => {
    getDossiers().then(setDossiers);
  }, []);

  const totalAmount = dossiers.reduce((acc, d) => acc + d.amount, 0);
  const validatedCount = dossiers.filter(d => d.status === DossierStatus.VALIDATED).length;
  const pendingCount = dossiers.filter(d => d.status === DossierStatus.SUBMITTED).length;
  const rejectedCount = dossiers.filter(d => d.status === DossierStatus.REJECTED).length;
  const companies = new Set(dossiers.map(d => d.companyName)).size;

  // Monthly data
  const monthlyData = [
    { name: 'Jan', dossiers: 12, montant: 45000 },
    { name: 'Fév', dossiers: 15, montant: 52000 },
    { name: 'Mar', dossiers: 8, montant: 28000 },
    { name: 'Avr', dossiers: 18, montant: 65000 },
    { name: 'Mai', dossiers: 22, montant: 78000 },
    { name: 'Juin', dossiers: 25, montant: 89000 },
  ];

  // OPCO distribution
  const opcoData = [
    { name: 'OPCOMMERCE', value: 35, color: '#3b82f6' },
    { name: 'OPCO EP', value: 25, color: '#8b5cf6' },
    { name: 'AFDAS', value: 20, color: '#10b981' },
    { name: 'Constructys', value: 15, color: '#f59e0b' },
    { name: 'Autres', value: 5, color: '#6b7280' },
  ];

  // Status distribution
  const statusData = [
    { name: 'Validés', value: validatedCount, color: '#10b981' },
    { name: 'En attente', value: pendingCount, color: '#f59e0b' },
    { name: 'Rejetés', value: rejectedCount, color: '#ef4444' },
    { name: 'Brouillons', value: dossiers.filter(d => d.status === DossierStatus.DRAFT).length, color: '#6b7280' },
  ];

  // Recent activity
  const recentActivity = dossiers.slice(0, 5).map(d => ({
    id: d.id,
    company: d.companyName,
    employee: d.employeeName,
    amount: d.amount,
    status: d.status,
    date: d.createdAt,
  }));

  const getStatusColor = (status: DossierStatus) => {
    switch (status) {
      case DossierStatus.VALIDATED: return 'bg-emerald-100 text-emerald-800';
      case DossierStatus.SUBMITTED: return 'bg-amber-100 text-amber-800';
      case DossierStatus.REJECTED: return 'bg-red-100 text-red-800';
      case DossierStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrateur</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble de la plateforme MonOPCO.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Engagé" 
          value={`${totalAmount.toLocaleString('fr-FR')} €`} 
          icon={<Euro />} 
          color="bg-blue-500"
          trend="+12% vs mois dernier"
        />
        <StatCard 
          title="Dossiers Totaux" 
          value={dossiers.length.toString()} 
          icon={<FileText />} 
          color="bg-indigo-500"
          trend="+8% vs mois dernier"
        />
        <StatCard 
          title="Entreprises" 
          value={companies.toString()} 
          icon={<Building2 />} 
          color="bg-purple-500"
          trend="+3 nouvelles"
        />
        <StatCard 
          title="Utilisateurs" 
          value="42" 
          icon={<Users />} 
          color="bg-pink-500"
          trend="+5 ce mois"
        />
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Validés</p>
              <p className="text-2xl font-bold text-emerald-600">{validatedCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rejetés</p>
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Brouillons</p>
              <p className="text-2xl font-bold text-gray-600">{dossiers.filter(d => d.status === DossierStatus.DRAFT).length}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Évolution Mensuelle</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="dossiers" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Dossiers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* OPCO Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Répartition par OPCO</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={opcoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {opcoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Activité Récente</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salarié</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{activity.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{activity.employee}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{activity.amount.toLocaleString('fr-FR')} €</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString('fr-FR')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href={`/#/admin/dossiers/${activity.id}`} className="text-blue-600 hover:text-blue-900">
                      Voir
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Layout } from '../components/Layout';
import { getDossiers } from '../services/dataService';
import { Dossier, DossierStatus } from '../types';
import { FileText, Euro, CheckCircle, Clock } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        {React.cloneElement(icon as React.ReactElement, { className: `h-6 w-6 ${color.replace('bg-', 'text-')}` })}
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);

  useEffect(() => {
    getDossiers().then(setDossiers);
  }, []);

  const totalAmount = dossiers.reduce((acc, d) => acc + d.amount, 0);
  const validatedCount = dossiers.filter(d => d.status === DossierStatus.VALIDATED).length;
  const pendingCount = dossiers.filter(d => d.status === DossierStatus.SUBMITTED).length;

  const data = [
    { name: 'Jan', amount: 4000 },
    { name: 'Fév', amount: 3000 },
    { name: 'Mar', amount: 2000 },
    { name: 'Avr', amount: 2780 },
    { name: 'Mai', amount: 1890 },
    { name: 'Juin', amount: 2390 },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble de vos formations et financements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Engagé" 
          value={`${totalAmount.toLocaleString('fr-FR')} €`} 
          icon={<Euro />} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Dossiers Déposés" 
          value={dossiers.length.toString()} 
          icon={<FileText />} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="En attente" 
          value={pendingCount.toString()} 
          icon={<Clock />} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Validés" 
          value={validatedCount.toString()} 
          icon={<CheckCircle />} 
          color="bg-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Évolution du Budget Formation</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                   {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="space-y-4">
            <a href="/#/dossier/new" className="w-full flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200">
                <FileText size={20} />
              </div>
              <div className="ml-4 text-left">
                <p className="font-medium text-gray-900">Nouveau Dossier</p>
                <p className="text-sm text-gray-500">Créer une demande de prise en charge</p>
              </div>
            </a>
            
            <a href="/#/dossiers" className="w-full flex items-center p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-200">
                <CheckCircle size={20} />
              </div>
              <div className="ml-4 text-left">
                <p className="font-medium text-gray-900">Mes Dossiers</p>
                <p className="text-sm text-gray-500">{dossiers.length} dossier(s)</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};
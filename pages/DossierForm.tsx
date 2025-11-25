import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { saveDossier, getDossiers } from '../services/dataService';
import { improveJustification, analyzeCompliance } from '../services/geminiService';
import { Dossier, DossierStatus } from '../types';
import { Sparkles, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

export const DossierForm: React.FC = () => {
  const [, params] = useRoute('/dossier/edit/:id');
  const [, navigate] = useLocation();
  const isEdit = !!params?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<{compliant: boolean, advice: string} | null>(null);

  const [formData, setFormData] = useState<Partial<Dossier>>({
    title: '',
    description: '',
    employeeName: '',
    amount: 0,
    startDate: '',
    status: DossierStatus.DRAFT
  });

  useEffect(() => {
    if (isEdit && params?.id) {
      getDossiers().then(list => {
        const found = list.find(d => d.id === params.id);
        if (found) setFormData(found);
      });
    }
  }, [isEdit, params?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
  };

  const handleImprove = async () => {
    if (!formData.description) return;
    setIsImproving(true);
    const improved = await improveJustification(
        formData.title || "Formation", 
        formData.description
    );
    setFormData(prev => ({ ...prev, description: improved }));
    setIsImproving(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Quick AI check before saving
    const compliance = await analyzeCompliance(formData);
    setAiAdvice(compliance);
    
    // Simulate slight network delay
    setTimeout(async () => {
      await saveDossier(formData);
      setIsLoading(false);
      navigate('/dossiers');
    }, 1000);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Button 
            variant="ghost" 
            className="mb-6 pl-0 hover:bg-transparent"
            onClick={() => navigate('/dossiers')}
        >
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux dossiers
        </Button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
            <h1 className="text-xl font-bold text-gray-900">
              {isEdit ? 'Modifier le Dossier' : 'Nouvelle Demande de Prise en Charge'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Remplissez les informations ci-dessous pour soumettre votre dossier à l'OPCO.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Titre de la formation</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Anglais B2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Salarié concerné</label>
                <input
                  type="text"
                  name="employeeName"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.employeeName}
                  onChange={handleChange}
                  placeholder="Nom Prénom"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Coût HT (€)</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.amount}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date de début</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Objectifs & Justification</label>
                <button
                  type="button"
                  onClick={handleImprove}
                  disabled={isImproving || !formData.description}
                  className="text-xs flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {isImproving ? 'Amélioration...' : 'Améliorer avec IA'}
                </button>
              </div>
              <textarea
                name="description"
                required
                rows={6}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez les objectifs pédagogiques et l'intérêt pour l'entreprise..."
              />
              <p className="text-xs text-gray-500">
                Utilisez l'assistant IA pour rendre votre justification plus professionnelle et conforme aux attentes des OPCOs.
              </p>
            </div>

            {aiAdvice && (
                <div className={`p-4 rounded-md flex items-start ${aiAdvice.compliant ? 'bg-green-50' : 'bg-amber-50'}`}>
                    {aiAdvice.compliant ? <CheckCircle className="text-green-600 h-5 w-5 mt-0.5 mr-2" /> : <AlertTriangle className="text-amber-600 h-5 w-5 mt-0.5 mr-2" />}
                    <div>
                        <p className={`text-sm font-medium ${aiAdvice.compliant ? 'text-green-800' : 'text-amber-800'}`}>
                            Analyse prédictive IA
                        </p>
                        <p className={`text-sm mt-1 ${aiAdvice.compliant ? 'text-green-700' : 'text-amber-700'}`}>
                            {aiAdvice.advice}
                        </p>
                    </div>
                </div>
            )}

            <div className="pt-4 flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate('/dossiers')}>
                Annuler
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {isEdit ? 'Mettre à jour' : 'Soumettre le dossier'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
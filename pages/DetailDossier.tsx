import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';

const STATUT_LABELS = {
  brouillon: 'Brouillon',
  nouveau: 'Nouveau',
  phase1: 'Phase 1 - Préliminaire',
  phase2: 'Phase 2 - Investigation',
  phase3: 'Phase 3 - Conclusion',
  termine: 'Terminé',
  facture: 'Facturé'
};

const STATUT_COLORS = {
  brouillon: 'bg-gray-100 text-gray-800',
  nouveau: 'bg-blue-100 text-blue-800',
  phase1: 'bg-yellow-100 text-yellow-800',
  phase2: 'bg-orange-100 text-orange-800',
  phase3: 'bg-purple-100 text-purple-800',
  termine: 'bg-green-100 text-green-800',
  facture: 'bg-emerald-100 text-emerald-800'
};

export default function DetailDossier() {
  const [, params] = useRoute('/dossier/:id');
  const dossierId = params?.id;
  
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dossierId) return;

    const fetchDossier = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dossiers/detail?id=${dossierId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement du dossier');
        }

        const data = await response.json();
        setDossier(data.dossier);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDossier();
  }, [dossierId]);

  const handleGeneratePDF = async (type) => {
    try {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type,
          dossierId: dossier.id
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${dossierId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dossier introuvable</h2>
          <p className="text-gray-600 mb-6">
            {error || 'Le dossier demandé n\'existe pas ou vous n\'avez pas les permissions pour y accéder.'}
          </p>
          <Link href="/dashboard">
            <a className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Retour au tableau de bord
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <a className="text-gray-600 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </a>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dossier #{dossier.id}
                </h1>
                <p className="text-sm text-gray-500">
                  {dossier.beneficiaire_prenom} {dossier.beneficiaire_nom}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUT_COLORS[dossier.statut] || 'bg-gray-100 text-gray-800'}`}>
              {STATUT_LABELS[dossier.statut] || dossier.statut}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Beneficiary Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du bénéficiaire</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">{dossier.beneficiaire_prenom} {dossier.beneficiaire_nom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{dossier.beneficiaire_email}</p>
                </div>
                {dossier.beneficiaire_telephone && (
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium">{dossier.beneficiaire_telephone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dossier Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails du dossier</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium capitalize">{dossier.type_dossier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Montant estimé</p>
                  <p className="font-medium">{dossier.montant_estime ? `${dossier.montant_estime} €` : 'Non renseigné'}</p>
                </div>
                {dossier.date_debut && (
                  <div>
                    <p className="text-sm text-gray-500">Date de début</p>
                    <p className="font-medium">{new Date(dossier.date_debut).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {dossier.date_fin && (
                  <div>
                    <p className="text-sm text-gray-500">Date de fin</p>
                    <p className="font-medium">{new Date(dossier.date_fin).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {dossier.heures_total && (
                  <div>
                    <p className="text-sm text-gray-500">Heures</p>
                    <p className="font-medium">{dossier.heures_realisees || 0} / {dossier.heures_total}h</p>
                  </div>
                )}
              </div>
              {dossier.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="mt-1 text-gray-900">{dossier.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => handleGeneratePDF('convention')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  📄 Générer Convention
                </button>
                <button
                  onClick={() => handleGeneratePDF('attestation')}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  ✅ Générer Attestation
                </button>
                <button
                  onClick={() => handleGeneratePDF('synthese')}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium"
                >
                  📊 Générer Synthèse
                </button>
                <button
                  onClick={() => handleGeneratePDF('demande')}
                  className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm font-medium"
                >
                  📝 Générer Demande OPCO
                </button>
                <button
                  onClick={() => handleGeneratePDF('facture')}
                  className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium"
                >
                  💰 Générer Facture
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dossier créé</p>
                    <p className="text-xs text-gray-500">
                      {new Date(dossier.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                {dossier.updated_at !== dossier.created_at && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-green-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Dernière mise à jour</p>
                      <p className="text-xs text-gray-500">
                        {new Date(dossier.updated_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { CheckCircle, XCircle, Send, FileCheck, Clock, AlertCircle } from 'lucide-react';

interface StatusChangerProps {
  dossierId: number;
  currentStatus: string;
  onStatusChanged?: () => void;
  isAdmin?: boolean;
}

export const StatusChanger: React.FC<StatusChangerProps> = ({ 
  dossierId, 
  currentStatus, 
  onStatusChanged,
  isAdmin = false
}) => {
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMotifRefus, setShowMotifRefus] = useState(false);
  const [motifRefus, setMotifRefus] = useState('');

  const statusConfig = {
    'brouillon': {
      label: 'Brouillon',
      color: 'bg-gray-100 text-gray-800',
      icon: Clock,
      nextStatuses: ['en_cours', 'soumis']
    },
    'en_cours': {
      label: 'En cours',
      color: 'bg-blue-100 text-blue-800',
      icon: Clock,
      nextStatuses: ['soumis', 'brouillon']
    },
    'soumis': {
      label: 'Soumis à l\'OPCO',
      color: 'bg-yellow-100 text-yellow-800',
      icon: Send,
      nextStatuses: isAdmin ? ['valide', 'refuse', 'en_cours'] : []
    },
    'valide': {
      label: 'Validé',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      nextStatuses: ['termine']
    },
    'refuse': {
      label: 'Refusé',
      color: 'bg-red-100 text-red-800',
      icon: XCircle,
      nextStatuses: ['en_cours']
    },
    'termine': {
      label: 'Terminé',
      color: 'bg-purple-100 text-purple-800',
      icon: FileCheck,
      nextStatuses: []
    }
  };

  const currentConfig = statusConfig[currentStatus] || statusConfig['brouillon'];
  const CurrentIcon = currentConfig.icon;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'refuse' && !motifRefus) {
      setShowMotifRefus(true);
      return;
    }

    setChanging(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dossiers/change-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dossierId,
          newStatus,
          motifRefus: newStatus === 'refuse' ? motifRefus : undefined,
          sendNotification: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Statut mis à jour: ${data.newStatus}`);
        setShowMotifRefus(false);
        setMotifRefus('');
        
        if (onStatusChanged) {
          onStatusChanged();
        }

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);

      } else {
        setError(data.error || 'Erreur lors du changement de statut');
      }

    } catch (error) {
      console.error('Status change error:', error);
      setError('Erreur lors du changement de statut');
    } finally {
      setChanging(false);
    }
  };

  if (currentConfig.nextStatuses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-3">
          <CurrentIcon className="h-6 w-6 text-gray-600" />
          <div>
            <p className="text-sm text-gray-600">Statut actuel</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${currentConfig.color}`}>
              {currentConfig.label}
            </span>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Ce dossier est dans un état final. Aucune action disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Gestion du statut</h3>

      {/* Current Status */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Statut actuel</p>
        <div className="flex items-center gap-3">
          <CurrentIcon className="h-6 w-6 text-gray-600" />
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${currentConfig.color}`}>
            {currentConfig.label}
          </span>
        </div>
      </div>

      {/* Next Status Options */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Changer le statut vers :</p>
        <div className="space-y-2">
          {currentConfig.nextStatuses.map((nextStatus) => {
            const nextConfig = statusConfig[nextStatus];
            const NextIcon = nextConfig.icon;

            return (
              <button
                key={nextStatus}
                onClick={() => handleStatusChange(nextStatus)}
                disabled={changing}
                className={`
                  w-full flex items-center gap-3 p-3 border-2 rounded-lg transition-all
                  ${changing 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:border-blue-500 hover:bg-blue-50'
                  }
                  border-gray-200
                `}
              >
                <NextIcon className="h-5 w-5 text-gray-600" />
                <span className="flex-1 text-left font-medium text-gray-900">
                  {nextConfig.label}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs ${nextConfig.color}`}>
                  {nextStatus}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Motif de refus */}
      {showMotifRefus && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <label className="block text-sm font-medium text-red-900 mb-2">
            Motif de refus (requis)
          </label>
          <textarea
            value={motifRefus}
            onChange={(e) => setMotifRefus(e.target.value)}
            placeholder="Expliquez la raison du refus..."
            className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={3}
            disabled={changing}
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => handleStatusChange('refuse')}
              disabled={changing || !motifRefus.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmer le refus
            </button>
            <button
              onClick={() => {
                setShowMotifRefus(false);
                setMotifRefus('');
              }}
              disabled={changing}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500 mt-4">
        ℹ️ Un email de notification sera automatiquement envoyé lors du changement de statut.
      </p>
    </div>
  );
};

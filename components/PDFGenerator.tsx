import React, { useState } from 'react';
import { FileText, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface PDFGeneratorProps {
  dossierId: number;
  onGenerated?: () => void;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({ dossierId, onGenerated }) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedType, setSelectedType] = useState('convention');

  const documentTypes = [
    { value: 'convention', label: 'Convention de formation', description: 'Convention tripartite pour le bilan de compétences' },
    { value: 'demande', label: 'Demande de prise en charge', description: 'Document de demande de financement OPCO' },
    { value: 'attestation', label: 'Attestation de présence', description: 'Attestation de présence aux séances' },
    { value: 'synthese', label: 'Synthèse du bilan', description: 'Synthèse des compétences identifiées' },
    { value: 'facture', label: 'Facture', description: 'Facture pour la formation' }
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/documents/generate-and-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: selectedType,
          dossierId,
          saveToBlob: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`${documentTypes.find(t => t.value === selectedType)?.label} généré avec succès`);
        
        // Download the PDF
        const link = document.createElement('a');
        link.href = data.pdf;
        link.download = data.documentName;
        link.click();

        if (onGenerated) {
          onGenerated();
        }

        // Reset after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);

      } else {
        setError(data.error || 'Erreur lors de la génération du PDF');
      }

    } catch (error) {
      console.error('Generate PDF error:', error);
      setError('Erreur lors de la génération du PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        Générer un document PDF
      </h3>

      {/* Document Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Type de document
        </label>
        <div className="space-y-2">
          {documentTypes.map((type) => (
            <label
              key={type.value}
              className={`
                flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all
                ${selectedType === type.value 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
                }
                ${generating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                name="documentType"
                value={type.value}
                checked={selectedType === type.value}
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={generating}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{type.label}</div>
                <div className="text-sm text-gray-600 mt-0.5">{type.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

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

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2
          ${generating 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        `}
      >
        {generating ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            Génération en cours...
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            Générer et télécharger le PDF
          </>
        )}
      </button>

      <p className="mt-3 text-xs text-gray-500 text-center">
        Le document sera automatiquement sauvegardé dans les documents du dossier
      </p>
    </div>
  );
};

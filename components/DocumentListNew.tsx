import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Eye, AlertCircle } from 'lucide-react';

interface Document {
  id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  document_type: string;
  uploaded_at: string;
  uploaded_by_name?: string;
  uploaded_by_prenom?: string;
}

interface DocumentListProps {
  dossierId: number;
  refresh?: number;
}

export const DocumentListNew: React.FC<DocumentListProps> = ({ dossierId, refresh }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [dossierId, refresh]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/list?dossier_id=${dossierId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents || []);
      } else {
        setError(data.error || 'Erreur lors de la récupération des documents');
      }

    } catch (error) {
      console.error('Fetch documents error:', error);
      setError('Erreur lors de la récupération des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/download?id=${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Open the Blob URL in a new tab
        window.open(data.url, '_blank');
      } else {
        alert(data.error || 'Erreur lors du téléchargement');
      }

    } catch (error) {
      console.error('Download error:', error);
      alert('Erreur lors du téléchargement du document');
    }
  };

  const handleDelete = async (documentId: number, fileName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le document "${fileName}" ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/delete?id=${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the list
        fetchDocuments();
      } else {
        alert(data.error || 'Erreur lors de la suppression');
      }

    } catch (error) {
      console.error('Delete error:', error);
      alert('Erreur lors de la suppression du document');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentTypeLabel = (type: string): string => {
    const types: Record<string, string> = {
      'convention': 'Convention de formation',
      'calendrier': 'Calendrier prévisionnel',
      'attestation': 'Attestation',
      'facture': 'Facture',
      'justificatif': 'Justificatif',
      'autre': 'Autre'
    };
    return types[type] || 'Document';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement des documents...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Documents ({documents.length})</h3>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p>Aucun document pour ce dossier</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <FileText className="h-8 w-8 text-blue-500 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {doc.file_name}
                    </h4>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {getDocumentTypeLabel(doc.document_type)}
                      </span>
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>{formatDate(doc.uploaded_at)}</span>
                      {doc.uploaded_by_name && (
                        <span>
                          par {doc.uploaded_by_prenom} {doc.uploaded_by_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleDownload(doc.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Télécharger"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id, doc.file_name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { File, Download, Trash2, Eye, AlertCircle } from 'lucide-react';
import { getDocuments, deleteDocument } from '../services/dataService';

interface DocumentListProps {
  dossierId: string;
  refreshTrigger?: number;
}

export const DocumentList: React.FC<DocumentListProps> = ({ dossierId, refreshTrigger }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [dossierId, refreshTrigger]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getDocuments(dossierId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      setDeleting(documentId);
      await deleteDocument(documentId);
      await loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Erreur lors de la suppression du document');
    } finally {
      setDeleting(null);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return '🖼️';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <File className="w-12 h-12 mb-3 text-gray-300" />
          <p className="text-sm">Aucun document pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <File className="w-5 h-5 text-blue-600" />
          Documents ({documents.length})
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {documents.map((doc) => (
          <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{getFileIcon(doc.filename)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.filename}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(doc.file_size)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(doc.uploaded_at)}
                    </span>
                    {doc.type && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {doc.type}
                      </span>
                    )}
                  </div>
                  {doc.uploaded_by_name && (
                    <p className="text-xs text-gray-500 mt-1">
                      Par {doc.uploaded_by_prenom} {doc.uploaded_by_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <a
                  href={doc.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <a
                  href={doc.file_path}
                  download
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleting === doc.id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Supprimer"
                >
                  {deleting === doc.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadDocument } from '../services/dataService';

interface DocumentUploadProps {
  dossierId: string;
  onUploadComplete?: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'devis', label: 'Devis de formation' },
  { value: 'programme', label: 'Programme de formation' },
  { value: 'convention', label: 'Convention de formation' },
  { value: 'attestation', label: 'Attestation d\'inscription' },
  { value: 'justificatif', label: 'Justificatif' },
  { value: 'autre', label: 'Autre document' }
];

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ dossierId, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('devis');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Le fichier ne doit pas dépasser 10 MB');
        setUploadStatus('error');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Type de fichier non autorisé. Formats acceptés : PDF, JPG, PNG, DOC, DOCX');
        setUploadStatus('error');
        return;
      }

      setSelectedFile(file);
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadStatus('idle');

    try {
      await uploadDocument(dossierId, selectedFile, documentType);
      setUploadStatus('success');
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Call callback
      if (onUploadComplete) {
        setTimeout(() => {
          onUploadComplete();
        }, 1000);
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('Erreur lors de l\'envoi du fichier');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
    
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-blue-600" />
        Ajouter un document
      </h3>

      {/* Document Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de document
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {DOCUMENT_TYPES.map(type => (
            <key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* File Upload Area */}
      <div className="mb-4">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Cliquez pour choisir</span> ou glissez-déposez
            </p>
            <p className="text-xs text-gray-500">PDF, JPG, PNG, DOC, DOCX (max 10 MB)</p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </label>
      </div>

      {/* Selected File */}
      {selectedFile && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveFile}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}

      {/* Upload Status */}
      {uploadStatus === 'success' && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800">Document envoyé avec succès</p>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          !selectedFile || uploading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {uploading ? 'Envoi en cours...' : 'Envoyer le document'}
      </button>
    </div>
  );
};

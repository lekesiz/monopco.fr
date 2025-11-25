import { useState } from 'react';
import { useLocation } from 'wouter';

export default function Basvuru() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0); // Start at 0 for type selection
  const [typeFormation, setTypeFormation] = useState<'bilan' | 'formation' | null>(null);
  const [siret, setSiret] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [employeeCount, setEmployeeCount] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState(0);
  const [formData, setFormData] = useState({
    beneficiaire_nom: '',
    beneficiaire_prenom: '',
    beneficiaire_email: '',
    beneficiaire_telephone: ''
  });

  const handleSiretLookup = async () => {
    if (!siret || siret.length !== 14) {
      setError('Veuillez entrer un numéro SIRET valide (14 chiffres)');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      const response = await fetch(`/api/companies/lookup?siret=${siret}`);
      const data = await response.json();

      if (data.success) {
        setCompanyData(data.company);
        setSuccess(`Entreprise trouvée : ${data.company.nom} - OPCO: ${data.company.opco}`);
        setTimeout(() => {
          setStep(step + 1); // Move to next step
          setSuccess(null);
        }, 1500);
      } else {
        setError('Entreprise non trouvée. Veuillez vérifier votre numéro SIRET.');
      }
    } catch (error) {
      setError('Erreur lors de la recherche de l\'entreprise. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedAmount = (count: string) => {
    setEmployeeCount(count);
    const numEmployees = parseInt(count) || 0;
    
    // Calcul basé sur le nombre de salariés
    // Prix moyen: 1800€ par bilan de compétences
    const pricePerBilan = 1800;
    const estimated = numEmployees * pricePerBilan;
    
    setEstimatedAmount(estimated);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!formData.beneficiaire_nom || !formData.beneficiaire_prenom || !formData.beneficiaire_email) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      // Create dossier
      const response = await fetch('/api/dossiers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type_dossier: 'formation',
          beneficiaire_nom: formData.beneficiaire_nom,
          beneficiaire_prenom: formData.beneficiaire_prenom,
          beneficiaire_email: formData.beneficiaire_email,
          beneficiaire_telephone: formData.beneficiaire_telephone,
          montant_estime: estimatedAmount,
          entreprise_siret: siret,
          entreprise_nom: companyData?.nom,
          opco: companyData?.opco
        })
      });

      const data = await response.json();

      if (data.success) {
        setStep(4);
      } else {
        alert('Erreur lors de la création du dossier');
      }
    } catch (error) {
      alert('Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        {step > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {s}
                  </div>
                  {s < 4 && <div className={`w-24 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-300'}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span>SIRET</span>
              <span>Effectif</span>
              <span>Informations</span>
              <span>Confirmation</span>
            </div>
          </div>
        )}

        {/* Step 0: Type Selection */}
        {step === 0 && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Que souhaitez-vous financer ?</h2>
            <p className="text-gray-600 mb-8 text-center">
              Choisissez le type de projet professionnel que vous souhaitez faire financer par votre OPCO
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Bilan de Compétences */}
              <button
                onClick={() => window.open('https://bilancompetence.ai', '_blank')}
                className="group relative bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-8 hover:border-blue-500 hover:shadow-xl transition-all"
              >
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  RECOMMANDÉ
                </div>
                <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Bilan de Compétences</h3>
                <p className="text-gray-600 mb-4 text-sm text-center">
                  Accompagnement de 24h pour analyser vos compétences et définir votre projet professionnel
                </p>
                <div className="text-center text-sm text-blue-600 font-semibold group-hover:underline">
                  En savoir plus sur BilanCompetence.ai →
                </div>
              </button>

              {/* Formation */}
              <button
                onClick={() => { setTypeFormation('formation'); setStep(1); }}
                className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-gray-400 hover:shadow-xl transition-all"
              >
                <div className="h-16 w-16 bg-gray-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Formation Professionnelle</h3>
                <p className="text-gray-600 mb-4 text-sm text-center">
                  Formation spécifique pour développer des compétences techniques ou métier
                </p>
                <div className="text-center text-sm text-gray-600 font-semibold">
                  Continuer avec une formation →
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: SIRET */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Commencez votre demande</h2>
            <p className="text-gray-600 mb-8">
              Entrez votre numéro SIRET pour identifier automatiquement votre entreprise et votre OPCO.
            </p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro SIRET (14 chiffres)
              </label>
              <input
                type="text"
                value={siret}
                onChange={(e) => setSiret(e.target.value.replace(/\D/g, '').slice(0, 14))}
                placeholder="12345678901234"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={14}
              />
              <p className="text-sm text-gray-500 mt-2">
                {siret.length}/14 chiffres
              </p>
            </div>

            <button
              onClick={handleSiretLookup}
              disabled={loading || siret.length !== 14}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Recherche en cours...' : 'Continuer'}
            </button>
          </div>
        )}

        {/* Step 2: Employee Count */}
        {step === 2 && companyData && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Entreprise identifiée</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-lg mb-4">{companyData.nom}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">SIRET:</span>
                  <span className="ml-2 font-medium">{siret}</span>
                </div>
                <div>
                  <span className="text-gray-600">OPCO:</span>
                  <span className="ml-2 font-medium">{companyData.opco || 'Non déterminé'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Adresse:</span>
                  <span className="ml-2 font-medium">{companyData.adresse}</span>
                </div>
                <div>
                  <span className="text-gray-600">Dirigeant:</span>
                  <span className="ml-2 font-medium">{companyData.dirigeant}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de salariés concernés par le Bilan de Compétences
              </label>
              <input
                type="number"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                placeholder="Ex: 5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
              <p className="text-sm text-gray-500 mt-2">
                Prix moyen: 1 800€ par bilan de compétences
              </p>
            </div>

            <button
              onClick={() => calculateEstimatedAmount(employeeCount)}
              disabled={!employeeCount || parseInt(employeeCount) < 1}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Calculer le montant estimé
            </button>
          </div>
        )}

        {/* Step 3: Form */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Informations du bénéficiaire</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-lg mb-2">Montant estimé</h3>
              <p className="text-3xl font-bold text-green-600">
                {estimatedAmount.toLocaleString('fr-FR')} €
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Pour {employeeCount} salarié(s) × 1 800€
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.beneficiaire_nom}
                  onChange={(e) => setFormData({...formData, beneficiaire_nom: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                <input
                  type="text"
                  value={formData.beneficiaire_prenom}
                  onChange={(e) => setFormData({...formData, beneficiaire_prenom: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.beneficiaire_email}
                  onChange={(e) => setFormData({...formData, beneficiaire_email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.beneficiaire_telephone}
                  onChange={(e) => setFormData({...formData, beneficiaire_telephone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Envoi en cours...' : 'Soumettre la demande'}
            </button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Demande envoyée !</h2>
            <p className="text-gray-600 mb-8">
              Votre demande de financement OPCO a été créée avec succès.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setLocation('/dashboard')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Accéder à mon espace
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

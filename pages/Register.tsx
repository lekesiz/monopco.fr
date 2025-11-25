import { useState } from 'react';
import { useLocation } from 'wouter';

export default function Register() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    role: 'entreprise',
    // Champs entreprise
    nomEntreprise: '',
    siret: '',
    adresse: '',
    telephone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [siretLoading, setSiretLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    // Mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    // Confirmation mot de passe
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // Nom et prénom
    if (!formData.nom) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom) newErrors.prenom = 'Le prénom est requis';

    // Champs entreprise
    if (formData.role === 'entreprise') {
      if (!formData.nomEntreprise) newErrors.nomEntreprise = 'Le nom de l\'entreprise est requis';
      if (!formData.siret) {
        newErrors.siret = 'Le SIRET est requis';
      } else if (!/^\d{14}$/.test(formData.siret.replace(/\s/g, ''))) {
        newErrors.siret = 'Le SIRET doit contenir 14 chiffres';
      }
      if (!formData.telephone) newErrors.telephone = 'Le téléphone est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSiretLookup = async () => {
    const siret = formData.siret.replace(/\s/g, '');
    if (!/^\d{14}$/.test(siret)) {
      setErrors({ ...errors, siret: 'Le SIRET doit contenir 14 chiffres' });
      return;
    }

    setSiretLoading(true);
    try {
      const response = await fetch(`/api/companies/lookup?siret=${siret}`);
      const data = await response.json();

      if (data.success && data.company) {
        setFormData({
          ...formData,
          nomEntreprise: data.company.nom || formData.nomEntreprise,
          adresse: data.company.adresse || formData.adresse
        });
        setErrors({ ...errors, siret: '' });
      } else {
        setErrors({ ...errors, siret: 'SIRET non trouvé' });
      }
    } catch (error) {
      console.error('Erreur lors de la recherche SIRET:', error);
    } finally {
      setSiretLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nom: formData.nom,
          prenom: formData.prenom,
          role: formData.role,
          entreprise: formData.role === 'entreprise' ? {
            nom: formData.nomEntreprise,
            siret: formData.siret.replace(/\s/g, ''),
            adresse: formData.adresse,
            telephone: formData.telephone
          } : undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        // Rediriger vers la page de connexion avec message de succès
        setLocation('/login?registered=true');
      } else {
        setErrors({ submit: data.error || 'Une erreur est survenue' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setErrors({ submit: 'Une erreur est survenue lors de l\'inscription' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MonOPCO</h1>
          <p className="text-gray-600">Plateforme de gestion de formation</p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Créer votre compte</h2>

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.prenom ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Jean"
              />
              {errors.prenom && <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.nom ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Dupont"
              />
              {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email professionnel *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="jean.dupont@entreprise.fr"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              <p className="mt-1 text-xs text-gray-500">Minimum 8 caractères</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Informations entreprise */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Entreprise</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SIRET *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.siret}
                  onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                  className={`flex-1 px-4 py-2 border ${errors.siret ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="123 456 789 00010"
                  maxLength={17}
                />
                <button
                  type="button"
                  onClick={handleSiretLookup}
                  disabled={siretLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {siretLoading ? '...' : 'Vérifier'}
                </button>
              </div>
              {errors.siret && <p className="mt-1 text-sm text-red-600">{errors.siret}</p>}
              <p className="mt-1 text-xs text-gray-500">Nous récupérerons automatiquement les informations de votre entreprise</p>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                value={formData.nomEntreprise}
                onChange={(e) => setFormData({ ...formData, nomEntreprise: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.nomEntreprise ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Ma Société SARL"
              />
              {errors.nomEntreprise && <p className="mt-1 text-sm text-red-600">{errors.nomEntreprise}</p>}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123 Rue de la République, 75001 Paris"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.telephone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="01 23 45 67 89"
              />
              {errors.telephone && <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setLocation('/login')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
            >
              {loading ? 'Inscription en cours...' : 'Créer mon compte'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

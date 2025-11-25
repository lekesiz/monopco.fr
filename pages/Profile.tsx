import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Building2, User, Mail, Phone, MapPin, Lock } from 'lucide-react';

export const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [profile, setProfile] = useState({
    // User info
    firstName: 'Mikail',
    lastName: 'Lekesiz',
    email: 'mikail@netz-informatique.fr',
    phone: '+33 6 12 34 56 78',
    
    // Company info
    companyName: 'Netz Informatique',
    siret: '84899333300018',
    address: '123 Avenue des Champs-Élysées',
    postalCode: '75008',
    city: 'Paris',
    opco: 'OPCOMMERCE',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleSave = () => {
    // Save profile changes
    setIsEditing(false);
    alert('Profil mis à jour avec succès !');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    // Change password
    alert('Mot de passe modifié avec succès !');
    setPasswords({ current: '', new: '', confirm: '' });
    setShowPasswordForm(false);
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-500 mt-1">Gérez vos informations personnelles et d'entreprise.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Informations Personnelles</h2>
              </div>
              {!isEditing && (
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  Modifier
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex gap-3">
                <Button onClick={handleSave}>Enregistrer</Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>Annuler</Button>
              </div>
            )}
          </div>

          {/* Company Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <Building2 className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Informations Entreprise</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Raison Sociale</label>
                <input
                  type="text"
                  value={profile.companyName}
                  disabled
                  className="w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SIRET</label>
                <input
                  type="text"
                  value={profile.siret}
                  disabled
                  className="w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OPCO</label>
                <input
                  type="text"
                  value={profile.opco}
                  disabled
                  className="w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={profile.address}
                    disabled
                    className="w-full pl-10 rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
                <input
                  type="text"
                  value={profile.postalCode}
                  disabled
                  className="w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  type="text"
                  value={profile.city}
                  disabled
                  className="w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Les informations de l'entreprise sont automatiquement récupérées depuis votre SIRET et ne peuvent pas être modifiées directement.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Password Change */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <Lock className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
            </div>

            {!showPasswordForm ? (
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => setShowPasswordForm(true)}
              >
                Changer le mot de passe
              </Button>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    required
                    minLength={8}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    required
                    minLength={8}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Modifier</Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswords({ current: '', new: '', confirm: '' });
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Account Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Statistiques du Compte</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Membre depuis</span>
                <span className="font-medium text-gray-900">Janvier 2025</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dossiers créés</span>
                <span className="font-medium text-gray-900">5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Montant total</span>
                <span className="font-medium text-gray-900">32 000 €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

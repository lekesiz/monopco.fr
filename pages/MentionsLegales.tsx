import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const MentionsLegales: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-blue-600">MonOPCO</h1>
                  <p className="text-xs text-gray-600">Gestionnaire OPCO Automatisé</p>
                </div>
              </div>
            </Link>
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">Mentions Légales</h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance 
            en l'économie numérique, il est précisé aux utilisateurs du site MonOPCO.fr l'identité 
            des différents intervenants dans le cadre de sa réalisation et de son suivi.
          </p>

          {/* Édition du site */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Édition du site</h2>
            </div>
            <div className="ml-15 space-y-3 text-gray-700">
              <p>
                Le site <strong>MonOPCO.fr</strong> est édité par la société <strong>NETZ Informatique</strong>, 
                société par actions simplifiée au capital de 10 000 euros.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><strong>Siège social:</strong> 15 rue de la République, 67500 Haguenau, France</p>
                <p><strong>RCS:</strong> Strasbourg 848 993 333</p>
                <p><strong>SIRET:</strong> 848 993 333 00018</p>
                <p><strong>Code NAF:</strong> 6201Z - Programmation informatique</p>
              </div>
            </div>
          </section>

          {/* Responsable de publication */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Responsable de publication</h2>
            <p className="text-gray-700">
              <strong>Mikail Lekesiz</strong>, Président de NETZ Informatique
            </p>
          </section>

          {/* Hébergement */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Hébergement</h2>
            <div className="text-gray-700 space-y-2">
              <p>Le site MonOPCO.fr est hébergé par:</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><strong>Vercel Inc.</strong></p>
                <p>340 S Lemon Ave #4133</p>
                <p>Walnut, CA 91789</p>
                <p>États-Unis</p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Nous contacter</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <a 
                href="mailto:contact@netzinformatique.fr"
                className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">contact@netzinformatique.fr</p>
                </div>
              </a>
              <a 
                href="tel:+33367310201"
                className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium text-gray-900">03 67 31 02 01</p>
                </div>
              </a>
            </div>
          </section>

          {/* CNIL */}
          <section className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-3 text-gray-900">Protection des données</h2>
            <p className="text-gray-700 leading-relaxed">
              La société NETZ Informatique conservera dans ses systèmes informatiques et dans des 
              conditions raisonnables de sécurité une preuve de la transaction. Conformément au 
              Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit 
              d'accès, de rectification et de suppression des données vous concernant.
            </p>
            <Link href="/politique-confidentialite">
              <a className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium">
                Consulter notre politique de confidentialité →
              </a>
            </Link>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/mentions-legales">
            <a className="text-blue-600 hover:text-blue-700 font-medium">Mentions légales</a>
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/politique-confidentialite">
            <a className="text-gray-600 hover:text-gray-900">Politique de confidentialité</a>
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/cgu">
            <a className="text-gray-600 hover:text-gray-900">CGU</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;

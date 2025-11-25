import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Shield, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const CGU: React.FC = () => {
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
          <h1 className="text-4xl font-bold mb-6 text-gray-900">Conditions Générales d'Utilisation</h1>
          
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8">
            <p className="text-sm text-gray-700">
              <strong>Dernière mise à jour:</strong> 25 novembre 2025
            </p>
          </div>

          {/* Article 1 */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Article 1 - Objet</h2>
              </div>
            </div>
            <div className="ml-13 text-gray-700 space-y-3">
              <p>
                Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les 
                modalités et conditions d'utilisation de la plateforme <strong>MonOPCO.fr</strong> 
                (ci-après "la Plateforme"), ainsi que les droits et obligations des utilisateurs.
              </p>
              <p>
                La Plateforme est un service de gestion automatisée des dossiers de formation 
                professionnelle et de bilans de compétences financés par les OPCO (Opérateurs de Compétences).
              </p>
            </div>
          </section>

          {/* Article 2 */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Article 2 - Acceptation des CGU</h2>
              </div>
            </div>
            <div className="ml-13 text-gray-700 space-y-3">
              <p>
                L'utilisation de la Plateforme implique l'acceptation pleine et entière des présentes CGU. 
                En accédant à la Plateforme, vous reconnaissez avoir pris connaissance de ces conditions 
                et vous engagez à les respecter.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm">
                  <strong>Important:</strong> Si vous n'acceptez pas ces conditions, veuillez ne pas 
                  utiliser la Plateforme.
                </p>
              </div>
            </div>
          </section>

          {/* Article 3 */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Article 3 - Accès à la Plateforme</h2>
              </div>
            </div>
            <div className="ml-13 text-gray-700 space-y-3">
              <p>
                La Plateforme est accessible gratuitement à tout utilisateur disposant d'un accès à Internet. 
                Tous les coûts afférents à l'accès à la Plateforme, que ce soient les frais matériels, 
                logiciels ou d'accès à Internet sont exclusivement à la charge de l'utilisateur.
              </p>
              <p>
                NETZ Informatique met en œuvre tous les moyens raisonnables à sa disposition pour assurer 
                un accès de qualité à la Plateforme, mais n'est tenue à aucune obligation d'y parvenir.
              </p>
            </div>
          </section>

          {/* Article 4 */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Article 4 - Propriété intellectuelle</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                L'ensemble des éléments de la Plateforme (structure, textes, images, graphismes, logo, 
                icônes, sons, logiciels, etc.) sont la propriété exclusive de NETZ Informatique ou de 
                ses partenaires.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication, adaptation de tout ou 
                partie des éléments de la Plateforme, quel que soit le moyen ou le procédé utilisé, 
                est interdite, sauf autorisation écrite préalable de NETZ Informatique.
              </p>
            </div>
          </section>

          {/* Article 5 */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Article 5 - Responsabilités</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                NETZ Informatique ne pourra être tenue responsable des dommages directs et indirects 
                causés au matériel de l'utilisateur, lors de l'accès à la Plateforme.
              </p>
              <p>
                L'utilisateur s'engage à fournir des informations exactes et à jour lors de la création 
                de son compte et de l'utilisation de la Plateforme. NETZ Informatique ne saurait être 
                tenue responsable des erreurs résultant d'informations inexactes fournies par l'utilisateur.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong>Attention:</strong> Les informations fournies sur la Plateforme le sont à 
                    titre indicatif. Elles ne sauraient se substituer aux conseils d'un professionnel 
                    ou aux démarches officielles auprès des OPCO.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Article 6 */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Article 6 - Protection des données personnelles</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Les données personnelles collectées sur la Plateforme sont traitées conformément au 
                Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
              </p>
              <p>
                Pour plus d'informations sur le traitement de vos données personnelles, veuillez consulter 
                notre{' '}
                <Link href="/politique-confidentialite">
                  <a className="text-blue-600 hover:text-blue-700 font-medium">
                    Politique de confidentialité
                  </a>
                </Link>.
              </p>
            </div>
          </section>

          {/* Article 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Article 7 - Droit applicable et juridiction</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Les présentes CGU sont régies par le droit français. En cas de litige et à défaut 
                d'accord amiable, le litige sera porté devant les tribunaux compétents de Strasbourg.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-3 text-gray-900">Questions sur les CGU ?</h2>
            <p className="text-gray-700 mb-4">
              Pour toute question concernant ces Conditions Générales d'Utilisation, vous pouvez nous contacter :
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="mailto:contact@netzinformatique.fr"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Par email
              </a>
              <a 
                href="tel:+33367310201"
                className="inline-flex items-center justify-center px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Par téléphone
              </a>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/mentions-legales">
            <a className="text-gray-600 hover:text-gray-900">Mentions légales</a>
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/politique-confidentialite">
            <a className="text-gray-600 hover:text-gray-900">Politique de confidentialité</a>
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/cgu">
            <a className="text-blue-600 hover:text-blue-700 font-medium">CGU</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CGU;

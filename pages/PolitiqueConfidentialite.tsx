import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Lock, Eye, Database, UserCheck, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const PolitiqueConfidentialite: React.FC = () => {
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
          <h1 className="text-4xl font-bold mb-6 text-gray-900">Politique de Confidentialité</h1>
          
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8">
            <p className="text-sm text-gray-700">
              <strong>Dernière mise à jour:</strong> 25 novembre 2025
            </p>
            <p className="text-sm text-gray-700 mt-2">
              Cette politique de confidentialité est conforme au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <p className="text-gray-700 leading-relaxed">
              NETZ Informatique, en tant que responsable du traitement, accorde une grande importance à 
              la protection de vos données personnelles. Cette politique de confidentialité vous informe 
              sur la manière dont nous collectons, utilisons et protégeons vos données personnelles lors 
              de votre utilisation de la plateforme <strong>MonOPCO.fr</strong>.
            </p>
          </section>

          {/* Section 1 */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">1. Données collectées</h2>
              </div>
            </div>
            <div className="ml-13 text-gray-700 space-y-4">
              <p>Nous collectons les données personnelles suivantes :</p>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Données d'identification</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Nom et prénom</li>
                    <li>Adresse email professionnelle</li>
                    <li>Numéro de téléphone</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Données d'entreprise</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Raison sociale</li>
                    <li>Numéro SIRET</li>
                    <li>Code NAF</li>
                    <li>Adresse du siège social</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Données de formation</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Informations sur les formations demandées</li>
                    <li>Montants estimés</li>
                    <li>Documents justificatifs</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">2. Finalités du traitement</h2>
              </div>
            </div>
            <div className="ml-13 text-gray-700 space-y-3">
              <p>Vos données personnelles sont collectées et traitées pour les finalités suivantes :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Gestion de votre compte utilisateur</li>
                <li>Traitement de vos demandes de financement OPCO</li>
                <li>Communication avec vous concernant vos dossiers</li>
                <li>Amélioration de nos services</li>
                <li>Respect de nos obligations légales et réglementaires</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">3. Base légale du traitement</h2>
              </div>
            </div>
            <div className="ml-13 text-gray-700 space-y-3">
              <p>Le traitement de vos données personnelles repose sur :</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Votre consentement</strong> pour la création de votre compte</li>
                <li><strong>L'exécution d'un contrat</strong> pour le traitement de vos demandes</li>
                <li><strong>Nos obligations légales</strong> en matière de conservation des données</li>
                <li><strong>Notre intérêt légitime</strong> pour l'amélioration de nos services</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">4. Durée de conservation</h2>
              </div>
            </div>
            <div className="ml-13 text-gray-700 space-y-3">
              <p>Vos données personnelles sont conservées pendant :</p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><strong>Données de compte:</strong> Pendant toute la durée de votre compte + 3 ans après sa clôture</p>
                <p><strong>Données de dossiers:</strong> 10 ans conformément aux obligations légales comptables</p>
                <p><strong>Données de connexion:</strong> 1 an conformément à la loi pour la confiance dans l'économie numérique</p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">5. Vos droits</h2>
              </div>
            </div>
            <div className="ml-13 text-gray-700 space-y-4">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">✓ Droit d'accès</h3>
                  <p className="text-sm">Obtenir une copie de vos données personnelles</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">✓ Droit de rectification</h3>
                  <p className="text-sm">Corriger vos données inexactes ou incomplètes</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">✓ Droit à l'effacement</h3>
                  <p className="text-sm">Demander la suppression de vos données</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">✓ Droit à la portabilité</h3>
                  <p className="text-sm">Récupérer vos données dans un format structuré</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">✓ Droit d'opposition</h3>
                  <p className="text-sm">Vous opposer au traitement de vos données</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">✓ Droit à la limitation</h3>
                  <p className="text-sm">Limiter le traitement de vos données</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm">
                  <strong>Comment exercer vos droits ?</strong> Envoyez-nous un email à{' '}
                  <a href="mailto:contact@netzinformatique.fr" className="text-blue-600 hover:text-blue-700 font-medium">
                    contact@netzinformatique.fr
                  </a>
                  {' '}avec une copie de votre pièce d'identité.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Sécurité des données</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour 
                protéger vos données personnelles contre la destruction accidentelle ou illicite, 
                la perte, l'altération, la divulgation ou l'accès non autorisé.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Chiffrement des données en transit (HTTPS/TLS)</li>
                  <li>Chiffrement des données au repos</li>
                  <li>Contrôle d'accès strict aux données</li>
                  <li>Sauvegardes régulières</li>
                  <li>Surveillance et détection des incidents</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">7. Destinataires des données</h2>
            <div className="text-gray-700 space-y-3">
              <p>Vos données personnelles peuvent être transmises à :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Notre personnel habilité</li>
                <li>Les OPCO concernés pour le traitement de vos demandes</li>
                <li>Nos prestataires techniques (hébergement, maintenance)</li>
                <li>Les autorités compétentes sur demande légale</li>
              </ul>
              <p className="text-sm italic">
                Nous nous assurons que tous les destinataires respectent la confidentialité et la 
                sécurité de vos données personnelles.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Réclamation</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Si vous estimez que le traitement de vos données personnelles constitue une violation 
                de la réglementation applicable, vous avez le droit d'introduire une réclamation auprès 
                de la Commission Nationale de l'Informatique et des Libertés (CNIL).
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900">CNIL</p>
                <p className="text-sm">3 Place de Fontenoy - TSA 80715</p>
                <p className="text-sm">75334 PARIS CEDEX 07</p>
                <p className="text-sm">Tél : 01 53 73 22 22</p>
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700">
                  www.cnil.fr
                </a>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <Mail className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Questions sur vos données ?</h2>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Pour toute question concernant le traitement de vos données personnelles ou pour exercer 
              vos droits, contactez notre Délégué à la Protection des Données :
            </p>
            <a 
              href="mailto:contact@netzinformatique.fr"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Nous contacter
            </a>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/mentions-legales">
            <a className="text-gray-600 hover:text-gray-900">Mentions légales</a>
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/politique-confidentialite">
            <a className="text-blue-600 hover:text-blue-700 font-medium">Politique de confidentialité</a>
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

export default PolitiqueConfidentialite;

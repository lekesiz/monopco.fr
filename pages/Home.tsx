import { Button } from "@/components/ui/Button";
import { 
  CheckCircle2, 
  FileText, 
  TrendingUp, 
  Users, 
  Clock, 
  Shield,
  ArrowRight,
  Building2,
  GraduationCap,
  Target
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-600">MonOPCO</h1>
                <p className="text-xs text-gray-600">Gestionnaire OPCO Automatisé</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Connexion</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-blue-700 hover:bg-blue-800 text-white shadow-lg">
                  S'inscrire
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Propulsé par Netz Informatique
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
              Votre <span className="text-blue-600">Bilan de Compétences</span><br />
              financé par l'OPCO
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Plateforme automatisée pour gérer vos dossiers de <strong>Bilan de Compétences</strong> et 
              formations professionnelles avec financement OPCO
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://bilancompetence.ai" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white shadow-lg text-lg px-8 py-6">
                  Découvrir le Bilan de Compétences
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <Link href="/basvuru">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-gray-300">
                  Démarrer un dossier OPCO
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">11</div>
                <div className="text-sm text-gray-600">OPCO Couverts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">24h</div>
                <div className="text-sm text-gray-600">Bilan Standard</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">100%</div>
                <div className="text-sm text-gray-600">Automatisé</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OPCO Section */}
      <section id="opco-section" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Qu'est-ce qu'un <span className="text-blue-600">OPCO</span> ?
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Les <strong>Opérateurs de Compétences (OPCO)</strong> sont des organismes agréés par l'État 
                qui financent et accompagnent la formation professionnelle en France.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-600 transition-colors">
                <Building2 className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">11 OPCO en France</h3>
                <p className="text-gray-600 mb-4">
                  Chaque secteur d'activité est rattaché à un OPCO spécifique
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span><strong>ATLAS</strong> - Services financiers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span><strong>AKTO</strong> - Entreprises à forte intensité de main d'œuvre</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span><strong>OPCO EP</strong> - Entreprises de proximité</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span><strong>OPCO Santé</strong> - Secteur santé</span>
                  </li>
                  <li className="text-gray-500">+ 7 autres OPCO sectoriels</li>
                </ul>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-600 transition-colors">
                <Target className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">Détection Automatique</h3>
                <p className="text-gray-600 mb-4">
                  MonOPCO identifie automatiquement votre OPCO
                </p>
                <div className="space-y-4">
                  <p className="text-sm">
                    Grâce à votre <strong>numéro SIRET</strong>, notre système :
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <span>Récupère vos informations entreprise</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <span>Identifie votre code NAF</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <span>Détermine votre OPCO de rattachement</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <span>Pré-remplit tous les formulaires</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bilan de Compétences Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Le <span className="text-blue-600">Bilan de Compétences</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Un accompagnement personnalisé de <strong>24 heures</strong> pour analyser vos compétences, 
                définir votre projet professionnel et identifier vos besoins en formation.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Phase Préliminaire</h3>
                <p className="text-sm text-gray-600">
                  Analyse de la demande, définition des besoins et présentation de la méthodologie.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Phase d'Investigation</h3>
                <p className="text-sm text-gray-600">
                  Tests, entretiens approfondis et exploration des compétences et motivations.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Phase de Conclusion</h3>
                <p className="text-sm text-gray-600">
                  Synthèse des résultats et élaboration du plan d'action personnalisé.
                </p>
              </div>
            </div>

            <div className="bg-blue-700 text-white rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Pourquoi choisir le Bilan d'abord ?</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="flex gap-3">
                  <Shield className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Financement facilité</h4>
                    <p className="text-sm opacity-90">
                      Le Bilan de Compétences est éligible au CPF et peut être financé par votre OPCO.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Target className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Projet personnalisé</h4>
                    <p className="text-sm opacity-90">
                      Identifiez précisément vos besoins en formation avant de vous engager.
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <a href="https://bilancompetence.ai" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 font-semibold shadow-xl">
                    En savoir plus sur BilanCompetence.ai
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Fonctionnalités <span className="text-blue-600">MonOPCO</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Génération PDF</h3>
                <p className="text-gray-600">
                  Documents OPCO générés automatiquement (conventions, attestations, factures)
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Rappels Automatiques</h3>
                <p className="text-gray-600">
                  Notifications par email pour ne jamais manquer une échéance
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Suivi en Temps Réel</h3>
                <p className="text-gray-600">
                  Dashboard Kanban pour visualiser l'avancement de tous vos dossiers
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à simplifier vos dossiers OPCO ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les entreprises qui font confiance à MonOPCO
          </p>
          <Link href="/basvuru">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 font-semibold shadow-xl">
              Commencer Maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MonOPCO</h3>
              <p className="text-gray-400">
                Plateforme automatisée de gestion des dossiers OPCO
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-gray-400">
                Netz Informatique<br />
                67500 Haguenau, France<br />
                📞 <a href="tel:+33367310201" className="hover:text-white">03 67 31 02 01</a><br />
                📧 <a href="mailto:contact@netzinformatique.fr" className="hover:text-white">contact@netzinformatique.fr</a>
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Liens Utiles</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/#/mentions-legales" className="hover:text-white">Mentions légales</a></li>
                <li><a href="/#/politique-confidentialite" className="hover:text-white">Politique de confidentialité</a></li>
                <li><a href="/#/cgu" className="hover:text-white">CGU</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MonOPCO - Tous droits réservés - Propulsé par Netz Informatique</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

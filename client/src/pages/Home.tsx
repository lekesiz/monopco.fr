import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO } from "@/const";
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
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt="MonOPCO" className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-bold text-primary">MonOPCO</h1>
                <p className="text-xs text-muted-foreground">Gestionnaire OPCO Automatisé</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Tableau de Bord</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Se connecter</Button>
              </Link>
              <Link href="/nouveau-dossier">
                <Button className="shadow-blue">
                  Demarrer un Dossier
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
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
              Propulsé par Netz Informatique
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Simplifiez vos dossiers{" "}
              <span className="text-primary">OPCO</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Plateforme automatisée pour gérer vos <strong>Bilans de Compétences</strong> et 
              formations professionnelles avec financement OPCO
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/nouveau-dossier">
                <Button size="lg" className="shadow-blue-lg text-lg px-8">
                  Créer un Dossier
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8">
                En savoir plus
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">11</div>
                <div className="text-sm text-muted-foreground">OPCO Couverts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24h</div>
                <div className="text-sm text-muted-foreground">Bilan Standard</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Automatisé</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OPCO Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Qu'est-ce qu'un <span className="text-primary">OPCO</span> ?
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Les <strong>Opérateurs de Compétences (OPCO)</strong> sont des organismes agréés par l'État 
                qui financent et accompagnent la formation professionnelle en France.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <Building2 className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>11 OPCO en France</CardTitle>
                  <CardDescription>
                    Chaque secteur d'activité est rattaché à un OPCO spécifique
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span><strong>ATLAS</strong> - Services financiers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span><strong>AKTO</strong> - Entreprises à forte intensité de main d'œuvre</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span><strong>OPCO EP</strong> - Entreprises de proximité</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span><strong>OPCO Santé</strong> - Secteur santé</span>
                    </li>
                    <li className="text-muted-foreground">+ 7 autres OPCO sectoriels</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <Target className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Détection Automatique</CardTitle>
                  <CardDescription>
                    MonOPCO identifie automatiquement votre OPCO
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm">
                      Grâce à votre <strong>numéro SIRET</strong>, notre système :
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Récupère vos informations entreprise</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Identifie votre code NAF</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Détermine votre OPCO de rattachement</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Pré-remplit tous les formulaires</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Bilan de Compétences Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Le <span className="text-primary">Bilan de Compétences</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Un accompagnement personnalisé de <strong>24 heures</strong> pour analyser vos compétences, 
                définir votre projet professionnel et identifier vos besoins en formation.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <CardTitle>Phase Préliminaire</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Analyse de la demande, définition des besoins et présentation de la méthodologie.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <CardTitle>Phase d'Investigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Tests, entretiens approfondis et exploration des compétences et motivations.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <span className="text-3xl font-bold text-primary">3</span>
                  </div>
                  <CardTitle>Phase de Conclusion</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Synthèse des résultats et élaboration du plan d'action personnalisé.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-primary text-primary-foreground border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Pourquoi choisir le Bilan d'abord ?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex gap-3">
                    <Shield className="h-6 w-6 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Financement facilité</h4>
                      <p className="text-sm opacity-90">
                        Taux d'approbation OPCO très élevé pour les Bilans de Compétences
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <TrendingUp className="h-6 w-6 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Upsell naturel</h4>
                      <p className="text-sm opacity-90">
                        Le Bilan identifie les besoins en formation, facilitant la vente de formations ciblées
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Clock className="h-6 w-6 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Package standardisé</h4>
                      <p className="text-sm opacity-90">
                        24h réglementaires, tarif fixe (1500-2000€), moins de risques de rejet
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Users className="h-6 w-6 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Relation durable</h4>
                      <p className="text-sm opacity-90">
                        Créez une relation de confiance avant de proposer d'autres services
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Comment <span className="text-primary">MonOPCO</span> vous aide
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Une plateforme complète pour gérer vos dossiers OPCO de A à Z
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Formulaire Intelligent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Entrez simplement le SIRET, tout le reste est automatiquement rempli grâce aux APIs officielles
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Suivi Complet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Dashboard Kanban pour suivre chaque dossier à travers les 3 phases du Bilan de Compétences
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Génération Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Tous les documents OPCO (conventions, attestations) générés automatiquement et prêts à envoyer
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Prêt à simplifier vos dossiers OPCO ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Rejoignez Netz Informatique et automatisez votre gestion administrative
            </p>
            <Link href="/nouveau-dossier">
              <Button size="lg" variant="secondary" className="text-lg px-8 shadow-xl">
                Créer mon premier dossier
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={APP_LOGO} alt="MonOPCO" className="h-8 w-8" />
                <span className="font-bold text-white">MonOPCO</span>
              </div>
              <p className="text-sm">
                Plateforme de gestion OPCO automatisée par Netz Informatique
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Liens Utiles</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Comment ça marche</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Netz Informatique</h4>
              <ul className="space-y-2 text-sm">
                <li>📍 67500 Haguenau, France</li>
                <li>📞 03 67 31 02 01</li>
                <li>🌐 netzinformatique.fr</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 MonOPCO - Netz Informatique. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

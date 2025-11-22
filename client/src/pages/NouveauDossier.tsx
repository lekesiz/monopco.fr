import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { Loader2, Building2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function NouveauDossier() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"siret" | "beneficiaire">("siret");
  const [siret, setSiret] = useState("");
  const [entrepriseData, setEntrepriseData] = useState<any>(null);
  const [typeDossier, setTypeDossier] = useState<"bilan" | "formation">("bilan");
  
  const [beneficiaire, setBeneficiaire] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: ""
  });

  const rechercherMutation = trpc.entreprise.rechercherParSiret.useMutation({
    onSuccess: (data) => {
      setEntrepriseData(data.entreprise);
      setStep("beneficiaire");
      toast.success(`Entreprise trouvée: ${data.entreprise.nom}`);
      if (data.entreprise.opco) {
        toast.info(`OPCO détecté: ${data.entreprise.opco}`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la recherche");
    }
  });

  const creerDossierMutation = trpc.dossier.creer.useMutation({
    onSuccess: () => {
      toast.success("Dossier créé avec succès!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création du dossier");
    }
  });

  const handleSiretSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (siret.length !== 14) {
      toast.error("Le SIRET doit contenir 14 chiffres");
      return;
    }

    rechercherMutation.mutate({ siret });
  };

  const handleBeneficiaireSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!beneficiaire.nom || !beneficiaire.prenom || !beneficiaire.email) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!entrepriseData) {
      toast.error("Données entreprise manquantes");
      return;
    }

    creerDossierMutation.mutate({
      entrepriseId: entrepriseData.id,
      typeDossier,
      beneficiaireNom: beneficiaire.nom,
      beneficiairePrenom: beneficiaire.prenom,
      beneficiaireEmail: beneficiaire.email,
      beneficiaireTelephone: beneficiaire.telephone || undefined
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Créer un nouveau dossier
          </h1>
          <p className="text-muted-foreground">
            Remplissez les informations pour démarrer votre dossier OPCO
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === "siret" ? "text-primary" : "text-green-600"}`}>
              {step === "beneficiaire" ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <div className="h-6 w-6 rounded-full border-2 border-current flex items-center justify-center">
                  <span className="text-sm font-semibold">1</span>
                </div>
              )}
              <span className="font-medium">Entreprise</span>
            </div>
            <div className="h-px w-12 bg-border"></div>
            <div className={`flex items-center gap-2 ${step === "beneficiaire" ? "text-primary" : "text-muted-foreground"}`}>
              <div className="h-6 w-6 rounded-full border-2 border-current flex items-center justify-center">
                <span className="text-sm font-semibold">2</span>
              </div>
              <span className="font-medium">Bénéficiaire</span>
            </div>
          </div>
        </div>

        {/* Step 1: SIRET */}
        {step === "siret" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Recherche de l'entreprise
              </CardTitle>
              <CardDescription>
                Entrez le numéro SIRET pour récupérer automatiquement les informations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSiretSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siret">Numéro SIRET *</Label>
                  <Input
                    id="siret"
                    type="text"
                    placeholder="12345678901234"
                    value={siret}
                    onChange={(e) => setSiret(e.target.value.replace(/\D/g, "").slice(0, 14))}
                    maxLength={14}
                    className="text-lg"
                    disabled={rechercherMutation.isPending}
                  />
                  <p className="text-sm text-muted-foreground">
                    14 chiffres - Les informations seront récupérées automatiquement
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900">
                    ✨ Détection automatique
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Nom et adresse de l'entreprise</li>
                    <li>• Code NAF (secteur d'activité)</li>
                    <li>• OPCO de rattachement</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={siret.length !== 14 || rechercherMutation.isPending}
                >
                  {rechercherMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Recherche en cours...
                    </>
                  ) : (
                    "Continuer"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Bénéficiaire */}
        {step === "beneficiaire" && entrepriseData && (
          <div className="space-y-6">
            {/* Récapitulatif Entreprise */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <CheckCircle2 className="h-5 w-5" />
                  Entreprise identifiée
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Nom:</span> {entrepriseData.nom}
                </div>
                <div>
                  <span className="font-semibold">SIRET:</span> {entrepriseData.siret}
                </div>
                <div>
                  <span className="font-semibold">Adresse:</span> {entrepriseData.adresse}
                </div>
                {entrepriseData.opco && (
                  <div>
                    <span className="font-semibold">OPCO:</span>{" "}
                    <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium">
                      {entrepriseData.opco}
                    </span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep("siret");
                    setEntrepriseData(null);
                  }}
                  className="mt-2"
                >
                  Modifier l'entreprise
                </Button>
              </CardContent>
            </Card>

            {/* Formulaire Bénéficiaire */}
            <Card>
              <CardHeader>
                <CardTitle>Informations du bénéficiaire</CardTitle>
                <CardDescription>
                  Personne qui va bénéficier du Bilan de Compétences ou de la formation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBeneficiaireSubmit} className="space-y-6">
                  {/* Type de dossier */}
                  <div className="space-y-3">
                    <Label>Type de dossier *</Label>
                    <RadioGroup
                      value={typeDossier}
                      onValueChange={(value) => setTypeDossier(value as "bilan" | "formation")}
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                        <RadioGroupItem value="bilan" id="bilan" />
                        <Label htmlFor="bilan" className="flex-1 cursor-pointer">
                          <div className="font-semibold">Bilan de Compétences</div>
                          <div className="text-sm text-muted-foreground">
                            24h réglementaires - Recommandé pour un financement OPCO rapide
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                        <RadioGroupItem value="formation" id="formation" />
                        <Label htmlFor="formation" className="flex-1 cursor-pointer">
                          <div className="font-semibold">Formation Professionnelle</div>
                          <div className="text-sm text-muted-foreground">
                            Durée variable selon le programme
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Nom */}
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      type="text"
                      value={beneficiaire.nom}
                      onChange={(e) => setBeneficiaire({ ...beneficiaire, nom: e.target.value })}
                      placeholder="Dupont"
                      required
                    />
                  </div>

                  {/* Prénom */}
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      type="text"
                      value={beneficiaire.prenom}
                      onChange={(e) => setBeneficiaire({ ...beneficiaire, prenom: e.target.value })}
                      placeholder="Jean"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={beneficiaire.email}
                      onChange={(e) => setBeneficiaire({ ...beneficiaire, email: e.target.value })}
                      placeholder="jean.dupont@exemple.fr"
                      required
                    />
                  </div>

                  {/* Téléphone */}
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      value={beneficiaire.telephone}
                      onChange={(e) => setBeneficiaire({ ...beneficiaire, telephone: e.target.value })}
                      placeholder="06 12 34 56 78"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={creerDossierMutation.isPending}
                  >
                    {creerDossierMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      "Créer le dossier"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

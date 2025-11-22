import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { 
  Loader2, 
  ArrowLeft,
  FileText,
  Download,
  Clock,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { APP_LOGO, getLoginUrl } from "@/const";
import { toast } from "sonner";

const STATUT_LABELS: Record<string, string> = {
  nouveau: "Nouveau",
  phase1: "Phase 1 - Préliminaire",
  phase2: "Phase 2 - Investigation",
  phase3: "Phase 3 - Conclusion",
  facture: "Facturé"
};

export default function DetailDossier() {
  const [, params] = useRoute("/dossier/:id");
  const dossierId = params?.id ? parseInt(params.id) : 0;
  
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const { data: dossier, isLoading, error, refetch } = trpc.dossier.obtenirParId.useQuery(
    { id: dossierId },
    { enabled: isAuthenticated && dossierId > 0 }
  );

  const { data: entreprise } = trpc.entreprise.obtenirParId.useQuery(
    { id: dossier?.entrepriseId || 0 },
    { enabled: !!dossier?.entrepriseId }
  );

  const { data: historique = [] } = trpc.dossier.obtenirHistorique.useQuery(
    { dossierId },
    { enabled: dossierId > 0 }
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Connexion requise</CardTitle>
            <CardDescription>
              Vous devez être connecté pour voir les détails du dossier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Se connecter
            </Button>
            <Link href="/">
              <Button variant="ghost" className="w-full">
                Retour à l'accueil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Dossier introuvable</CardTitle>
            <CardDescription>
              Le dossier demandé n'existe pas ou vous n'avez pas les permissions pour y accéder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const genererPDF = async (type: string) => {
    try {
      toast.info(`Génération du document ${type}...`);
      
      let endpoint = "";
      let filename = "";
      
      switch (type) {
        case "convention":
          endpoint = "/api/trpc/documents.genererConvention";
          filename = `convention_${dossier.reference || `BC-${dossier.id}`}.pdf`;
          break;
        case "certificat":
          endpoint = "/api/trpc/documents.genererCertificat";
          filename = `certificat_${dossier.reference || `BC-${dossier.id}`}.pdf`;
          break;
        case "emargement":
          endpoint = "/api/trpc/documents.genererEmargement";
          filename = `emargement_${dossier.reference || `BC-${dossier.id}`}.pdf`;
          break;
        case "demande":
          endpoint = "/api/trpc/documents.genererDemande";
          filename = `demande_${dossier.reference || `BC-${dossier.id}`}.pdf`;
          break;
        case "synthese":
          endpoint = "/api/trpc/documents.genererSynthese";
          filename = `synthese_${dossier.reference || `BC-${dossier.id}`}.pdf`;
          break;
      }

      const response = await fetch(`${endpoint}?input=${encodeURIComponent(JSON.stringify({ dossierId: dossier.id, montant: 2000 }))}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      const result = data.result.data;

      if (result.success) {
        // Décoder le base64 et télécharger
        const blob = new Blob(
          [Uint8Array.from(atob(result.data), c => c.charCodeAt(0))],
          { type: "application/pdf" }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Document ${type} téléchargé !`);
      }
    } catch (error: any) {
      toast.error("Erreur lors de la génération: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <img src={APP_LOGO} alt="MonOPCO" className="h-8 w-8" />
                <div>
                  <h1 className="font-bold text-lg">Détail Dossier</h1>
                  <p className="text-xs text-muted-foreground">
                    {dossier.reference || `BC-${dossier.id}`}
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {STATUT_LABELS[dossier.statut] || dossier.statut}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Informations Générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informations Générales
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Type de Dossier</p>
                <p className="font-medium">
                  {dossier.typeDossier === "bilan" ? "Bilan de Compétences" : "Formation"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Référence</p>
                <p className="font-medium">{dossier.reference || `BC-${dossier.id}`}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Heures</p>
                <p className="font-medium">
                  {dossier.heuresRealisees} / {dossier.heuresTotal} heures
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Date de Début</p>
                <p className="font-medium">
                  {dossier.dateDebut ? new Date(dossier.dateDebut).toLocaleDateString("fr-FR") : "Non définie"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date de Fin</p>
                <p className="font-medium">
                  {dossier.dateFin ? new Date(dossier.dateFin).toLocaleDateString("fr-FR") : "Non définie"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Créé le</p>
                <p className="font-medium">
                  {new Date(dossier.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bénéficiaire */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Bénéficiaire
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom Complet</p>
                <p className="font-medium">
                  {dossier.beneficiairePrenom} {dossier.beneficiaireNom}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${dossier.beneficiaireEmail}`} className="text-primary hover:underline">
                  {dossier.beneficiaireEmail}
                </a>
              </div>
            </div>
            <div className="space-y-4">
              {dossier.beneficiaireTelephone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${dossier.beneficiaireTelephone}`} className="text-primary hover:underline">
                    {dossier.beneficiaireTelephone}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Entreprise */}
        {entreprise && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Entreprise
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="font-medium">{entreprise.nom}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SIRET</p>
                  <p className="font-medium">{entreprise.siret}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Code NAF</p>
                  <p className="font-medium">{entreprise.codeNaf || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">OPCO</p>
                  <Badge variant="secondary">{entreprise.opco || "Non détecté"}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium">{entreprise.adresse || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents OPCO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Documents OPCO
            </CardTitle>
            <CardDescription>
              Générez et téléchargez les documents officiels pour ce dossier
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => genererPDF("convention")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Convention Tripartite
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => genererPDF("certificat")}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Certificat de Réalisation
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => genererPDF("emargement")}
            >
              <Clock className="mr-2 h-4 w-4" />
              Feuille d'Émargement
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => genererPDF("demande")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Demande Prise en Charge
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => genererPDF("synthese")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Document de Synthèse
            </Button>
          </CardContent>
        </Card>

        {/* Historique */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historique des Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historique.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Aucune action enregistrée pour ce dossier
              </p>
            ) : (
              <div className="space-y-4">
                {historique.map((entry) => (
                  <div key={entry.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{entry.action}</p>
                      {entry.commentaire && (
                        <p className="text-sm text-muted-foreground">{entry.commentaire}</p>
                      )}
                      {entry.nouvelleValeur && (
                        <p className="text-sm text-muted-foreground">
                          Nouvelle valeur: {entry.nouvelleValeur}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground text-right">
                      {new Date(entry.createdAt).toLocaleString("fr-FR")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {dossier.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{dossier.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

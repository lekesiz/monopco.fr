import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { 
  Loader2, 
  ArrowLeft,
  FileText,
  Download,
  Euro,
  Calendar,
  Building
} from "lucide-react";
import { Link } from "wouter";
import { APP_LOGO } from "@/const";
import { LoginDialog } from "@/components/LoginDialog";
import { toast } from "sonner";
import { useState } from "react";

export default function Facturation() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const { data: dossiers, isLoading, refetch } = trpc.dossier.lister.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Filtrer uniquement les dossiers facturés
  const dossiersFactures = dossiers?.filter(d => d.statut === "facture") || [];

  // Calculer le total
  const montantTotal = dossiersFactures.reduce((sum, d) => {
    // Montant OPCO standard pour Bilan de Compétences: 2000€
    return sum + (d.typeDossier === "bilan" ? 2000 : 1500);
  }, 0);

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
              Vous devez être connecté pour accéder à la facturation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() => setShowLogin(true)}
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
        <LoginDialog
          open={showLogin}
          onOpenChange={setShowLogin}
          onClose={() => setShowLogin(false)}
        />
      </div>
    );
  }

  const genererFacture = async (dossierId: number) => {
    try {
      toast.info("Génération de la facture...");
      
      const response = await fetch(`/api/trpc/facturation.genererFacture?input=${encodeURIComponent(JSON.stringify({ dossierId }))}`, {
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
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Facture téléchargée !");
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
                  <h1 className="font-bold text-lg">Facturation</h1>
                  <p className="text-xs text-muted-foreground">
                    Gestion des factures OPCO
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Euro className="h-5 w-5 text-green-600" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total facturé</p>
                <p className="font-bold text-lg text-green-600">
                  {montantTotal.toLocaleString("fr-FR")} €
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Statistiques */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Dossiers Facturés</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {dossiersFactures.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Montant Total</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {montantTotal.toLocaleString("fr-FR")} €
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Montant Moyen</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {dossiersFactures.length > 0 
                  ? Math.round(montantTotal / dossiersFactures.length).toLocaleString("fr-FR") 
                  : 0} €
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Liste des factures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Liste des Factures
            </CardTitle>
            <CardDescription>
              Tous les dossiers facturés avec génération PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dossiersFactures.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun dossier facturé pour le moment</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Bénéficiaire</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dossiersFactures.map((dossier) => {
                    const montant = dossier.typeDossier === "bilan" ? 2000 : 1500;
                    return (
                      <TableRow key={dossier.id}>
                        <TableCell className="font-medium">
                          {dossier.reference || `BC-${dossier.id}`}
                        </TableCell>
                        <TableCell>
                          {dossier.beneficiairePrenom} {dossier.beneficiaireNom}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Entreprise #{dossier.entrepriseId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {dossier.typeDossier === "bilan" ? "Bilan" : "Formation"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(dossier.createdAt).toLocaleDateString("fr-FR")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {montant.toLocaleString("fr-FR")} €
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => genererFacture(dossier.id)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Facture PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Informations Netz Informatique */}
        <Card>
          <CardHeader>
            <CardTitle>Coordonnées Bancaires - Netz Informatique</CardTitle>
            <CardDescription>
              Informations pour les virements OPCO
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Raison Sociale</p>
              <p className="font-medium">Netz Informatique</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">SIRET</p>
              <p className="font-medium">123 456 789 00012</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Adresse</p>
              <p className="font-medium">67200 Haguenau, France</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">IBAN</p>
              <p className="font-medium font-mono">FR76 1234 5678 9012 3456 7890 123</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">BIC</p>
              <p className="font-medium font-mono">BNPAFRPPXXX</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="font-medium">netz@netz.fr - 03 87 21 01 01</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Loader2, 
  Plus, 
  FileText, 
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Download,
  Euro,
  BarChart3,
  Calendar
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_LOGO } from "@/const";
import { LoginDialog } from "@/components/LoginDialog";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Statut = "nouveau" | "phase1" | "phase2" | "phase3" | "facture";

const STATUT_CONFIG: Record<Statut, { label: string; color: string; icon: any }> = {
  nouveau: { 
    label: "Nouveau", 
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: FileText
  },
  phase1: { 
    label: "Phase 1 - Préliminaire", 
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock
  },
  phase2: { 
    label: "Phase 2 - Investigation", 
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Users
  },
  phase3: { 
    label: "Phase 3 - Conclusion", 
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: TrendingUp
  },
  facture: { 
    label: "Facturé", 
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2
  }
};

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [selectedDossier, setSelectedDossier] = useState<any>(null);
  const [heuresInput, setHeuresInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: dossiers, isLoading: dossiersLoading, refetch } = trpc.dossier.lister.useQuery();

  const changerStatutMutation = trpc.dossier.changerStatut.useMutation({
    onSuccess: () => {
      toast.success("Statut mis à jour");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const mettreAJourHeuresMutation = trpc.dossier.mettreAJourHeures.useMutation({
    onSuccess: () => {
      toast.success("Heures mises à jour");
      refetch();
      setHeuresInput("");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const ajouterNotesMutation = trpc.dossier.ajouterNotes.useMutation({
    onSuccess: () => {
      toast.success("Notes ajoutées");
      refetch();
      setNotesInput("");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  if (loading) {
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
              Vous devez être connecté pour accéder au tableau de bord
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

  const dossiersByStatut = dossiers?.reduce((acc, dossier) => {
    if (!acc[dossier.statut]) {
      acc[dossier.statut] = [];
    }
    acc[dossier.statut].push(dossier);
    return acc;
  }, {} as Record<Statut, typeof dossiers>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Accueil
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <img src={APP_LOGO} alt="MonOPCO" className="h-8 w-8" />
                <div>
                  <h1 className="font-bold text-lg">Tableau de Bord</h1>
                  <p className="text-xs text-muted-foreground">
                    Bienvenue, {user?.name || user?.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/calendrier">
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendrier
                </Button>
              </Link>
              <Link href="/stats">
                <Button variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Statistiques
                </Button>
              </Link>
              <Link href="/facturation">
                <Button variant="outline">
                  <Euro className="mr-2 h-4 w-4" />
                  Facturation
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  toast.info("Génération de l'export Excel...");
                  // Utiliser fetch pour appeler directement l'API tRPC
                  fetch("/api/trpc/dashboard.exportExcel", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      const result = data.result.data;
                      if (result.success) {
                        // Décoder le base64 et télécharger
                        const blob = new Blob(
                          [Uint8Array.from(atob(result.data), c => c.charCodeAt(0))],
                          { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = result.filename;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success("Export Excel téléchargé !");
                      }
                    })
                    .catch((error) => {
                      toast.error("Erreur lors de l'export: " + error.message);
                    });
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Exporter Excel
              </Button>
              <Link href="/nouveau-dossier">
                <Button className="shadow-blue">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau Dossier
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Dossiers</CardDescription>
              <CardTitle className="text-3xl">
                {statsLoading ? "..." : stats?.totalDossiers || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Nouveaux</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {statsLoading ? "..." : stats?.nouveaux || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>En Cours</CardDescription>
              <CardTitle className="text-3xl text-orange-600">
                {statsLoading ? "..." : stats?.enCours || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Facturés</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {statsLoading ? "..." : stats?.factures || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Kanban Board */}
        {dossiersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {(Object.keys(STATUT_CONFIG) as Statut[]).map((statut) => {
              const config = STATUT_CONFIG[statut];
              const Icon = config.icon;
              const dossiersList = dossiersByStatut?.[statut] || [];

              return (
                <div key={statut} className="space-y-4">
                  {/* Column Header */}
                  <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-sm">{config.label}</h3>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {dossiersList.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Dossiers */}
                  <div className="space-y-3">
                    {dossiersList.map((dossier) => (
                      <Link key={dossier.id} href={`/dossier/${dossier.id}`}>
                        <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-sm">
                                {dossier.beneficiairePrenom} {dossier.beneficiaireNom}
                              </CardTitle>
                              <CardDescription className="text-xs mt-1">
                                {dossier.typeDossier === "bilan" ? "Bilan de Compétences" : "Formation"}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {dossier.typeDossier === "bilan" && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{dossier.heuresRealisees}h / {dossier.heuresTotal}h</span>
                            </div>
                          )}
                        </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dossier Detail Dialog */}
      <Dialog open={!!selectedDossier} onOpenChange={(open) => !open && setSelectedDossier(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDossier?.beneficiairePrenom} {selectedDossier?.beneficiaireNom}
            </DialogTitle>
            <DialogDescription>
              {selectedDossier?.typeDossier === "bilan" ? "Bilan de Compétences" : "Formation Professionnelle"}
            </DialogDescription>
          </DialogHeader>

          {selectedDossier && (
            <div className="space-y-6">
              {/* Informations */}
              <div className="space-y-2">
                <h4 className="font-semibold">Informations</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedDossier.beneficiaireEmail}</p>
                  </div>
                  {selectedDossier.beneficiaireTelephone && (
                    <div>
                      <span className="text-muted-foreground">Téléphone:</span>
                      <p className="font-medium">{selectedDossier.beneficiaireTelephone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Statut */}
              <div className="space-y-2">
                <h4 className="font-semibold">Changer le statut</h4>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(STATUT_CONFIG) as Statut[]).map((statut) => (
                    <Button
                      key={statut}
                      variant={selectedDossier.statut === statut ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (selectedDossier.statut !== statut) {
                          changerStatutMutation.mutate({
                            id: selectedDossier.id,
                            statut
                          });
                        }
                      }}
                      disabled={changerStatutMutation.isPending}
                    >
                      {STATUT_CONFIG[statut].label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Heures (pour Bilan) */}
              {selectedDossier.typeDossier === "bilan" && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Heures réalisées</h4>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Heures"
                      value={heuresInput}
                      onChange={(e) => setHeuresInput(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button
                      onClick={() => {
                        const heures = parseInt(heuresInput);
                        if (!isNaN(heures) && heures >= 0) {
                          mettreAJourHeuresMutation.mutate({
                            id: selectedDossier.id,
                            heuresRealisees: heures
                          });
                        }
                      }}
                      disabled={mettreAJourHeuresMutation.isPending || !heuresInput}
                    >
                      Mettre à jour
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Actuellement: {selectedDossier.heuresRealisees}h / {selectedDossier.heuresTotal}h
                  </p>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <h4 className="font-semibold">Notes</h4>
                {selectedDossier.notes && (
                  <div className="bg-muted p-3 rounded-lg text-sm mb-2">
                    {selectedDossier.notes}
                  </div>
                )}
                <Textarea
                  placeholder="Ajouter des notes..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={() => {
                    if (notesInput.trim()) {
                      ajouterNotesMutation.mutate({
                        id: selectedDossier.id,
                        notes: notesInput
                      });
                    }
                  }}
                  disabled={ajouterNotesMutation.isPending || !notesInput.trim()}
                >
                  Enregistrer les notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

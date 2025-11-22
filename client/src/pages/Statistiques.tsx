import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, TrendingUp, Users, Clock, Euro } from "lucide-react";
import { Link } from "wouter";
import { APP_LOGO } from "@/const";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Statistiques() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: dossiers } = trpc.dossier.lister.useQuery();

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Accès Restreint</CardTitle>
            <CardDescription>
              Vous devez être connecté pour accéder aux statistiques.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Préparer les données pour les graphiques
  const dossiersParOPCO = dossiers?.reduce((acc: Record<string, number>, d: any) => {
    const opco = d.entreprise?.opco || "Non défini";
    acc[opco] = (acc[opco] || 0) + 1;
    return acc;
  }, {}) || {};

  const dossiersParStatut = dossiers?.reduce((acc: Record<string, number>, d: any) => {
    acc[d.statut] = (acc[d.statut] || 0) + 1;
    return acc;
  }, {}) || {};

  // Graphique OPCO (Bar)
  const opcoData = {
    labels: Object.keys(dossiersParOPCO),
    datasets: [
      {
        label: "Nombre de dossiers",
        data: Object.values(dossiersParOPCO),
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Graphique Statuts (Pie)
  const statutData = {
    labels: ["Nouveau", "Phase 1", "Phase 2", "Phase 3", "Facturé"],
    datasets: [
      {
        label: "Dossiers par statut",
        data: [
          dossiersParStatut["nouveau"] || 0,
          dossiersParStatut["phase1"] || 0,
          dossiersParStatut["phase2"] || 0,
          dossiersParStatut["phase3"] || 0,
          dossiersParStatut["facture"] || 0,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.6)",
          "rgba(251, 191, 36, 0.6)",
          "rgba(251, 146, 60, 0.6)",
          "rgba(168, 85, 247, 0.6)",
          "rgba(34, 197, 94, 0.6)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(251, 146, 60, 1)",
          "rgba(168, 85, 247, 1)",
          "rgba(34, 197, 94, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Graphique Évolution mensuelle (Line)
  const dossiersParMois = dossiers?.reduce((acc: Record<string, number>, d: any) => {
    const date = new Date(d.createdAt);
    const mois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    acc[mois] = (acc[mois] || 0) + 1;
    return acc;
  }, {}) || {};

  const moisSorted = Object.keys(dossiersParMois).sort();
  const evolutionData = {
    labels: moisSorted,
    datasets: [
      {
        label: "Nouveaux dossiers",
        data: moisSorted.map(m => dossiersParMois[m]),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
      },
    ],
  };

  // Calculer le taux de conversion
  const totalDossiers = dossiers?.length || 0;
  const dossiersFactures = dossiersParStatut["facture"] || 0;
  const tauxConversion = totalDossiers > 0 ? ((dossiersFactures / totalDossiers) * 100).toFixed(1) : "0.0";

  // Calculer le temps moyen de traitement
  const dossiersTermines = dossiers?.filter((d: any) => d.statut === "facture") || [];
  const tempsMoyen = dossiersTermines.length > 0
    ? dossiersTermines.reduce((acc: number, d: any) => {
        const debut = new Date(d.createdAt).getTime();
        const fin = new Date(d.updatedAt).getTime();
        const jours = (fin - debut) / (1000 * 60 * 60 * 24);
        return acc + jours;
      }, 0) / dossiersTermines.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
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
                  <h1 className="font-bold text-lg">Statistiques</h1>
                  <p className="text-xs text-muted-foreground">
                    Analyse des performances OPCO
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dossiers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDossiers || 0}</div>
              <p className="text-xs text-muted-foreground">Tous statuts confondus</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tauxConversion}%</div>
              <p className="text-xs text-muted-foreground">Nouveau → Facturé</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tempsMoyen.toFixed(0)} jours</div>
              <p className="text-xs text-muted-foreground">Création → Facturation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dossiers Facturés</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dossiersFactures}</div>
              <p className="text-xs text-muted-foreground">Prêts pour facturation</p>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Dossiers par OPCO</CardTitle>
              <CardDescription>Répartition des dossiers par opérateur de compétences</CardDescription>
            </CardHeader>
            <CardContent>
              <Bar data={opcoData} options={{ responsive: true, maintainAspectRatio: true }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition par Statut</CardTitle>
              <CardDescription>État d'avancement des dossiers</CardDescription>
            </CardHeader>
            <CardContent>
              <Pie data={statutData} options={{ responsive: true, maintainAspectRatio: true }} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Évolution Mensuelle</CardTitle>
            <CardDescription>Nombre de nouveaux dossiers créés par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <Line data={evolutionData} options={{ responsive: true, maintainAspectRatio: true }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

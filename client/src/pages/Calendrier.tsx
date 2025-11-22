import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import DashboardLayout from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Calendar, Clock, Plus, Trash2, Edit, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function Calendrier() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSeance, setSelectedSeance] = useState<any>(null);
  
  // Récupérer toutes les séances
  const { data: seances, isLoading } = trpc.seances.list.useQuery();

  // Récupérer tous les dossiers pour le sélecteur
  const { data: dossiers } = trpc.dossier.lister.useQuery();

  // Mutation pour créer une séance
  const createSeance = trpc.seances.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["seances", "list"]] });
      toast.success("Séance créée avec succès");
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast.error("Erreur lors de la création de la séance");
    },
  });

  // Mutation pour supprimer une séance
  const deleteSeance = trpc.seances.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["seances", "list"]] });
      toast.success("Séance supprimée");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  // Mutation pour mettre à jour le statut
  const updateSeanceStatut = trpc.seances.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["seances", "list"]] });
      toast.success("Statut mis à jour");
    },
  });

  const handleCreateSeance = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const dateDebut = new Date(formData.get("dateDebut") as string);
    const dureeMinutes = parseInt(formData.get("dureeMinutes") as string);
    const dateFin = new Date(dateDebut.getTime() + dureeMinutes * 60000);

    createSeance.mutate({
      dossierId: parseInt(formData.get("dossierId") as string),
      titre: formData.get("titre") as string,
      description: formData.get("description") as string,
      dateDebut: dateDebut.toISOString(),
      dateFin: dateFin.toISOString(),
      dureeMinutes,
      phase: formData.get("phase") as "phase1" | "phase2" | "phase3",
      notes: formData.get("notes") as string,
    });
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case "phase1": return "Phase 1 - Préliminaire";
      case "phase2": return "Phase 2 - Investigation";
      case "phase3": return "Phase 3 - Conclusion";
      default: return phase;
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "planifie":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Calendar className="w-3 h-3 mr-1" /> Planifié</span>;
      case "termine":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Terminé</span>;
      case "annule":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Annulé</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{statut}</span>;
    }
  };

  // Grouper les séances par date
  const seancesGroupedByDate = seances?.reduce((acc: any, seance: any) => {
    const date = new Date(seance.dateDebut).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(seance);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📅 Calendrier des Séances</h1>
            <p className="text-gray-600 mt-1">Planifiez et gérez les rendez-vous pour les bilans de compétences</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Séance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleCreateSeance}>
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle séance</DialogTitle>
                  <DialogDescription>
                    Planifiez un rendez-vous pour un dossier de bilan de compétences
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dossierId">Dossier</Label>
                    <Select name="dossierId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un dossier" />
                      </SelectTrigger>
                      <SelectContent>
                        {dossiers?.map((dossier: any) => (
                          <SelectItem key={dossier.id} value={dossier.id.toString()}>
                            {dossier.reference} - {dossier.beneficiaireNom} {dossier.beneficiairePrenom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="titre">Titre</Label>
                    <Input
                      id="titre"
                      name="titre"
                      placeholder="Ex: Séance 1 - Entretien préliminaire"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phase">Phase du bilan</Label>
                    <Select name="phase" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une phase" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phase1">Phase 1 - Préliminaire</SelectItem>
                        <SelectItem value="phase2">Phase 2 - Investigation</SelectItem>
                        <SelectItem value="phase3">Phase 3 - Conclusion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="dateDebut">Date et heure</Label>
                      <Input
                        id="dateDebut"
                        name="dateDebut"
                        type="datetime-local"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="dureeMinutes">Durée (minutes)</Label>
                      <Input
                        id="dureeMinutes"
                        name="dureeMinutes"
                        type="number"
                        defaultValue="120"
                        min="30"
                        step="30"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Objectifs de la séance..."
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Notes internes..."
                      rows={2}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createSeance.isPending}>
                    {createSeance.isPending ? "Création..." : "Créer la séance"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Liste des séances */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Chargement des séances...</p>
          </div>
        ) : seances && seances.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(seancesGroupedByDate || {}).map(([date, seancesOfDay]: [string, any]) => (
              <div key={date}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 capitalize">{date}</h2>
                <div className="space-y-3">
                  {seancesOfDay.map((seance: any) => {
                    const dossier = dossiers?.find((d: any) => d.id === seance.dossierId);
                    return (
                      <Card key={seance.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">{seance.titre}</h3>
                                {getStatutBadge(seance.statut)}
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {getPhaseLabel(seance.phase)}
                                </span>
                              </div>
                              
                              {dossier && (
                                <p className="text-sm text-gray-600 mb-2">
                                  📁 {dossier.reference} - {dossier.beneficiaireNom} {dossier.beneficiairePrenom}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {new Date(seance.dateDebut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                  {" - "}
                                  {new Date(seance.dateFin).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                <span>({seance.dureeMinutes} min)</span>
                              </div>

                              {seance.description && (
                                <p className="text-sm text-gray-600 mt-2">{seance.description}</p>
                              )}

                              {seance.notes && (
                                <p className="text-xs text-gray-500 mt-2 italic">📝 {seance.notes}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {seance.statut === "planifie" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => updateSeanceStatut.mutate({ id: seance.id, statut: "termine" })}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => updateSeanceStatut.mutate({ id: seance.id, statut: "annule" })}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  if (confirm("Êtes-vous sûr de vouloir supprimer cette séance ?")) {
                                    deleteSeance.mutate(seance.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune séance planifiée</h3>
              <p className="text-gray-600 mb-4">Commencez par créer votre première séance</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer une séance
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

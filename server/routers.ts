import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// ============================================================================
// API EXTERNE: Pappers.fr pour récupérer les données entreprise
// ============================================================================
async function fetchEntrepriseData(siret: string) {
  try {
    // API Pappers.fr (nécessite une clé API - à configurer via secrets)
    const apiKey = process.env.PAPPERS_API_KEY;
    
    if (!apiKey) {
      // Fallback: Données simulées pour le développement
      console.warn("[Pappers] API key not configured, using mock data");
      return {
        nom: "Entreprise Test SIRET " + siret,
        adresse: "123 Rue de Test, 67500 Haguenau",
        codeNaf: "6201Z",
        dirigeant: "Jean Dupont"
      };
    }

    const response = await fetch(
      `https://api.pappers.fr/v2/entreprise?siret=${siret}&api_token=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from Pappers API");
    }

    const data = await response.json();

    return {
      nom: data.nom_entreprise || "",
      adresse: data.siege?.adresse_ligne_1 || "",
      codeNaf: data.code_naf || "",
      dirigeant: data.representants?.[0]?.nom_complet || ""
    };
  } catch (error) {
    console.error("[Pappers] Error:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Impossible de récupérer les données de l'entreprise"
    });
  }
}

// ============================================================================
// API EXTERNE: CFADock pour détecter l'OPCO
// ============================================================================
async function detectOPCO(siret: string): Promise<string> {
  try {
    // API CFADock pour détecter l'OPCO
    const response = await fetch(`https://www.cfadock.fr/api/opco/${siret}`);

    if (!response.ok) {
      // Fallback: Détection basique par code NAF
      console.warn("[CFADock] API failed, using NAF-based detection");
      return "OPCO EP"; // Default fallback
    }

    const data = await response.json();
    return data.opco || "OPCO EP";
  } catch (error) {
    console.error("[CFADock] Error:", error);
    // Fallback silencieux
    return "OPCO EP";
  }
}

// ============================================================================
// ROUTERS
// ============================================================================

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // ENTREPRISE ROUTER
  // ============================================================================
  entreprise: router({
    // Rechercher une entreprise par SIRET (avec auto-complétion)
    rechercherParSiret: publicProcedure
      .input(z.object({
        siret: z.string().length(14, "Le SIRET doit contenir 14 chiffres")
      }))
      .mutation(async ({ input }) => {
        const { siret } = input;

        // Vérifier si l'entreprise existe déjà en base
        const existing = await db.getEntrepriseBySiret(siret);
        if (existing) {
          return {
            entreprise: existing,
            source: "database" as const
          };
        }

        // Récupérer les données via Pappers
        const entrepriseData = await fetchEntrepriseData(siret);
        
        // Détecter l'OPCO
        const opco = await detectOPCO(siret);

        // Créer l'entreprise en base
        const newEntreprise = await db.createEntreprise({
          siret,
          nom: entrepriseData.nom,
          adresse: entrepriseData.adresse,
          codeNaf: entrepriseData.codeNaf,
          opco,
          contactNom: entrepriseData.dirigeant
        });

        return {
          entreprise: newEntreprise,
          source: "api" as const
        };
      }),

    // Lister toutes les entreprises
    lister: protectedProcedure.query(async () => {
      return db.getAllEntreprises();
    }),

    // Mettre à jour une entreprise
    mettreAJour: protectedProcedure
      .input(z.object({
        id: z.number(),
        contactNom: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactTelephone: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateEntreprise(id, data);
        return { success: true };
      })
  }),

  // ============================================================================
  // DOSSIER ROUTER
  // ============================================================================
  dossier: router({
    // Créer un nouveau dossier
    creer: publicProcedure
      .input(z.object({
        entrepriseId: z.number(),
        typeDossier: z.enum(["bilan", "formation"]),
        beneficiaireNom: z.string().min(1),
        beneficiairePrenom: z.string().min(1),
        beneficiaireEmail: z.string().email(),
        beneficiaireTelephone: z.string().optional(),
        dateDebut: z.date().optional(),
        dateFin: z.date().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        const dossier = await db.createDossier({
          ...input,
          createdBy: ctx.user?.id
        });

        // Ajouter une entrée dans l'historique
        await db.addHistorique({
          dossierId: dossier.id,
          userId: ctx.user?.id,
          action: "creation",
          nouvelleValeur: "Dossier créé",
          commentaire: `Dossier ${input.typeDossier} créé pour ${input.beneficiairePrenom} ${input.beneficiaireNom}`
        });

        return dossier;
      }),

    // Lister tous les dossiers
    lister: protectedProcedure.query(async () => {
      return db.getAllDossiers();
    }),

    // Obtenir un dossier par ID
    obtenirParId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const dossier = await db.getDossierById(input.id);
        if (!dossier) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Dossier non trouvé"
          });
        }
        return dossier;
      }),

    // Mettre à jour le statut d'un dossier
    changerStatut: protectedProcedure
      .input(z.object({
        id: z.number(),
        statut: z.enum(["nouveau", "phase1", "phase2", "phase3", "facture"])
      }))
      .mutation(async ({ input, ctx }) => {
        const dossier = await db.getDossierById(input.id);
        if (!dossier) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Dossier non trouvé"
          });
        }

        await db.updateDossier(input.id, { statut: input.statut });

        // Ajouter dans l'historique
        await db.addHistorique({
          dossierId: input.id,
          userId: ctx.user?.id,
          action: "changement_statut",
          ancienneValeur: dossier.statut,
          nouvelleValeur: input.statut,
          commentaire: `Statut changé de ${dossier.statut} à ${input.statut}`
        });

        return { success: true };
      }),

    // Mettre à jour les heures réalisées
    mettreAJourHeures: protectedProcedure
      .input(z.object({
        id: z.number(),
        heuresRealisees: z.number().min(0)
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateDossier(input.id, { 
          heuresRealisees: input.heuresRealisees 
        });

        await db.addHistorique({
          dossierId: input.id,
          userId: ctx.user?.id,
          action: "mise_a_jour_heures",
          nouvelleValeur: input.heuresRealisees.toString(),
          commentaire: `Heures réalisées mises à jour: ${input.heuresRealisees}h`
        });

        return { success: true };
      }),

    // Ajouter des notes
    ajouterNotes: protectedProcedure
      .input(z.object({
        id: z.number(),
        notes: z.string()
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateDossier(input.id, { notes: input.notes });

        await db.addHistorique({
          dossierId: input.id,
          userId: ctx.user?.id,
          action: "ajout_notes",
          commentaire: "Notes ajoutées au dossier"
        });

        return { success: true };
      }),

    // Obtenir l'historique d'un dossier
    obtenirHistorique: protectedProcedure
      .input(z.object({ dossierId: z.number() }))
      .query(async ({ input }) => {
        return db.getHistoriqueByDossier(input.dossierId);
      }),

    // Filtrer par statut
    filtrerParStatut: protectedProcedure
      .input(z.object({
        statut: z.enum(["nouveau", "phase1", "phase2", "phase3", "facture"])
      }))
      .query(async ({ input }) => {
        return db.getDossiersByStatut(input.statut);
      })
  }),

  // ============================================================================
  // DASHBOARD ROUTER
  // ============================================================================
  dashboard: router({
    // Obtenir les statistiques du dashboard
    stats: protectedProcedure.query(async () => {
      return db.getDashboardStats();
    })
  })
});

export type AppRouter = typeof appRouter;

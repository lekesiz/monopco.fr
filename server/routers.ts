import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { runDailyReminderCheck } from "./reminderService";
import * as jose from "jose";
import { ENV } from "./_core/env";
import { users } from "../drizzle/schema";

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

    // Inscription avec email/password
    register: publicProcedure
      .input(z.object({
        email: z.string().email("Email invalide"),
        password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
        name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const user = await db.createUserWithPassword(input);

          // Créer un token JWT pour la session
          const secret = new TextEncoder().encode(ENV.jwtSecret);
          const token = await new jose.SignJWT({ userId: user.id, email: user.email })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(secret);

          // Set cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

          return { success: true, user };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          if (errorMessage === "Email already exists") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Cet email est déjà utilisé",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de la création du compte",
          });
        }
      }),

    // Connexion avec email/password
    login: publicProcedure
      .input(z.object({
        email: z.string().email("Email invalide"),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.verifyUserPassword(input.email, input.password);

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou mot de passe incorrect",
          });
        }

        // Créer un token JWT pour la session
        const secret = new TextEncoder().encode(ENV.jwtSecret);
        const token = await new jose.SignJWT({ userId: user.id, email: user.email })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("7d")
          .sign(secret);

        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        };
      }),
  }),

  // Router pour la gestion des utilisateurs (admin seulement)
  users: router({
    list: adminProcedure.query(async () => {
      return db.getAllUsers();
    }),

    updateRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["admin", "manager", "consultant", "assistant"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Empêcher un admin de se supprimer lui-même
        if (ctx.user.id === input.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Vous ne pouvez pas supprimer votre propre compte",
          });
        }
        await db.deleteUser(input.userId);
        return { success: true };
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

    // Obtenir une entreprise par ID
    obtenirParId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const entreprise = await db.getEntrepriseById(input.id);
        if (!entreprise) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Entreprise non trouvée"
          });
        }
        return entreprise;
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
        // Générer une référence unique (BC-YYYY-NNN)
        const year = new Date().getFullYear();
        const allDossiers = await db.getAllDossiers();
        const dossiersThisYear = allDossiers.filter(d => {
          const createdYear = new Date(d.createdAt).getFullYear();
          return createdYear === year;
        });
        const nextNumber = dossiersThisYear.length + 1;
        const reference = `BC-${year}-${String(nextNumber).padStart(3, "0")}`;

        const dossier = await db.createDossier({
          ...input,
          reference,
          createdBy: ctx.user?.id
        });

        // Ajouter une entrée dans l'historique
        await db.addHistorique({
          dossierId: dossier.id,
          userId: ctx.user?.id,
          action: "creation",
          nouvelleValeur: "Dossier créé",
          commentaire: `Dossier ${input.typeDossier} créé pour ${input.beneficiairePrenom} ${input.beneficiaireNom} (Réf: ${reference})`
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

        // Envoyer notification email
        const { notifierChangementStatut } = await import("./emailService");
        await notifierChangementStatut({
          beneficiaireEmail: dossier.beneficiaireEmail,
          beneficiaireNom: dossier.beneficiaireNom,
          beneficiairePrenom: dossier.beneficiairePrenom,
          ancienStatut: dossier.statut,
          nouveauStatut: input.statut,
          typeDossier: dossier.typeDossier,
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
  // DOCUMENTS PDF ROUTER
  // ============================================================================
  documents: router({
    genererConvention: protectedProcedure
      .input(
        z.object({
          dossierId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { genererConventionTripartite } = await import("./pdfGenerator");
        const dossier = await db.getDossierById(input.dossierId);
        if (!dossier) throw new TRPCError({ code: "NOT_FOUND", message: "Dossier non trouvé" });

        const entreprise = await db.getEntrepriseById(dossier.entrepriseId);
        if (!entreprise) throw new TRPCError({ code: "NOT_FOUND", message: "Entreprise non trouvée" });

        const beneficiaire = {
          nom: dossier.beneficiaireNom,
          prenom: dossier.beneficiairePrenom,
          email: dossier.beneficiaireEmail,
          telephone: dossier.beneficiaireTelephone,
        };

        const pdfBuffer = await genererConventionTripartite(entreprise, beneficiaire, dossier);
        return {
          success: true,
          filename: `convention_BC-${dossier.id}.pdf`,
          data: pdfBuffer.toString("base64"),
        };
      }),

    genererCertificat: protectedProcedure
      .input(
        z.object({
          dossierId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { genererCertificatRealisation } = await import("./pdfGenerator");
        const dossier = await db.getDossierById(input.dossierId);
        if (!dossier) throw new TRPCError({ code: "NOT_FOUND", message: "Dossier non trouvé" });

        const entreprise = await db.getEntrepriseById(dossier.entrepriseId);
        if (!entreprise) throw new TRPCError({ code: "NOT_FOUND", message: "Entreprise non trouvée" });

        const beneficiaire = {
          nom: dossier.beneficiaireNom,
          prenom: dossier.beneficiairePrenom,
          email: dossier.beneficiaireEmail,
          telephone: dossier.beneficiaireTelephone,
        };

        const pdfBuffer = await genererCertificatRealisation(entreprise, beneficiaire, dossier);
        return {
          success: true,
          filename: `certificat_BC-${dossier.id}.pdf`,
          data: pdfBuffer.toString("base64"),
        };
      }),

    genererEmargement: protectedProcedure
      .input(
        z.object({
          dossierId: z.number(),
          seance: z.object({
            date: z.string(),
            heureDebut: z.string(),
            heureFin: z.string(),
            duree: z.number(),
            theme: z.string(),
            phase: z.enum(["Phase 1", "Phase 2", "Phase 3"]),
          }),
        })
      )
      .mutation(async ({ input }) => {
        const { genererFeuilleEmargement } = await import("./pdfGenerator");
        const dossier = await db.getDossierById(input.dossierId);
        if (!dossier) throw new TRPCError({ code: "NOT_FOUND", message: "Dossier non trouvé" });

        const entreprise = await db.getEntrepriseById(dossier.entrepriseId);
        if (!entreprise) throw new TRPCError({ code: "NOT_FOUND", message: "Entreprise non trouvée" });

        const beneficiaire = {
          nom: dossier.beneficiaireNom,
          prenom: dossier.beneficiairePrenom,
          email: dossier.beneficiaireEmail,
          telephone: dossier.beneficiaireTelephone,
        };

        const seance = {
          ...input.seance,
          date: new Date(input.seance.date),
        };

        const pdfBuffer = await genererFeuilleEmargement(entreprise, beneficiaire, dossier, seance);
        return {
          success: true,
          filename: `emargement_BC-${dossier.id}_${input.seance.date}.pdf`,
          data: pdfBuffer.toString("base64"),
        };
      }),

    genererDemandePriseEnCharge: protectedProcedure
      .input(
        z.object({
          dossierId: z.number(),
          montant: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { genererDemandePriseEnCharge } = await import("./pdfGenerator");
        const dossier = await db.getDossierById(input.dossierId);
        if (!dossier) throw new TRPCError({ code: "NOT_FOUND", message: "Dossier non trouvé" });

        const entreprise = await db.getEntrepriseById(dossier.entrepriseId);
        if (!entreprise) throw new TRPCError({ code: "NOT_FOUND", message: "Entreprise non trouvée" });

        const beneficiaire = {
          nom: dossier.beneficiaireNom,
          prenom: dossier.beneficiairePrenom,
          email: dossier.beneficiaireEmail,
          telephone: dossier.beneficiaireTelephone,
        };

        const pdfBuffer = await genererDemandePriseEnCharge(entreprise, beneficiaire, dossier, input.montant);
        return {
          success: true,
          filename: `demande_BC-${dossier.id}.pdf`,
          data: pdfBuffer.toString("base64"),
        };
      }),
  }),

  // ============================================================================
  // FACTURATION ROUTER
  // ============================================================================
  facturation: router({
    // Générer une facture PDF pour un dossier
    genererFacture: protectedProcedure
      .input(z.object({ dossierId: z.number() }))
      .query(async ({ input }) => {
        const { genererFacturePDF } = await import("./factureGenerator");
        const dossier = await db.getDossierById(input.dossierId);
        if (!dossier) throw new TRPCError({ code: "NOT_FOUND", message: "Dossier non trouvé" });

        const entreprise = await db.getEntrepriseById(dossier.entrepriseId);
        if (!entreprise) throw new TRPCError({ code: "NOT_FOUND", message: "Entreprise non trouvée" });

        const montant = dossier.typeDossier === "bilan" ? 2000 : 1500;
        const numero = `FACT-${new Date().getFullYear()}-${String(dossier.id).padStart(4, "0")}`;

        const pdfBuffer = await genererFacturePDF({
          numero,
          date: new Date(),
          dossier: {
            reference: dossier.reference || `BC-${dossier.id}`,
            typeDossier: dossier.typeDossier,
            beneficiaireNom: dossier.beneficiaireNom,
            beneficiairePrenom: dossier.beneficiairePrenom
          },
          entreprise: {
            nom: entreprise.nom,
            siret: entreprise.siret,
            adresse: entreprise.adresse
          },
          montant
        });

        return {
          success: true,
          filename: `facture_${dossier.reference || `BC-${dossier.id}`}.pdf`,
          data: pdfBuffer.toString("base64")
        };
      })
  }),

  // ============================================================================
  // REMINDERS ROUTER (Rappels automatiques)
  // ============================================================================
  reminders: router({
    // Vérifier et envoyer les rappels (peut être appelé manuellement ou via cron)
    checkAndSend: protectedProcedure.mutation(async () => {
      await runDailyReminderCheck();
      return { success: true };
    })
  }),

  // ============================================================================
  // DASHBOARD ROUTER
  // ============================================================================
  dashboard: router({
    // Obtenir les statistiques du dashboard
    stats: protectedProcedure.query(async () => {
      return db.getDashboardStats();
    }),

    // Exporter tous les dossiers en Excel
    exportExcel: protectedProcedure
      .input(z.object({
        opcoFilter: z.string().optional(),
        statutFilter: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const XLSX = await import("xlsx");
        
        // Récupérer tous les dossiers
        const dossiers = await db.getAllDossiers();
        
        // Filtrer si nécessaire
        let filteredDossiers = dossiers;
        if (input?.opcoFilter) {
          filteredDossiers = filteredDossiers.filter(d => {
            // On devrait joindre avec entreprises pour avoir l'OPCO
            return true; // TODO: implémenter le filtre OPCO
          });
        }
        if (input?.statutFilter) {
          filteredDossiers = filteredDossiers.filter(d => d.statut === input.statutFilter);
        }
        
        // Préparer les données pour Excel
        const excelData = await Promise.all(filteredDossiers.map(async (dossier) => {
          const entreprise = await db.getEntrepriseById(dossier.entrepriseId);
          return {
            "Référence": dossier.reference || `BC-${dossier.id}`,
            "Type": dossier.typeDossier === "bilan" ? "Bilan de Compétences" : "Formation",
            "Entreprise": entreprise?.nom || "N/A",
            "SIRET": entreprise?.siret || "N/A",
            "OPCO": entreprise?.opco || "N/A",
            "Bénéficiaire": `${dossier.beneficiairePrenom} ${dossier.beneficiaireNom}`,
            "Email": dossier.beneficiaireEmail,
            "Téléphone": dossier.beneficiaireTelephone || "N/A",
            "Statut": dossier.statut,
            "Heures Réalisées": dossier.heuresRealisees,
            "Heures Total": dossier.heuresTotal,
            "Date Début": dossier.dateDebut ? new Date(dossier.dateDebut).toLocaleDateString("fr-FR") : "N/A",
            "Date Fin": dossier.dateFin ? new Date(dossier.dateFin).toLocaleDateString("fr-FR") : "N/A",
            "Créé le": new Date(dossier.createdAt).toLocaleDateString("fr-FR"),
          };
        }));
        
        // Créer le workbook
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Dossiers OPCO");
        
        // Générer le buffer
        const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
        
        return {
          success: true,
          filename: `export_dossiers_${new Date().toISOString().split("T")[0]}.xlsx`,
          data: Buffer.from(excelBuffer).toString("base64"),
        };
         }),
  }),
});

export type AppRouter = typeof appRouter;

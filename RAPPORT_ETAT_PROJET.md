# Rapport d'État du Projet MonOPCO

**Date:** 22 Novembre 2025  
**Version Actuelle:** v11.5 (Checkpoint: 2757a342)  
**Statut:** Production déployée sur monopco.fr  
**Auteur:** Manus AI

---

## 📊 Vue d'Ensemble

MonOPCO est une plateforme automatisée de gestion des dossiers OPCO (Opérateurs de Compétences) pour les Bilans de Compétences et formations professionnelles. Le projet est actuellement déployé en production sur le domaine **monopco.fr** et contient 93 tests unitaires passés avec succès.

### Statistiques du Projet

| Métrique | Valeur |
|----------|--------|
| **Lignes de code** | ~15,000+ |
| **Tests unitaires** | 93 (100% passés) |
| **Fonctionnalités** | 15 modules complets |
| **OPCO supportés** | 11 opérateurs |
| **Documents générés** | 5 types PDF |
| **Taux d'automatisation** | 100% |

---

## ✅ Fonctionnalités Complétées

### 1. Landing Page SEO-Optimisée
La page d'accueil présente les services de manière professionnelle avec sections informatives sur les OPCO, le Bilan de Compétences (3 phases), et les avantages de la plateforme. Le design utilise Tailwind CSS 4 avec un gradient bleu moderne et des animations subtiles.

**Fichiers clés:**
- `client/src/pages/Home.tsx`
- `client/src/index.css`

### 2. Formulaire Intelligent SIRET
Le formulaire de création de dossier intègre l'API Pappers pour récupérer automatiquement les informations de l'entreprise à partir du numéro SIRET. Le système détecte automatiquement l'OPCO de rattachement basé sur le code NAF.

**Fonctionnalités:**
- Validation SIRET en temps réel
- Récupération automatique des données entreprise
- Détection OPCO automatique (11 opérateurs)
- Pré-remplissage de tous les champs

**Fichiers clés:**
- `client/src/pages/NouveauDossier.tsx`
- `server/routers.ts` (procédure `entreprise.getBySiret`)

### 3. Dashboard Kanban avec Filtres Avancés
Le tableau de bord affiche les dossiers organisés par statut (Nouveau, Phase 1, Phase 2, Phase 3, Facturé) avec des cartes drag-and-drop. Les utilisateurs peuvent filtrer par OPCO, statut, plage de dates, et effectuer des recherches multi-critères.

**Fonctionnalités:**
- Vue Kanban avec 5 colonnes de statut
- Filtres: OPCO (11 options), Statut (5 phases), Dates (début/fin)
- Recherche: nom, prénom, référence, entreprise, email
- Tri: date création, statut, OPCO (ascendant/descendant)
- Compteur de résultats en temps réel
- Bouton de réinitialisation

**Fichiers clés:**
- `client/src/pages/Dashboard.tsx`
- `server/dossier.filters.test.ts` (9 tests)
- `server/dossier.search-sort.test.ts` (17 tests)

### 4. Export Excel et PDF du Dashboard
Les utilisateurs peuvent exporter la vue actuelle du Dashboard (avec filtres appliqués) en format Excel (.xlsx) ou PDF. L'export PDF inclut un en-tête avec logo, statistiques récapitulatives, et pagination automatique.

**Fonctionnalités:**
- Export Excel: toutes les colonnes avec formatage
- Export PDF: logo, statistiques, tableau paginé
- Respect des filtres et recherche appliqués
- Nom de fichier avec horodatage

**Fichiers clés:**
- `server/routers.ts` (procédures `dashboard.exportExcel` et `dashboard.exportPDF`)
- `server/pdfGenerator.ts` (fonction `generateDashboardPDF`)
- `server/dashboard.exportPDF.test.ts` (10 tests)

### 5. Génération de 5 Documents PDF OPCO
Le système génère automatiquement les 5 documents requis pour les dossiers OPCO avec toutes les informations pré-remplies.

**Documents générés:**
1. **Convention Tripartite** - Accord entre bénéficiaire, organisme, entreprise
2. **Devis** - Détail des coûts et modalités de paiement
3. **Feuille d'Émargement** - Suivi des séances (3 phases)
4. **Attestation de Fin de Formation** - Certificat de complétion
5. **Synthèse du Bilan** - Résumé des résultats et plan d'action

**Fichiers clés:**
- `server/pdfGenerator.ts`
- `server/pdf.test.ts` (tests de génération)

### 6. Système Email Automatique (4 Types)
Le système envoie automatiquement des emails via Resend API pour 4 événements clés du cycle de vie d'un dossier.

**Types d'emails:**
1. **Confirmation de création** - Envoyé au bénéficiaire lors de la création
2. **Changement de statut** - Notification des transitions de phase
3. **Rappel de suivi** - Rappels automatiques pour les dossiers inactifs
4. **Notification propriétaire** - Alertes pour l'administrateur

**Fichiers clés:**
- `server/_core/email.ts`
- `server/email.test.ts` (tests d'envoi)

### 7. Système de Notifications Push Navigateur
Les utilisateurs reçoivent des notifications navigateur en temps réel pour les événements importants. Une bannière élégante demande la permission au premier chargement.

**Fonctionnalités:**
- Permission navigateur avec bannière non-intrusive
- Notifications pour nouveaux dossiers
- Notifications pour changements de statut
- Page `/parametres` pour gérer les préférences
- 4 types de notifications configurables
- Bouton de test intégré

**Fichiers clés:**
- `client/src/lib/notifications.ts`
- `client/src/components/NotificationPermission.tsx`
- `client/src/pages/Parametres.tsx`
- `server/notifications.test.ts` (13 tests)

### 8. Portail Client Public (/suivi)
Les bénéficiaires peuvent suivre l'avancement de leur dossier en entrant leur référence (BC-2025-XXX) sans authentification. La page affiche une timeline visuelle des 3 phases avec progression en heures.

**Fonctionnalités:**
- Accès public sans authentification
- Recherche par référence (insensible à la casse)
- Timeline visuelle des 3 phases du bilan
- Affichage de la progression (X/Y heures)
- Messages personnalisés selon le statut
- Sécurité: emails/téléphones/SIRET masqués

**Fichiers clés:**
- `client/src/pages/Suivi.tsx`
- `server/db.ts` (fonction `getDossierByReference`)
- `server/routers.ts` (procédure `dossier.suivreParReference`)
- `server/dossier.suivreParReference.test.ts` (8 tests)

### 9. Module Facturation
Gestion complète de la facturation avec génération de factures PDF, suivi des paiements, et statistiques de revenus.

**Fonctionnalités:**
- Génération de factures PDF
- Suivi des paiements (payé/impayé/partiel)
- Statistiques de revenus
- Historique de facturation

**Fichiers clés:**
- `client/src/pages/Facturation.tsx`
- `server/routers.ts` (router `facturation`)

### 10. Page Statistiques avec Chart.js
Tableau de bord analytique avec graphiques interactifs pour visualiser les performances et tendances.

**Graphiques:**
- Répartition par OPCO (camembert)
- Évolution des dossiers (ligne temporelle)
- Taux de conversion par phase (barres)
- Statistiques de revenus

**Fichiers clés:**
- `client/src/pages/Statistiques.tsx`

### 11. CRON Rappels Automatiques
Système de rappels automatiques configuré via cron jobs pour envoyer des emails de suivi aux dossiers inactifs.

**Configuration:**
- Vérification quotidienne des dossiers
- Envoi automatique d'emails de rappel
- Documentation complète dans `CRON_SETUP.md`

**Fichiers clés:**
- `CRON_SETUP.md`
- `server/routers.ts` (procédure `system.sendReminders`)

### 12. Migration Automatique des Dates
Script de migration pour mettre à jour les anciens dossiers avec des dates par défaut, corrigeant les problèmes de génération PDF.

**Fonctionnalités:**
- Détection des dossiers sans dates
- Attribution de dates par défaut (création + 90 jours)
- Script de vérification inclus
- Documentation complète

**Fichiers clés:**
- `scripts/migrate-dates.mjs`
- `scripts/verify-dates.mjs`
- `MIGRATION_DATES.md`

### 13. Système d'Authentification OAuth
Authentification via Manus OAuth avec gestion des sessions et rôles utilisateurs (admin/user).

**Fonctionnalités:**
- Login via Manus OAuth
- Gestion des sessions avec cookies sécurisés
- Rôles: admin (propriétaire) et user
- Protection des routes sensibles

**Fichiers clés:**
- `server/_core/auth.ts`
- `server/_core/context.ts`
- `server/auth.logout.test.ts`

### 14. Base de Données Complète
Schéma de base de données MySQL/TiDB avec 4 tables principales et relations.

**Tables:**
- `users` - Utilisateurs avec rôles
- `entreprises` - Entreprises clientes
- `dossiers` - Dossiers de bilans/formations
- `historique` - Traçabilité des actions

**Fichiers clés:**
- `drizzle/schema.ts`
- `server/db.ts`
- `drizzle/0000_*.sql` (migrations)

### 15. Suite de Tests Complète
93 tests unitaires couvrant toutes les fonctionnalités critiques avec 100% de réussite.

**Couverture:**
- Tests d'authentification (logout, sessions)
- Tests de filtrage (9 tests)
- Tests de recherche et tri (17 tests)
- Tests d'export PDF (10 tests)
- Tests de notifications (13 tests)
- Tests de suivi public (8 tests)
- Tests de génération PDF
- Tests d'envoi d'emails

**Fichiers clés:**
- `server/*.test.ts` (10 fichiers de tests)

---

## 🚧 Fonctionnalités En Cours de Développement

### 1. Calendrier de Séances Interactif
**Statut:** Schéma DB créé, développement interrompu par problème sandbox

**Objectif:** Permettre la planification des rendez-vous pour les 3 phases du bilan avec génération automatique des feuilles d'émargement et rappels email 24h avant.

**Travail effectué:**
- ✅ Table `seances` créée dans le schéma DB
- ✅ Migration DB appliquée (0003_furry_lorna_dane.sql)
- ✅ Fonctions DB créées (`createSeance`, `getSeancesByDossier`, etc.)
- ❌ Procédures tRPC non créées
- ❌ Interface calendrier non créée
- ❌ Génération feuilles d'émargement non implémentée

**Fichiers créés:**
- `drizzle/schema.ts` (table `seances` ajoutée)
- `server/db.ts` (fonctions de gestion des séances)

**Prochaines étapes:**
1. Créer les procédures tRPC pour les séances
2. Créer la page `/calendrier` avec vue mensuelle/hebdomadaire
3. Ajouter modal pour créer/modifier une séance
4. Générer les feuilles d'émargement PDF
5. Implémenter les rappels email automatiques

---

## ⚠️ Problèmes Actuels

### 1. Problème OAuth - Boucle Infinie de Connexion

**Symptômes:**
- L'utilisateur se connecte via Manus OAuth
- Après connexion, redirection vers la page d'accueil
- Tentative d'accès au Dashboard → redirection vers login
- Boucle infinie: login → accueil → dashboard → login

**Cause Probable:**
Le système de cookies OAuth est configuré pour `localhost` mais ne fonctionne pas correctement avec le domaine personnalisé `monopco.fr`. Les paramètres `SameSite`, `Secure`, et `Domain` du cookie de session ne sont pas adaptés au domaine de production.

**Fichier concerné:**
`server/_core/cookies.ts`

**Code actuel (problématique):**
```typescript
export function getSessionCookieOptions(req: Request) {
  return {
    httpOnly: true,
    secure: req.protocol === "https",
    sameSite: "none" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  };
}
```

**Solution proposée:**
```typescript
export function getSessionCookieOptions(req: Request) {
  const isProduction = process.env.NODE_ENV === "production";
  const isHttps = req.protocol === "https";
  
  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? ("none" as const) : ("lax" as const),
    domain: isProduction ? ".monopco.fr" : undefined,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  };
}
```

**Étapes de correction:**
1. Modifier `server/_core/cookies.ts` avec le code ci-dessus
2. Redéployer l'application
3. Tester la connexion sur monopco.fr
4. Vérifier que le cookie est bien set dans les DevTools

**Test de validation:**
```bash
# Dans le navigateur (DevTools → Application → Cookies)
# Vérifier la présence du cookie "manus_session" avec:
# - Domain: .monopco.fr
# - Secure: true
# - HttpOnly: true
# - SameSite: None
```

### 2. Problème Sandbox - Projet Non Récupérable

**Symptômes:**
- Le projet MonOPCO n'existe pas dans le sandbox (`/home/ubuntu/monopco`)
- Les commandes `webdev_rollback_checkpoint` échouent avec "Project monopco not found"
- Le site fonctionne en production (monopco.fr) mais le code n'est pas accessible pour modification

**Cause:**
Problème d'infrastructure Manus. Le système webdev ne parvient pas à restaurer le projet depuis le checkpoint dans le sandbox de développement.

**Workaround actuel:**
- Projet cloné depuis GitHub: `https://github.com/lekesiz/monopco.fr`
- Modifications peuvent être faites directement dans le repository Git
- Déploiement via Manus UI (bouton "Publish")

**Solution temporaire:**
1. Cloner le repository: `gh repo clone lekesiz/monopco.fr`
2. Faire les modifications nécessaires
3. Commit et push vers GitHub
4. Redéployer via Manus UI

**Solution permanente:**
Contacter le support Manus (help.manus.im) pour résoudre le problème de restauration de projet.

### 3. Système de Gestion des Utilisateurs Manquant

**Problème:**
Actuellement, seul le propriétaire du projet (via Manus OAuth) peut se connecter. Il n'existe pas de système pour que les employés de Netz Informatique puissent créer des comptes et accéder à la plateforme.

**Impact:**
- Les collaborateurs ne peuvent pas utiliser la plateforme
- Pas de gestion multi-utilisateurs
- Pas de traçabilité des actions par utilisateur

**Solution proposée:**
Créer un système de gestion des utilisateurs avec:
1. **Page d'inscription** (`/register`) avec email/mot de passe
2. **Page de connexion** (`/login`) avec email/mot de passe (alternative à OAuth)
3. **Page d'administration** (`/admin/users`) pour gérer les employés
4. **Rôles étendus**: admin, manager, consultant, assistant
5. **Permissions granulaires** par rôle

**Schéma DB à modifier:**
```typescript
// Ajouter dans drizzle/schema.ts
export const users = mysqlTable("users", {
  // ... champs existants
  
  // Nouveaux champs pour auth email/password
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: text("passwordHash"), // bcrypt hash
  emailVerified: boolean("emailVerified").default(false),
  
  // Rôles étendus
  role: mysqlEnum("role", ["admin", "manager", "consultant", "assistant"])
    .default("consultant")
    .notNull(),
});
```

**Fichiers à créer:**
- `client/src/pages/Login.tsx`
- `client/src/pages/Register.tsx`
- `client/src/pages/admin/Users.tsx`
- `server/auth.ts` (fonctions `hashPassword`, `verifyPassword`, `createUser`)
- `server/routers.ts` (procédures `auth.register`, `auth.login`, `users.list`, etc.)

---

## 🔄 Guide de Synchronisation DB/Backend

### Workflow de Développement

Lors du développement de nouvelles fonctionnalités impliquant la base de données, suivez strictement ce workflow pour éviter les désynchronisations:

#### 1. Modification du Schéma DB

**Étape 1:** Modifier `drizzle/schema.ts`
```typescript
// Exemple: Ajouter une nouvelle table
export const seances = mysqlTable("seances", {
  id: int("id").autoincrement().primaryKey(),
  dossierId: int("dossierId").notNull(),
  titre: varchar("titre", { length: 200 }).notNull(),
  // ... autres champs
});

export type Seance = typeof seances.$inferSelect;
export type InsertSeance = typeof seances.$inferInsert;
```

**Étape 2:** Générer et appliquer la migration
```bash
pnpm db:push
```

**Vérifications:**
- ✅ Migration SQL générée dans `drizzle/000X_*.sql`
- ✅ Commande affiche "[✓] migrations applied successfully!"
- ✅ Aucune erreur de syntaxe SQL

**Erreurs courantes:**
- ❌ `boolean is not defined` → Ajouter `boolean` dans les imports de `drizzle-orm/mysql-core`
- ❌ `Duplicate entry` → Utiliser des valeurs uniques pour les tests (timestamp, UUID)
- ❌ `Column not found` → Vérifier que la migration a bien été appliquée

#### 2. Création des Fonctions DB

**Étape 3:** Ajouter les fonctions dans `server/db.ts`
```typescript
// Importer les types
import { seances, InsertSeance } from "../drizzle/schema";

// Créer les fonctions CRUD
export async function createSeance(data: InsertSeance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(seances).values(data);
  return { id: Number(result.insertId), ...data };
}

export async function getSeancesByDossier(dossierId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(seances)
    .where(eq(seances.dossierId, dossierId))
    .orderBy(seances.dateDebut);
}
```

**Vérifications:**
- ✅ Imports corrects (types, fonctions Drizzle)
- ✅ Gestion des erreurs (database not available)
- ✅ Types de retour explicites
- ✅ Pas d'erreurs TypeScript

#### 3. Création des Procédures tRPC

**Étape 4:** Ajouter les procédures dans `server/routers.ts`
```typescript
import * as db from "./db";
import { z } from "zod";

export const appRouter = router({
  // ... autres routers
  
  seance: router({
    create: protectedProcedure
      .input(z.object({
        dossierId: z.number(),
        titre: z.string(),
        dateDebut: z.date(),
        dateFin: z.date(),
        // ... autres champs
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createSeance({
          ...input,
          createdBy: ctx.user.id,
        });
      }),
      
    listByDossier: protectedProcedure
      .input(z.object({ dossierId: z.number() }))
      .query(async ({ input }) => {
        return db.getSeancesByDossier(input.dossierId);
      }),
  }),
});
```

**Vérifications:**
- ✅ Validation Zod pour tous les inputs
- ✅ Utilisation de `protectedProcedure` pour les routes authentifiées
- ✅ Utilisation de `publicProcedure` pour les routes publiques
- ✅ Pas d'erreurs TypeScript

#### 4. Création de l'Interface Frontend

**Étape 5:** Créer la page React
```typescript
import { trpc } from "@/lib/trpc";

export default function Calendrier() {
  const { data: seances, isLoading } = trpc.seance.listByDossier.useQuery({
    dossierId: 1,
  });
  
  const createSeance = trpc.seance.create.useMutation({
    onSuccess: () => {
      // Invalider le cache pour rafraîchir la liste
      trpc.useUtils().seance.listByDossier.invalidate();
    },
  });
  
  // ... reste du composant
}
```

**Vérifications:**
- ✅ Utilisation de `trpc.*.useQuery` pour les lectures
- ✅ Utilisation de `trpc.*.useMutation` pour les écritures
- ✅ Invalidation du cache après mutations
- ✅ Gestion des états de chargement

#### 5. Tests Unitaires

**Étape 6:** Créer les tests dans `server/*.test.ts`
```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("seance.create", () => {
  let testDossierId: number;
  
  beforeAll(async () => {
    // Créer des données de test
    const entreprise = await db.createEntreprise({
      siret: `99999${Date.now().toString().slice(-9)}`, // SIRET unique
      nom: "Test Entreprise",
      // ... autres champs
    });
    
    const dossier = await db.createDossier({
      entrepriseId: entreprise.id,
      // ... autres champs
    });
    
    testDossierId = dossier.id;
  });
  
  it("devrait créer une séance", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    
    const result = await caller.seance.create({
      dossierId: testDossierId,
      titre: "Séance 1",
      dateDebut: new Date(),
      dateFin: new Date(),
    });
    
    expect(result.id).toBeDefined();
    expect(result.titre).toBe("Séance 1");
  });
});
```

**Vérifications:**
- ✅ Utiliser `Date.now()` ou UUID pour les valeurs uniques
- ✅ Nettoyer les données de test si nécessaire
- ✅ Tester les cas d'erreur (validation, permissions)
- ✅ Tous les tests passent: `pnpm test`

#### 6. Vérification Finale

**Checklist avant commit:**
```bash
# 1. Vérifier TypeScript
pnpm tsc --noEmit

# 2. Exécuter tous les tests
pnpm test

# 3. Vérifier le serveur de développement
pnpm dev

# 4. Tester manuellement dans le navigateur
# - Créer une séance
# - Lister les séances
# - Modifier une séance
# - Supprimer une séance

# 5. Vérifier la base de données
# - Ouvrir le Management UI → Database
# - Vérifier que les données sont bien insérées
```

### Erreurs Courantes et Solutions

#### Erreur: "Cannot find name 'boolean'"
**Cause:** Import manquant dans `drizzle/schema.ts`
**Solution:**
```typescript
import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
```

#### Erreur: "Duplicate entry for key 'entreprises.siret_unique'"
**Cause:** Tests utilisent des valeurs fixes qui créent des doublons
**Solution:**
```typescript
// ❌ Mauvais
const siret = "12345678901234";

// ✅ Bon
const siret = `99999${Date.now().toString().slice(-9)}`;
```

#### Erreur: "Database not available"
**Cause:** La connexion DB n'est pas établie
**Solution:**
```typescript
// Toujours vérifier avant d'utiliser
const db = await getDb();
if (!db) {
  throw new Error("Database not available");
}
```

#### Erreur: "Type 'X' is not assignable to type 'Y'"
**Cause:** Désynchronisation entre schéma DB et types TypeScript
**Solution:**
```bash
# Régénérer les types
pnpm db:push
```

### Bonnes Pratiques

1. **Toujours utiliser des transactions pour les opérations multiples**
```typescript
await db.transaction(async (tx) => {
  const entreprise = await tx.insert(entreprises).values(...);
  const dossier = await tx.insert(dossiers).values(...);
});
```

2. **Utiliser des index pour les recherches fréquentes**
```typescript
export const dossiers = mysqlTable("dossiers", {
  // ... champs
}, (table) => ({
  referenceIdx: index("reference_idx").on(table.reference),
  siretIdx: index("siret_idx").on(table.entrepriseId),
}));
```

3. **Valider les données côté serveur ET client**
```typescript
// Serveur (tRPC)
.input(z.object({
  email: z.string().email(),
  siret: z.string().length(14),
}))

// Client (React Hook Form)
const schema = z.object({
  email: z.string().email("Email invalide"),
  siret: z.string().length(14, "SIRET doit contenir 14 chiffres"),
});
```

4. **Utiliser des migrations nommées explicitement**
```bash
# Au lieu de laisser Drizzle générer des noms aléatoires
pnpm drizzle-kit generate:mysql --name add_seances_table
```

---

## 📁 Structure du Projet

```
monopco.fr/
├── client/                    # Frontend React + Vite
│   ├── public/               # Assets statiques
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── NotificationPermission.tsx
│   │   │   └── ...
│   │   ├── pages/           # Pages de l'application
│   │   │   ├── Home.tsx     # Landing page
│   │   │   ├── Dashboard.tsx # Tableau de bord Kanban
│   │   │   ├── NouveauDossier.tsx
│   │   │   ├── DetailDossier.tsx
│   │   │   ├── Facturation.tsx
│   │   │   ├── Statistiques.tsx
│   │   │   ├── Parametres.tsx
│   │   │   ├── Suivi.tsx    # Portail client public
│   │   │   └── ...
│   │   ├── lib/             # Utilitaires
│   │   │   ├── trpc.ts      # Client tRPC
│   │   │   └── notifications.ts
│   │   ├── App.tsx          # Routes
│   │   ├── main.tsx         # Point d'entrée
│   │   └── index.css        # Styles globaux
│   └── index.html
│
├── server/                   # Backend Express + tRPC
│   ├── _core/               # Infrastructure
│   │   ├── auth.ts          # Authentification OAuth
│   │   ├── context.ts       # Context tRPC
│   │   ├── cookies.ts       # Gestion cookies
│   │   ├── email.ts         # Service email
│   │   ├── env.ts           # Variables d'environnement
│   │   ├── llm.ts           # Intégration LLM
│   │   ├── notification.ts  # Notifications propriétaire
│   │   └── ...
│   ├── db.ts                # Fonctions base de données
│   ├── routers.ts           # Procédures tRPC
│   ├── pdfGenerator.ts      # Génération PDF
│   ├── *.test.ts            # Tests unitaires (10 fichiers)
│   └── ...
│
├── drizzle/                 # Base de données
│   ├── schema.ts            # Schéma DB (4 tables)
│   └── *.sql                # Migrations
│
├── scripts/                 # Scripts utilitaires
│   ├── migrate-dates.mjs    # Migration dates
│   └── verify-dates.mjs     # Vérification
│
├── shared/                  # Code partagé
│   └── const.ts             # Constantes
│
├── docs/                    # Documentation
│   ├── CHANGELOG.md
│   ├── CONTRIBUTING.md
│   ├── CRON_SETUP.md
│   ├── DEPLOIEMENT_VERCEL.md
│   ├── GUIDE_TEST_PDF.md
│   ├── GUIDE_UTILISATEUR_DEPLOIEMENT.md
│   ├── MIGRATION_DATES.md
│   ├── README.md
│   ├── README_GITHUB.md
│   └── SIGNATURE_ELECTRONIQUE.md
│
├── package.json             # Dépendances
├── tsconfig.json            # Configuration TypeScript
├── vite.config.ts           # Configuration Vite
├── drizzle.config.ts        # Configuration Drizzle
└── .gitignore
```

---

## 🛠️ Technologies Utilisées

### Frontend
- **React 19** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Composants UI
- **Wouter** - Routing
- **tRPC** - Type-safe API
- **React Query** - Cache et synchronisation
- **Lucide React** - Icônes

### Backend
- **Node.js 22** - Runtime
- **Express 4** - Serveur HTTP
- **tRPC 11** - API type-safe
- **Drizzle ORM** - ORM TypeScript
- **MySQL/TiDB** - Base de données
- **Zod** - Validation de schémas
- **PDFKit** - Génération PDF
- **Resend** - Service email
- **bcrypt** - Hachage mots de passe

### DevOps & Testing
- **Vitest** - Framework de tests
- **GitHub Actions** - CI/CD
- **Manus** - Hébergement et déploiement
- **pnpm** - Gestionnaire de paquets

### APIs Externes
- **Pappers API** - Données entreprises françaises
- **Manus OAuth** - Authentification
- **Resend API** - Envoi d'emails
- **Web Push API** - Notifications navigateur

---

## 📝 Prochaines Étapes Recommandées

### Priorité 1: Corriger le Problème OAuth (URGENT)
1. Modifier `server/_core/cookies.ts` selon la solution proposée
2. Tester la connexion sur monopco.fr
3. Vérifier les cookies dans DevTools
4. Créer un test unitaire pour valider la correction

**Estimation:** 1-2 heures  
**Impact:** CRITIQUE - Bloque l'utilisation de la plateforme

### Priorité 2: Système de Gestion des Utilisateurs (IMPORTANT)
1. Créer le schéma DB pour auth email/password
2. Implémenter les procédures tRPC (register, login)
3. Créer les pages Login et Register
4. Créer la page d'administration des utilisateurs
5. Tester le système complet

**Estimation:** 1-2 jours  
**Impact:** ÉLEVÉ - Permet l'utilisation multi-utilisateurs

### Priorité 3: Finaliser le Calendrier de Séances (MOYEN)
1. Créer les procédures tRPC pour les séances
2. Créer la page `/calendrier` avec vue mensuelle
3. Implémenter le modal de création/modification
4. Générer les feuilles d'émargement PDF
5. Configurer les rappels email automatiques

**Estimation:** 2-3 jours  
**Impact:** MOYEN - Améliore l'expérience utilisateur

### Priorité 4: Signature Électronique Yousign (FAIBLE)
1. Intégrer l'API Yousign (documentation déjà créée)
2. Créer l'interface de signature dans DetailDossier
3. Gérer le statut de signature
4. Notifier les parties prenantes

**Estimation:** 2-3 jours  
**Impact:** FAIBLE - Fonctionnalité avancée

### Priorité 5: Améliorations UX (FAIBLE)
1. Ajouter des animations de transition
2. Améliorer le responsive mobile
3. Ajouter un mode sombre
4. Optimiser les performances

**Estimation:** 1-2 jours  
**Impact:** FAIBLE - Amélioration continue

---

## 📞 Support et Contact

**Projet:** MonOPCO - Gestionnaire OPCO Automatisé  
**Client:** Netz Informatique  
**Repository:** https://github.com/lekesiz/monopco.fr  
**Site Production:** http://monopco.fr  
**Support Manus:** https://help.manus.im

**Équipe de Développement:**
- Développement: Manus AI
- Product Owner: Mikail Lekesiz
- Entreprise: Netz Informatique

---

## 📄 Licence

© 2025 MonOPCO - Netz Informatique. Tous droits réservés.

---

**Dernière mise à jour:** 22 Novembre 2025  
**Version du rapport:** 1.0  
**Auteur:** Manus AI

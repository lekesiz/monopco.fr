import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role-based access for admin dashboard.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Table entreprises - Informations des entreprises clientes
 * Données récupérées automatiquement via API Pappers/Sirene
 */
export const entreprises = mysqlTable("entreprises", {
  id: int("id").autoincrement().primaryKey(),
  siret: varchar("siret", { length: 14 }).notNull().unique(),
  nom: text("nom").notNull(),
  adresse: text("adresse"),
  codeNaf: varchar("codeNaf", { length: 10 }),
  opco: varchar("opco", { length: 100 }), // ATLAS, AKTO, OPCO EP, etc.
  contactNom: text("contactNom"),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactTelephone: varchar("contactTelephone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Entreprise = typeof entreprises.$inferSelect;
export type InsertEntreprise = typeof entreprises.$inferInsert;

/**
 * Table dossiers - Dossiers de Bilan de Compétences ou Formations
 * Gestion du workflow complet avec statuts
 */
export const dossiers = mysqlTable("dossiers", {
  id: int("id").autoincrement().primaryKey(),
  entrepriseId: int("entrepriseId").notNull(), // FK vers entreprises
  typeDossier: mysqlEnum("typeDossier", ["bilan", "formation"]).notNull(),
  
  // Informations bénéficiaire
  beneficiaireNom: text("beneficiaireNom").notNull(),
  beneficiairePrenom: text("beneficiairePrenom").notNull(),
  beneficiaireEmail: varchar("beneficiaireEmail", { length: 320 }).notNull(),
  beneficiaireTelephone: varchar("beneficiaireTelephone", { length: 20 }),
  
  // Statut workflow
  statut: mysqlEnum("statut", [
    "nouveau",
    "phase1", // Phase préliminaire
    "phase2", // Phase investigation
    "phase3", // Phase conclusion
    "facture"
  ]).default("nouveau").notNull(),
  
  // Suivi heures (pour Bilan: 24h réglementaires)
  heuresRealisees: int("heuresRealisees").default(0).notNull(),
  heuresTotal: int("heuresTotal").default(24).notNull(), // 24h pour Bilan standard
  
  // Dates
  dateDebut: timestamp("dateDebut"),
  dateFin: timestamp("dateFin"),
  
  // Notes et documents
  notes: text("notes"),
  documentUrls: text("documentUrls"), // JSON array of URLs
  
  // Métadonnées
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy"), // FK vers users (admin qui a créé)
});

export type Dossier = typeof dossiers.$inferSelect;
export type InsertDossier = typeof dossiers.$inferInsert;

/**
 * Table historique - Historique des actions sur les dossiers
 * Pour traçabilité complète
 */
export const historique = mysqlTable("historique", {
  id: int("id").autoincrement().primaryKey(),
  dossierId: int("dossierId").notNull(), // FK vers dossiers
  userId: int("userId"), // FK vers users (qui a fait l'action)
  action: varchar("action", { length: 100 }).notNull(), // "creation", "changement_statut", "ajout_document", etc.
  ancienneValeur: text("ancienneValeur"),
  nouvelleValeur: text("nouvelleValeur"),
  commentaire: text("commentaire"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Historique = typeof historique.$inferSelect;
export type InsertHistorique = typeof historique.$inferInsert;

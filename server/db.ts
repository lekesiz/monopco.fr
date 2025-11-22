import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  entreprises, 
  InsertEntreprise, 
  Entreprise,
  dossiers,
  InsertDossier,
  Dossier,
  historique,
  InsertHistorique
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// ENTREPRISE MANAGEMENT
// ============================================================================

export async function createEntreprise(data: InsertEntreprise): Promise<Entreprise> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(entreprises).values(data);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(entreprises).where(eq(entreprises.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted entreprise");
  
  return inserted[0];
}
export async function getEntrepriseBySiret(siret: string) {
  const dbInstance = await getDb();
  if (!dbInstance) return undefined;
  const result = await dbInstance.select().from(entreprises).where(eq(entreprises.siret, siret)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEntrepriseById(id: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return undefined;
  const result = await dbInstance.select().from(entreprises).where(eq(entreprises.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateEntreprise(id: number, data: Partial<InsertEntreprise>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(entreprises).set(data).where(eq(entreprises.id, id));
}

export async function getAllEntreprises(): Promise<Entreprise[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(entreprises).orderBy(desc(entreprises.createdAt));
}

// ============================================================================
// DOSSIER MANAGEMENT
// ============================================================================

export async function createDossier(data: InsertDossier): Promise<Dossier> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(dossiers).values(data);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(dossiers).where(eq(dossiers.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted dossier");
  
  return inserted[0];
}

export async function getDossierById(id: number): Promise<Dossier | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(dossiers).where(eq(dossiers.id, id)).limit(1);
  return result[0];
}

export async function updateDossier(id: number, data: Partial<InsertDossier>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(dossiers).set(data).where(eq(dossiers.id, id));
}

export async function getAllDossiers(): Promise<Dossier[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(dossiers).orderBy(desc(dossiers.createdAt));
}

export async function getDossiersByEntreprise(entrepriseId: number): Promise<Dossier[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(dossiers)
    .where(eq(dossiers.entrepriseId, entrepriseId))
    .orderBy(desc(dossiers.createdAt));
}

export async function getDossiersByStatut(statut: Dossier['statut']): Promise<Dossier[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(dossiers)
    .where(eq(dossiers.statut, statut))
    .orderBy(desc(dossiers.createdAt));
}

// ============================================================================
// HISTORIQUE MANAGEMENT
// ============================================================================

export async function addHistorique(data: InsertHistorique): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(historique).values(data);
}

export async function getHistoriqueByDossier(dossierId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(historique)
    .where(eq(historique.dossierId, dossierId))
    .orderBy(desc(historique.createdAt));
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return {
    totalDossiers: 0,
    nouveaux: 0,
    enCours: 0,
    factures: 0,
    totalEntreprises: 0
  };

  const allDossiers = await db.select().from(dossiers);
  const allEntreprises = await db.select().from(entreprises);

  return {
    totalDossiers: allDossiers.length,
    nouveaux: allDossiers.filter(d => d.statut === 'nouveau').length,
    enCours: allDossiers.filter(d => ['phase1', 'phase2', 'phase3'].includes(d.statut)).length,
    factures: allDossiers.filter(d => d.statut === 'facture').length,
    totalEntreprises: allEntreprises.length
  };
}

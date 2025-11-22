import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import bcrypt from "bcrypt";
import {
  InsertUser,
  users,
  User,
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

// ============================================================================
// USER MANAGEMENT - EMAIL/PASSWORD AUTHENTICATION
// ============================================================================

export async function createUserWithPassword(data: {
  email: string;
  password: string;
  name: string;
  role?: "admin" | "manager" | "consultant" | "assistant";
}): Promise<{ id: number; email: string; name: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Vérifier si l'email existe déjà
  const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existing.length > 0) {
    throw new Error("Email already exists");
  }

  // Hasher le mot de passe
  const passwordHash = await bcrypt.hash(data.password, 10);

  // Créer l'utilisateur
  const result = await db.insert(users).values({
    email: data.email,
    passwordHash,
    name: data.name,
    role: data.role || "consultant",
    loginMethod: "email",
    emailVerified: false,
  });

  return { id: Number(result[0].insertId), email: data.email, name: data.name };
}

export async function verifyUserPassword(email: string, password: string): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = result[0];
  if (!user || !user.passwordHash) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  // Mettre à jour lastSignedIn
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

  return user;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function getAllUsers(): Promise<Omit<User, "passwordHash">[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select({
    id: users.id,
    openId: users.openId,
    name: users.name,
    email: users.email,
    loginMethod: users.loginMethod,
    emailVerified: users.emailVerified,
    role: users.role,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users).orderBy(desc(users.createdAt));

  return result;
}

export async function updateUserRole(userId: number, role: "admin" | "manager" | "consultant" | "assistant"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function deleteUser(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(users).where(eq(users.id, userId));
}

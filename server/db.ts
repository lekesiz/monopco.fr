import { eq, desc, and, asc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import {
  users,
  entreprises,
  InsertEntreprise,
  Entreprise,
  dossiers,
  InsertDossier,
  Dossier,
  historique,
  InsertHistorique,
  seances,
  InsertSeance,
  Seance,
  User
} from "../drizzle/schema";

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
// PASSWORD HASHING (using Node.js crypto)
// ============================================================================

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(password + salt)
    .digest("hex");
  return `${salt}:${hash}`;
}

function verifyPasswordHash(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const testHash = createHash("sha256")
    .update(password + salt)
    .digest("hex");

  // Use timing-safe comparison to prevent timing attacks
  try {
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(testHash, "hex"));
  } catch {
    return false;
  }
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
}): Promise<User> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const passwordHash = hashPassword(data.password);

  const result = await db.insert(users).values({
    email: data.email,
    passwordHash,
    name: data.name,
    role: "user",
  });

  const insertedId = Number(result[0].insertId);
  const [user] = await db.select().from(users).where(eq(users.id, insertedId)).limit(1);

  if (!user) throw new Error("Failed to retrieve created user");
  return user;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user;
}

export async function verifyPassword(userId: number, password: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return false;

  return verifyPasswordHash(password, user.passwordHash);
}

export async function updateUserLastSignedIn(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function updateUserRole(userId: number, role: "user" | "admin"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ role }).where(eq(users.id, userId));
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
// SEANCES MANAGEMENT
// ============================================================================

export async function createSeance(seance: InsertSeance) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(seances).values(seance);
  return result;
}

export async function getSeancesByDossier(dossierId: number) {
  const db = await getDb();
  if (!db) return [];

  const seancesList = await db
    .select()
    .from(seances)
    .where(eq(seances.dossierId, dossierId))
    .orderBy(asc(seances.dateDebut));

  return seancesList;
}

export async function getAllSeances() {
  const db = await getDb();
  if (!db) return [];

  const seancesList = await db
    .select()
    .from(seances)
    .orderBy(asc(seances.dateDebut));

  return seancesList;
}

export async function getSeanceById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const [seance] = await db
    .select()
    .from(seances)
    .where(eq(seances.id, id))
    .limit(1);

  return seance || null;
}

export async function updateSeance(id: number, updates: Partial<InsertSeance>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(seances)
    .set(updates)
    .where(eq(seances.id, id));
}

export async function deleteSeance(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .delete(seances)
    .where(eq(seances.id, id));
}

export async function getSeancesRequiringReminder() {
  const db = await getDb();
  if (!db) return [];

  // Séances dans les prochaines 24h qui n'ont pas encore reçu de rappel
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const seancesList = await db
    .select()
    .from(seances)
    .where(
      and(
        eq(seances.statut, "planifie"),
        eq(seances.rappelEnvoye, false),
        gte(seances.dateDebut, now),
        lte(seances.dateDebut, in24Hours)
      )
    );

  return seancesList;
}

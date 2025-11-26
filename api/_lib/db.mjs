import { Pool } from '@neondatabase/serverless';
import { setupDatabase } from './db-setup.mjs';

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let isDbSetup = false;

async function ensureDbSetup() {
  if (!isDbSetup && process.env.NODE_ENV !== 'production') {
    try {
      await setupDatabase();
      isDbSetup = true;
    } catch (err) {
      console.error("FATAL: Database setup failed:", err);
      process.exit(1);
    }
  }
}

export async function query(text, params) {
  await ensureDbSetup();
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Query Error', { text, error: err.message });
    throw err;
  }
}

export async function getUser(email) {
  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  return result.rows[0];
}

export async function getUserById(id) {
  const result = await query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

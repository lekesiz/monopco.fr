import { Pool } from '@neondatabase/serverless';

// Support DATABASE_URL_UNPOOLED (preferred for Serverless), DATABASE_URL, and DATABASE_POSTGRES_URL
const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || process.env.DATABASE_POSTGRES_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or DATABASE_POSTGRES_URL environment variable is not set.");
}

const pool = new Pool({
  connectionString,
});

export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Query Error', { text: text.substring(0, 100), error: err.message });
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

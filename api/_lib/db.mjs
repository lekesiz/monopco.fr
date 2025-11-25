import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function getUser(email) {
  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
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

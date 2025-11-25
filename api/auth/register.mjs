import bcrypt from 'bcryptjs';
import { query } from '../_lib/db.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, firstName, lastName, companyName, siret, role = 'user' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await query(
      `INSERT INTO users (email, password, first_name, last_name, company_name, siret, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, email, first_name, last_name, company_name, siret, role, created_at`,
      [email, hashedPassword, firstName || null, lastName || null, companyName || null, siret || null, role]
    );

    const user = result.rows[0];

    return res.status(201).json({
      success: true,
      user,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

import { query } from '../_lib/db.mjs';
import { generateToken, comparePassword } from '../_lib/auth.mjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'monopco-secret-key-change-in-production';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe sont requis' });
    }

    // Get user from database
    const result = await query(
      'SELECT id, email, password_hash, prenom, nom, entreprise_siret, entreprise_nom, role FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Generate JWT access token
    const accessToken = generateToken(user);

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    // Set httpOnly cookies
    res.setHeader('Set-Cookie', [
      `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    ]);

    // Remove password_hash from response
    delete user.password_hash;

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      user,
      token: accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Erreur lors de la connexion', details: error.message });
  }
}

import { query } from '../_lib/db.mjs';
import { generateToken, hashPassword } from '../_lib/auth.mjs';
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
    const { email, password, prenom, nom, entreprise_siret, entreprise_nom, adresse, telephone } = req.body;

    // Validation
    if (!email || !password || !prenom || !nom) {
      return res.status(400).json({ 
        error: 'Email, mot de passe, prénom et nom sont requis' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Format d\'email invalide' 
      });
    }

    // Validate password strength (min 8 characters)
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Le mot de passe doit contenir au moins 8 caractères' 
      });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Un compte avec cet email existe déjà' 
      });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Generate verification token
    const verification_token = jwt.sign(
      { email: email.toLowerCase() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Insert user into database
    const insertQuery = `INSERT INTO users 
       (email, password, first_name, last_name, company_name, siret, role) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, email, first_name, last_name, company_name, siret, role, created_at`;
    
    const insertParams = [
      email.toLowerCase(),
      password_hash,
      prenom,
      nom,
      entreprise_nom || null,
      entreprise_siret || null,
      'entreprise'
    ];
    
    console.log('=== DEBUG INSERT USER ===');
    console.log('Query:', insertQuery);
    console.log('Params:', insertParams.map((p, i) => `$${i+1}: ${typeof p} (${p?.length || 'null'})`));
    
    const result = await query(insertQuery, insertParams);

    const user = result.rows[0];

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

    return res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        company_name: user.company_name,
        siret: user.siret,
        role: user.role,
        email_verified: user.email_verified
      },
      token: accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la création du compte',
      details: error.message 
    });
  }
}

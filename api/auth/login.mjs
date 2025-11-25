import bcrypt from 'bcryptjs';
import { getUser } from '../_lib/db.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from database
    const user = await getUser(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password (check both password and passwordHash columns)
    const isValid = await bcrypt.compare(password, user.passwordHash || user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return user data (without password)
    const { password: _, ...userData } = user;

    return res.status(200).json({
      success: true,
      user: userData,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

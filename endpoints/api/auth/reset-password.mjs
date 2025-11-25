import { query } from '../_lib/db.mjs';
import { hashPassword } from '../_lib/auth.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token et mot de passe requis' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    // Find user with valid reset token
    const userResult = await query(
      `SELECT id, email FROM users 
       WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }

    const user = userResult.rows[0];

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update password and clear reset token
    await query(
      `UPDATE users 
       SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW()
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe' });
  }
}

import { query } from '../_lib/db.mjs';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // Check if user exists
    const userResult = await query(
      'SELECT id, email, nom, prenom FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    // Always return success to prevent email enumeration
    if (userResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
      });
    }

    const user = userResult.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to database
    await query(
      `UPDATE users 
       SET reset_token = $1, reset_token_expiry = $2, updated_at = NOW()
       WHERE id = $3`,
      [resetToken, resetTokenExpiry, user.id]
    );

    // TODO: Send email with reset link
    // For now, we'll just log it (in production, use Resend API)
    const resetLink = `${process.env.FRONTEND_URL || 'https://www.monopco.fr'}/#/reset-password?token=${resetToken}`;
    console.log(`Password reset link for ${email}: ${resetLink}`);

    // In production, send email here
    // await sendEmail({
    //   to: email,
    //   subject: 'Réinitialisation de votre mot de passe MonOPCO',
    //   template: 'password-reset',
    //   data: {
    //     nom: user.nom,
    //     prenom: user.prenom,
    //     resetLink
    //   }
    // });

    return res.status(200).json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      // Only for development
      ...(process.env.NODE_ENV === 'development' && { resetLink })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Erreur lors de la demande de réinitialisation' });
  }
}

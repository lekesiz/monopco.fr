import { getUserFromRequest } from '../_lib/auth.mjs';
import { sendEmail, sendTemplateEmail } from '../_lib/email.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate user (admin only)
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  try {
    const { to, subject, html, text, dossierId, template, templateData } = req.body;

    // Send template email or custom email
    let result;
    if (template && templateData) {
      result = await sendTemplateEmail(template, to, templateData, dossierId);
    } else if (to && subject && html) {
      result = await sendEmail({ to, subject, html, text, dossierId });
    } else {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Email envoyé avec succès'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Send email error:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
  }
}

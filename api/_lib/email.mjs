import { Resend } from 'resend';
import { query } from './db.mjs';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email using Resend
 */
export async function sendEmail({ to, subject, html, text, dossierId = null, template = null }) {
  try {
    // Send email via Resend
    const data = await resend.emails.send({
      from: 'MonOPCO <noreply@monopco.fr>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    });

    // Log email in database
    if (dossierId) {
      await query(
        `INSERT INTO emails (dossier_id, recipient_email, subject, body, template, sent_at, status)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
        [dossierId, Array.isArray(to) ? to.join(',') : to, subject, html, template, 'sent']
      );
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);

    // Log failed email
    if (dossierId) {
      await query(
        `INSERT INTO emails (dossier_id, recipient_email, subject, body, template, sent_at, status)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
        [dossierId, Array.isArray(to) ? to.join(',') : to, subject, html, template, 'failed']
      );
    }

    return { success: false, error: error.message };
  }
}

/**
 * Email templates
 */

export function getEmailTemplate(templateName, data) {
  const templates = {
    'dossier-created': {
      subject: 'Votre dossier OPCO a été créé',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Dossier créé avec succès</h1>
          <p>Bonjour ${data.nom} ${data.prenom},</p>
          <p>Votre dossier <strong>${data.titre}</strong> a été créé avec succès.</p>
          <p><strong>Numéro de dossier:</strong> ${data.dossierId}</p>
          <p><strong>Type:</strong> ${data.typeFormation === 'bilan' ? 'Bilan de Compétences' : 'Formation Professionnelle'}</p>
          <p><strong>Montant estimé:</strong> ${data.montantEstime}€</p>
          <p>Vous pouvez suivre l'avancement de votre dossier sur votre tableau de bord.</p>
          <a href="https://www.monopco.fr/#/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Voir mon tableau de bord
          </a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Cordialement,<br>
            L'équipe MonOPCO
          </p>
        </div>
      `
    },

    'dossier-validated': {
      subject: 'Votre dossier OPCO a été validé',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Dossier validé ✓</h1>
          <p>Bonjour ${data.nom} ${data.prenom},</p>
          <p>Bonne nouvelle ! Votre dossier <strong>${data.titre}</strong> a été validé par notre équipe.</p>
          <p><strong>Numéro de dossier:</strong> ${data.dossierId}</p>
          <p><strong>Montant validé:</strong> ${data.montantValide}€</p>
          <p>Votre demande va maintenant être transmise à l'OPCO ${data.opcoNom} pour traitement.</p>
          <p>Vous recevrez une notification dès que nous aurons une réponse de l'OPCO.</p>
          <a href="https://www.monopco.fr/#/dossier/${data.dossierId}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Voir mon dossier
          </a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Cordialement,<br>
            L'équipe MonOPCO
          </p>
        </div>
      `
    },

    'dossier-sent-opco': {
      subject: 'Votre dossier a été envoyé à l\'OPCO',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Dossier envoyé à l'OPCO</h1>
          <p>Bonjour ${data.nom} ${data.prenom},</p>
          <p>Votre dossier <strong>${data.titre}</strong> a été transmis à l'OPCO ${data.opcoNom}.</p>
          <p><strong>Numéro de dossier:</strong> ${data.dossierId}</p>
          <p><strong>Date d'envoi:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          <p>Le délai de réponse habituel est de <strong>15 à 30 jours ouvrés</strong>.</p>
          <p>Nous vous tiendrons informé dès que nous recevrons une réponse.</p>
          <a href="https://www.monopco.fr/#/dossier/${data.dossierId}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Suivre mon dossier
          </a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Cordialement,<br>
            L'équipe MonOPCO
          </p>
        </div>
      `
    },

    'dossier-approved': {
      subject: 'Votre dossier OPCO a été accepté !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Félicitations ! Votre dossier est accepté 🎉</h1>
          <p>Bonjour ${data.nom} ${data.prenom},</p>
          <p>Excellente nouvelle ! L'OPCO ${data.opcoNom} a accepté votre demande de financement.</p>
          <p><strong>Numéro de dossier:</strong> ${data.dossierId}</p>
          <p><strong>Montant accordé:</strong> ${data.montantValide}€</p>
          <p>Vous pouvez maintenant procéder à votre ${data.typeFormation === 'bilan' ? 'bilan de compétences' : 'formation'}.</p>
          <p>Les prochaines étapes vous seront communiquées dans votre espace personnel.</p>
          <a href="https://www.monopco.fr/#/dossier/${data.dossierId}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Voir les détails
          </a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Cordialement,<br>
            L'équipe MonOPCO
          </p>
        </div>
      `
    },

    'dossier-rejected': {
      subject: 'Réponse de l\'OPCO concernant votre dossier',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Réponse de l'OPCO</h1>
          <p>Bonjour ${data.nom} ${data.prenom},</p>
          <p>Nous avons reçu une réponse de l'OPCO ${data.opcoNom} concernant votre dossier <strong>${data.titre}</strong>.</p>
          <p><strong>Numéro de dossier:</strong> ${data.dossierId}</p>
          <p>Malheureusement, votre demande n'a pas pu être acceptée pour la raison suivante :</p>
          <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
            ${data.motifRefus}
          </div>
          <p>Notre équipe reste à votre disposition pour vous accompagner et étudier d'autres possibilités de financement.</p>
          <a href="https://www.monopco.fr/#/dossier/${data.dossierId}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Voir mon dossier
          </a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Cordialement,<br>
            L'équipe MonOPCO
          </p>
        </div>
      `
    },

    'password-reset': {
      subject: 'Réinitialisation de votre mot de passe MonOPCO',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Réinitialisation du mot de passe</h1>
          <p>Bonjour ${data.nom} ${data.prenom},</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe MonOPCO.</p>
          <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
          <a href="${data.resetLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Réinitialiser mon mot de passe
          </a>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            Ce lien est valable pendant 1 heure.
          </p>
          <p style="color: #666; font-size: 14px;">
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
          </p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Cordialement,<br>
            L'équipe MonOPCO
          </p>
        </div>
      `
    }
  };

  return templates[templateName] || null;
}

/**
 * Send email from template
 */
export async function sendTemplateEmail(templateName, to, data, dossierId = null) {
  const template = getEmailTemplate(templateName, data);
  
  if (!template) {
    throw new Error(`Template ${templateName} not found`);
  }

  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    dossierId,
    template: templateName
  });
}

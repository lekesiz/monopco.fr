import { Resend } from "resend";

/**
 * Service d'envoi d'emails avec Resend
 * Utilisé pour les notifications OPCO automatiques
 */

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "MonOPCO <noreply@monopco.fr>"; // À configurer avec votre domaine vérifié
const NETZ_EMAIL = "contact@netzinformatique.fr";

export interface EmailNotification {
  to: string[];
  subject: string;
  html: string;
  cc?: string[];
  bcc?: string[];
}

/**
 * Envoie un email via Resend
 */
export async function sendEmail(notification: EmailNotification) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("[Resend] API key not configured, email not sent");
      return { success: false, message: "Resend API key not configured" };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: notification.to,
      cc: notification.cc,
      bcc: notification.bcc,
      subject: notification.subject,
      html: notification.html,
    });

    if (error) {
      console.error("[Resend] Error sending email:", error);
      return { success: false, error };
    }

    console.log("[Resend] Email sent successfully:", data?.id);
    return { success: true, data };
  } catch (error) {
    console.error("[Resend] Exception:", error);
    return { success: false, error };
  }
}

/**
 * Notification: Nouveau dossier créé
 */
export async function notifierNouveauDossier(params: {
  beneficiaireEmail: string;
  beneficiaireNom: string;
  beneficiairePrenom: string;
  entrepriseNom: string;
  typeDossier: "bilan" | "formation";
  dateDebut?: Date | null;
}) {
  const { beneficiaireEmail, beneficiaireNom, beneficiairePrenom, entrepriseNom, typeDossier, dateDebut } = params;

  const typeLabel = typeDossier === "bilan" ? "Bilan de Compétences" : "Formation Professionnelle";
  const dateDebutStr = dateDebut ? dateDebut.toLocaleDateString("fr-FR") : "À définir";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MonOPCO - Nouveau Dossier</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${beneficiairePrenom} ${beneficiaireNom},</h2>
      
      <p>Votre dossier <strong>${typeLabel}</strong> a été créé avec succès !</p>
      
      <p><strong>Informations du dossier :</strong></p>
      <ul>
        <li>Entreprise : ${entrepriseNom}</li>
        <li>Type : ${typeLabel}</li>
        <li>Date de début prévue : ${dateDebutStr}</li>
      </ul>
      
      <p>Vous recevrez prochainement les documents à signer (convention tripartite) ainsi que le planning détaillé des séances.</p>
      
      <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
      
      <p>Cordialement,<br>
      <strong>L'équipe Netz Informatique</strong></p>
    </div>
    <div class="footer">
      <p>Netz Informatique - 67500 Haguenau, France<br>
      📞 03 67 31 02 01 | 📧 contact@netzinformatique.fr</p>
    </div>
  </div>
</body>
</html>
  `;

  // Envoyer au bénéficiaire
  await sendEmail({
    to: [beneficiaireEmail],
    subject: `MonOPCO - Votre dossier ${typeLabel} a été créé`,
    html,
  });

  // Notifier Netz Informatique
  await sendEmail({
    to: [NETZ_EMAIL],
    subject: `[MonOPCO] Nouveau dossier: ${beneficiairePrenom} ${beneficiaireNom} - ${entrepriseNom}`,
    html: `
      <h2>Nouveau dossier créé</h2>
      <ul>
        <li><strong>Bénéficiaire:</strong> ${beneficiairePrenom} ${beneficiaireNom}</li>
        <li><strong>Email:</strong> ${beneficiaireEmail}</li>
        <li><strong>Entreprise:</strong> ${entrepriseNom}</li>
        <li><strong>Type:</strong> ${typeLabel}</li>
        <li><strong>Date début:</strong> ${dateDebutStr}</li>
      </ul>
      <p>Accédez au dashboard pour gérer ce dossier.</p>
    `,
  });
}

/**
 * Notification: Changement de statut
 */
export async function notifierChangementStatut(params: {
  beneficiaireEmail: string;
  beneficiaireNom: string;
  beneficiairePrenom: string;
  ancienStatut: string;
  nouveauStatut: string;
  typeDossier: "bilan" | "formation";
}) {
  const { beneficiaireEmail, beneficiaireNom, beneficiairePrenom, ancienStatut, nouveauStatut, typeDossier } = params;

  const statutLabels: Record<string, string> = {
    nouveau: "Nouveau",
    phase1: "Phase 1 - Préliminaire",
    phase2: "Phase 2 - Investigation",
    phase3: "Phase 3 - Conclusion",
    facture: "Facturé / Terminé",
  };

  const typeLabel = typeDossier === "bilan" ? "Bilan de Compétences" : "Formation";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .status-box { background: white; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MonOPCO - Mise à jour de votre dossier</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${beneficiairePrenom} ${beneficiaireNom},</h2>
      
      <p>Le statut de votre dossier <strong>${typeLabel}</strong> a été mis à jour.</p>
      
      <div class="status-box">
        <p><strong>Ancien statut:</strong> ${statutLabels[ancienStatut] || ancienStatut}</p>
        <p><strong>Nouveau statut:</strong> ${statutLabels[nouveauStatut] || nouveauStatut}</p>
      </div>
      
      ${
        nouveauStatut === "phase1"
          ? "<p>Nous commençons la <strong>Phase Préliminaire</strong>. Vous recevrez prochainement la convocation pour votre premier entretien.</p>"
          : ""
      }
      ${
        nouveauStatut === "phase2"
          ? "<p>Nous passons à la <strong>Phase d'Investigation</strong>. C'est le moment des tests et entretiens approfondis.</p>"
          : ""
      }
      ${
        nouveauStatut === "phase3"
          ? "<p>Nous entrons dans la <strong>Phase de Conclusion</strong>. Vous recevrez bientôt votre document de synthèse.</p>"
          : ""
      }
      ${
        nouveauStatut === "facture"
          ? "<p>Votre dossier est maintenant <strong>terminé</strong>. Merci pour votre confiance !</p>"
          : ""
      }
      
      <p>Cordialement,<br>
      <strong>L'équipe Netz Informatique</strong></p>
    </div>
    <div class="footer">
      <p>Netz Informatique - 67500 Haguenau, France<br>
      📞 03 67 31 02 01 | 📧 contact@netzinformatique.fr</p>
    </div>
  </div>
</body>
</html>
  `;

  await sendEmail({
    to: [beneficiaireEmail],
    subject: `MonOPCO - Mise à jour de votre ${typeLabel}`,
    html,
  });
}

/**
 * Notification: Document disponible
 */
export async function notifierDocumentDisponible(params: {
  beneficiaireEmail: string;
  beneficiaireNom: string;
  beneficiairePrenom: string;
  typeDocument: string;
  lienDocument?: string;
}) {
  const { beneficiaireEmail, beneficiaireNom, beneficiairePrenom, typeDocument, lienDocument } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MonOPCO - Nouveau Document</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${beneficiairePrenom} ${beneficiaireNom},</h2>
      
      <p>Un nouveau document est disponible pour votre dossier :</p>
      
      <p><strong>Type de document:</strong> ${typeDocument}</p>
      
      ${lienDocument ? `<a href="${lienDocument}" class="button">Télécharger le document</a>` : ""}
      
      <p>Ce document est important pour le suivi de votre dossier. Merci de le consulter et de le signer si nécessaire.</p>
      
      <p>Cordialement,<br>
      <strong>L'équipe Netz Informatique</strong></p>
    </div>
    <div class="footer">
      <p>Netz Informatique - 67500 Haguenau, France<br>
      📞 03 67 31 02 01 | 📧 contact@netzinformatique.fr</p>
    </div>
  </div>
</body>
</html>
  `;

  await sendEmail({
    to: [beneficiaireEmail],
    subject: `MonOPCO - Nouveau document: ${typeDocument}`,
    html,
  });
}

/**
 * Notification: Rappel séance
 */
export async function notifierRappelSeance(params: {
  beneficiaireEmail: string;
  beneficiaireNom: string;
  beneficiairePrenom: string;
  dateSeance: Date;
  heureSeance: string;
  phase: string;
  theme: string;
}) {
  const { beneficiaireEmail, beneficiaireNom, beneficiairePrenom, dateSeance, heureSeance, phase, theme } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .seance-box { background: white; border: 2px solid #3B82F6; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MonOPCO - Rappel de Séance</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${beneficiairePrenom} ${beneficiaireNom},</h2>
      
      <p>Nous vous rappelons votre prochaine séance :</p>
      
      <div class="seance-box">
        <p><strong>📅 Date:</strong> ${dateSeance.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        <p><strong>🕐 Heure:</strong> ${heureSeance}</p>
        <p><strong>📋 Phase:</strong> ${phase}</p>
        <p><strong>🎯 Thème:</strong> ${theme}</p>
      </div>
      
      <p>Merci de confirmer votre présence en répondant à cet email.</p>
      
      <p>À bientôt,<br>
      <strong>L'équipe Netz Informatique</strong></p>
    </div>
    <div class="footer">
      <p>Netz Informatique - 67500 Haguenau, France<br>
      📞 03 67 31 02 01 | 📧 contact@netzinformatique.fr</p>
    </div>
  </div>
</body>
</html>
  `;

  await sendEmail({
    to: [beneficiaireEmail],
    subject: `MonOPCO - Rappel: Séance du ${dateSeance.toLocaleDateString("fr-FR")} à ${heureSeance}`,
    html,
  });
}

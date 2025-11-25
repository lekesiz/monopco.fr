import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "MonOPCO <noreply@monopco.fr>";
const NETZ_EMAIL = "contact@netzinformatique.fr";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data } = req.body;

    if (!process.env.RESEND_API_KEY) {
      console.warn('[Resend] API key not configured');
      return res.status(500).json({ 
        error: 'Email service not configured',
        success: false 
      });
    }

    let emailData;

    switch (type) {
      case 'nouveau_dossier':
        emailData = generateNouveauDossierEmail(data);
        break;
      case 'changement_statut':
        emailData = generateChangementStatutEmail(data);
        break;
      case 'document_disponible':
        emailData = generateDocumentDisponibleEmail(data);
        break;
      case 'rappel_seance':
        emailData = generateRappelSeanceEmail(data);
        break;
      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    // Send to beneficiary
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    });

    // Send notification to Netz Informatique
    if (type === 'nouveau_dossier') {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [NETZ_EMAIL],
        subject: `[MonOPCO] Nouveau dossier: ${data.beneficiairePrenom} ${data.beneficiaireNom}`,
        html: `
          <h2>Nouveau dossier créé</h2>
          <ul>
            <li><strong>Bénéficiaire:</strong> ${data.beneficiairePrenom} ${data.beneficiaireNom}</li>
            <li><strong>Email:</strong> ${data.beneficiaireEmail}</li>
            <li><strong>Entreprise:</strong> ${data.entrepriseNom || 'N/A'}</li>
            <li><strong>Type:</strong> ${data.typeDossier}</li>
          </ul>
        `,
      });
    }

    res.status(200).json({ 
      success: true, 
      messageId: result.id 
    });

  } catch (error) {
    console.error('[Resend] Error:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
}

function generateNouveauDossierEmail(data) {
  const { beneficiaireEmail, beneficiaireNom, beneficiairePrenom, entrepriseNom, typeDossier } = data;
  const typeLabel = typeDossier === 'bilan' ? 'Bilan de Compétences' : 'Formation Professionnelle';

  return {
    to: [beneficiaireEmail],
    subject: `MonOPCO - Votre dossier ${typeLabel} a été créé`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
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
        <li>Entreprise : ${entrepriseNom || 'À définir'}</li>
        <li>Type : ${typeLabel}</li>
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
    `
  };
}

function generateChangementStatutEmail(data) {
  const { beneficiaireEmail, beneficiaireNom, beneficiairePrenom, ancienStatut, nouveauStatut, typeDossier } = data;
  const typeLabel = typeDossier === 'bilan' ? 'Bilan de Compétences' : 'Formation';

  const statutLabels = {
    nouveau: 'Nouveau',
    brouillon: 'Brouillon',
    en_cours: 'En cours',
    termine: 'Terminé',
    annule: 'Annulé'
  };

  return {
    to: [beneficiaireEmail],
    subject: `MonOPCO - Mise à jour de votre ${typeLabel}`,
    html: `
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
    `
  };
}

function generateDocumentDisponibleEmail(data) {
  const { beneficiaireEmail, beneficiaireNom, beneficiairePrenom, typeDocument, lienDocument } = data;

  return {
    to: [beneficiaireEmail],
    subject: `MonOPCO - Nouveau document: ${typeDocument}`,
    html: `
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
      
      ${lienDocument ? `<a href="${lienDocument}" class="button">Télécharger le document</a>` : ''}
      
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
    `
  };
}

function generateRappelSeanceEmail(data) {
  const { beneficiaireEmail, beneficiaireNom, beneficiairePrenom, dateSeance, heureSeance, theme } = data;

  return {
    to: [beneficiaireEmail],
    subject: `MonOPCO - Rappel: Séance du ${dateSeance} à ${heureSeance}`,
    html: `
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
        <p><strong>📅 Date:</strong> ${dateSeance}</p>
        <p><strong>🕐 Heure:</strong> ${heureSeance}</p>
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
    `
  };
}

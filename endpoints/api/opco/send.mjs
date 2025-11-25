import { query } from '../_lib/db.mjs';
import { getUserFromRequest } from '../_lib/auth.mjs';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// OPCO email addresses mapping
const OPCO_EMAILS = {
  'ATLAS': 'contact@opco-atlas.fr',
  'AKTO': 'contact@akto.fr',
  'OPCO EP': 'contact@opcoep.fr',
  'OPCO Santé': 'contact@opco-sante.fr',
  'OPCO 2i': 'contact@opco2i.fr',
  'AFDAS': 'contact@afdas.com',
  'OPCO Mobilités': 'contact@opcomobilites.fr',
  'OCAPIAT': 'contact@ocapiat.fr',
  'Constructys': 'contact@constructys.fr',
  'OPCO Commerce': 'contact@lopcocommerce.fr',
  'Uniformation': 'contact@uniformation.fr'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { dossierId, documents } = req.body;

    if (!dossierId || !documents || documents.length === 0) {
      return res.status(400).json({ error: 'dossierId and documents are required' });
    }

    // Get dossier details
    const dossierResult = await query(
      `SELECT d.*, e.nom as entreprise_nom, e.siret, e.opco, e.contact_email
       FROM dossiers d
       LEFT JOIN entreprises e ON d.entreprise_id = e.id
       WHERE d.id = $1`,
      [dossierId]
    );

    if (dossierResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dossier not found' });
    }

    const dossier = dossierResult.rows[0];
    const opco = dossier.opco || 'OPCO EP';
    const opcoEmail = OPCO_EMAILS[opco] || OPCO_EMAILS['OPCO EP'];

    // Prepare email content
    const emailSubject = `Demande de Prise en Charge - Bilan de Compétences - ${dossier.entreprise_nom}`;
    const emailBody = `
      <h2>Demande de Prise en Charge - Bilan de Compétences</h2>
      
      <p>Bonjour,</p>
      
      <p>Nous vous adressons une demande de prise en charge pour un Bilan de Compétences.</p>
      
      <h3>Informations Entreprise</h3>
      <ul>
        <li><strong>Raison sociale:</strong> ${dossier.entreprise_nom}</li>
        <li><strong>SIRET:</strong> ${dossier.siret}</li>
        <li><strong>OPCO:</strong> ${opco}</li>
      </ul>
      
      <h3>Informations Bénéficiaire</h3>
      <ul>
        <li><strong>Nom:</strong> ${dossier.beneficiaire_nom} ${dossier.beneficiaire_prenom}</li>
        <li><strong>Email:</strong> ${dossier.beneficiaire_email}</li>
        <li><strong>Téléphone:</strong> ${dossier.beneficiaire_telephone || 'Non renseigné'}</li>
      </ul>
      
      <h3>Détails du Dossier</h3>
      <ul>
        <li><strong>Type:</strong> ${dossier.type_dossier}</li>
        <li><strong>Montant estimé:</strong> ${dossier.montant_estime} €</li>
        <li><strong>Référence:</strong> ${dossier.reference || `BC-${dossier.id}-${new Date().getFullYear()}`}</li>
      </ul>
      
      <p>Vous trouverez en pièces jointes les documents nécessaires à l'instruction de ce dossier.</p>
      
      <p>Cordialement,<br/>
      <strong>Netz Informatique</strong><br/>
      03 67 31 02 01<br/>
      contact@netzinformatique.fr</p>
    `;

    // Send email via Resend
    const emailData = {
      from: 'MonOPCO <noreply@monopco.fr>',
      to: [opcoEmail],
      cc: [dossier.contact_email, 'contact@netzinformatique.fr'],
      subject: emailSubject,
      html: emailBody,
      // Note: Resend attachments require base64 encoded content
      // For now, we'll include document links instead
    };

    const result = await resend.emails.send(emailData);

    // Log the action in historique
    await query(
      `INSERT INTO historique (dossier_id, action, details, user_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [
        dossierId,
        'email_opco',
        JSON.stringify({ opco, opcoEmail, documents }),
        user.id
      ]
    );

    return res.status(200).json({
      success: true,
      message: `Email envoyé à ${opco}`,
      opco,
      opcoEmail,
      emailId: result.id
    });

  } catch (error) {
    console.error('OPCO email error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

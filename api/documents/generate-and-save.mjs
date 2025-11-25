import { put } from '@vercel/blob';
import { query } from '../_lib/db.mjs';
import { getUserFromRequest } from '../_lib/auth.mjs';
import {
  generateConventionTripartite,
  generateAttestationPresence,
  generateSyntheseBilan,
  generateDemandePriseEnCharge,
  generateFacture
} from '../_lib/pdfGenerator.mjs';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { type, dossierId, data, saveToBlob = true } = req.body;

    if (!type || !dossierId) {
      return res.status(400).json({ error: 'Type et dossierId sont requis' });
    }

    // Get dossier details
    const dossierResult = await query(
      `SELECT d.*, u.entreprise_nom, u.entreprise_siret, u.entreprise_adresse, u.contact_nom as user_contact_nom
       FROM dossiers d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.id = $1`,
      [dossierId]
    );

    if (dossierResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }

    const dossier = dossierResult.rows[0];

    // Check permissions
    if (dossier.user_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Prepare beneficiary info
    const beneficiaire = {
      nom: dossier.beneficiaire_nom,
      prenom: dossier.beneficiaire_prenom,
      email: dossier.beneficiaire_email,
      telephone: dossier.beneficiaire_telephone,
      poste: data?.poste || 'Non renseigné'
    };

    // Prepare entreprise info
    const entreprise = {
      nom: dossier.entreprise_nom || 'Non renseignée',
      siret: dossier.entreprise_siret || 'Non renseigné',
      adresse: dossier.entreprise_adresse || 'Non renseignée',
      contact_nom: dossier.user_contact_nom || 'Non renseigné',
      contact_email: user.email,
      opco: dossier.opco || 'À déterminer'
    };

    let pdfBuffer;
    let documentName;

    // Generate PDF based on type
    switch (type) {
      case 'convention':
        pdfBuffer = await generateConventionTripartite(entreprise, beneficiaire, dossier);
        documentName = `Convention-${dossier.beneficiaire_nom}-${dossier.beneficiaire_prenom}`;
        break;

      case 'attestation':
        const seances = data?.seances || [];
        pdfBuffer = await generateAttestationPresence(beneficiaire, seances, dossier);
        documentName = `Attestation-${dossier.beneficiaire_nom}-${dossier.beneficiaire_prenom}`;
        break;

      case 'synthese':
        const competences = data?.competences || [];
        pdfBuffer = await generateSyntheseBilan(beneficiaire, dossier, competences);
        documentName = `Synthese-${dossier.beneficiaire_nom}-${dossier.beneficiaire_prenom}`;
        break;

      case 'demande':
        pdfBuffer = await generateDemandePriseEnCharge(entreprise, beneficiaire, dossier);
        documentName = `Demande-PriseEnCharge-${dossier.beneficiaire_nom}-${dossier.beneficiaire_prenom}`;
        break;

      case 'facture':
        const montant = data?.montant || parseFloat(dossier.montant_estime) || 0;
        const numeroFacture = data?.numeroFacture || `F-${dossier.id}-${new Date().getFullYear()}`;
        pdfBuffer = await generateFacture(entreprise, dossier, montant, numeroFacture);
        documentName = `Facture-${numeroFacture}`;
        break;

      default:
        return res.status(400).json({ error: 'Type de document invalide' });
    }

    // Save to Vercel Blob if requested
    let documentUrl = null;
    let documentId = null;

    if (saveToBlob) {
      const timestamp = Date.now();
      const filename = `dossier-${dossierId}/pdf/${timestamp}-${documentName}.pdf`;

      // Upload to Vercel Blob
      const blob = await put(filename, pdfBuffer, {
        access: 'public',
        contentType: 'application/pdf'
      });

      documentUrl = blob.url;

      // Save document metadata to database
      const result = await query(
        `INSERT INTO documents (dossier_id, file_name, file_path, file_type, file_size, uploaded_by, uploaded_at, document_type)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
         RETURNING id`,
        [dossierId, `${documentName}.pdf`, blob.url, 'application/pdf', pdfBuffer.length, user.id, type]
      );

      documentId = result.rows[0].id;

      // Log the action
      await query(
        `INSERT INTO logs (user_id, action, entity_type, entity_id, details, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          user.id,
          'generate_pdf',
          'document',
          documentId,
          JSON.stringify({ type, dossierId, documentName })
        ]
      );
    }

    // Return PDF as base64 for download
    const pdfBase64 = pdfBuffer.toString('base64');

    return res.status(200).json({
      success: true,
      message: 'PDF généré avec succès',
      pdf: `data:application/pdf;base64,${pdfBase64}`,
      documentUrl,
      documentId,
      documentName: `${documentName}.pdf`
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la génération du PDF',
      details: error.message 
    });
  }
}

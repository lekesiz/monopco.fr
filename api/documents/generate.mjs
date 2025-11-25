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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, dossierId, data } = req.body;

    if (!type || !dossierId) {
      return res.status(400).json({ error: 'Type and dossierId are required' });
    }

    // Get dossier details
    const dossierResult = await query(
      `SELECT d.*, e.nom as entreprise_nom, e.siret, e.adresse, e.code_naf, e.opco,
              e.contact_nom, e.contact_email
       FROM dossiers d
       LEFT JOIN entreprises e ON d.entreprise_id = e.id
       WHERE d.id = $1`,
      [dossierId]
    );

    if (dossierResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dossier not found' });
    }

    const dossier = dossierResult.rows[0];

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
      siret: dossier.siret || 'Non renseigné',
      adresse: dossier.adresse,
      code_naf: dossier.code_naf,
      opco: dossier.opco,
      contact_nom: dossier.contact_nom,
      contact_email: dossier.contact_email
    };

    let pdfBuffer;

    // Generate PDF based on type
    switch (type) {
      case 'convention':
        pdfBuffer = await generateConventionTripartite(entreprise, beneficiaire, dossier);
        break;

      case 'attestation':
        const seances = data?.seances || [];
        pdfBuffer = await generateAttestationPresence(beneficiaire, seances, dossier);
        break;

      case 'synthese':
        const competences = data?.competences || [];
        pdfBuffer = await generateSyntheseBilan(beneficiaire, dossier, competences);
        break;

      case 'demande':
        pdfBuffer = await generateDemandePriseEnCharge(entreprise, beneficiaire, dossier);
        break;

      case 'facture':
        const montant = data?.montant || parseFloat(dossier.montant_estime) || 0;
        const numeroFacture = data?.numeroFacture || `F-${dossier.id}-${new Date().getFullYear()}`;
        pdfBuffer = await generateFacture(entreprise, dossier, montant, numeroFacture);
        break;

      default:
        return res.status(400).json({ error: 'Invalid document type' });
    }

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-${dossierId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

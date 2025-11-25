import PDFDocument from 'pdfkit';

/**
 * Generate Convention Tripartite PDF for Bilan de Compétences
 */
export async function generateConventionTripartite(entreprise, beneficiaire, dossier) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('CONVENTION DE FORMATION', { align: 'center' });
    doc.fontSize(14).text('BILAN DE COMPÉTENCES', { align: 'center' });
    doc.moveDown(2);

    // Legal reference
    doc.fontSize(10).font('Helvetica')
      .text('Établie conformément aux articles L6313-1, L6313-4 et R6313-4 à R6313-8 du Code du Travail', { align: 'center' });
    doc.moveDown(2);

    // Reference number
    const reference = dossier.reference || `BC-${dossier.id}-${new Date().getFullYear()}`;
    doc.fontSize(11).font('Helvetica-Bold').text(`Référence: ${reference}`, { align: 'right' });
    doc.moveDown(1);

    // Parties
    doc.fontSize(12).font('Helvetica-Bold').text('ENTRE LES SOUSSIGNÉS :');
    doc.moveDown(0.5);

    // Entreprise
    doc.fontSize(11).font('Helvetica-Bold').text('L\'EMPLOYEUR :');
    doc.font('Helvetica')
      .text(`Raison sociale : ${entreprise.nom}`)
      .text(`SIRET : ${entreprise.siret}`)
      .text(`Adresse : ${entreprise.adresse || 'Non renseignée'}`)
      .text(`Représenté par : ${entreprise.contact_nom || 'Non renseigné'}`)
      .text(`Email : ${entreprise.contact_email || 'Non renseigné'}`);
    doc.moveDown(1);

    // Beneficiary
    doc.fontSize(11).font('Helvetica-Bold').text('LE BÉNÉFICIAIRE :');
    doc.font('Helvetica')
      .text(`Nom : ${beneficiaire.nom}`)
      .text(`Prénom : ${beneficiaire.prenom}`)
      .text(`Email : ${beneficiaire.email}`)
      .text(`Téléphone : ${beneficiaire.telephone || 'Non renseigné'}`);
    doc.moveDown(1);

    // OPCO
    doc.fontSize(11).font('Helvetica-Bold').text('L\'OPCO :');
    doc.font('Helvetica')
      .text(`Organisme : ${entreprise.opco || 'À déterminer'}`)
      .text(`Financement : Prise en charge selon barème OPCO`);
    doc.moveDown(2);

    // Article 1 - Object
    doc.fontSize(12).font('Helvetica-Bold').text('ARTICLE 1 - OBJET');
    doc.fontSize(10).font('Helvetica')
      .text('La présente convention a pour objet la réalisation d\'un bilan de compétences conformément aux dispositions du Code du Travail.');
    doc.moveDown(1);

    // Article 2 - Duration
    doc.fontSize(12).font('Helvetica-Bold').text('ARTICLE 2 - DURÉE ET MODALITÉS');
    doc.fontSize(10).font('Helvetica')
      .text(`Durée totale : ${dossier.heures_total || 24} heures`)
      .text(`Date de début : ${dossier.date_debut ? new Date(dossier.date_debut).toLocaleDateString('fr-FR') : 'À définir'}`)
      .text(`Date de fin prévisionnelle : ${dossier.date_fin ? new Date(dossier.date_fin).toLocaleDateString('fr-FR') : 'À définir'}`);
    doc.moveDown(1);

    // Article 3 - Phases
    doc.fontSize(12).font('Helvetica-Bold').text('ARTICLE 3 - DÉROULEMENT DU BILAN');
    doc.fontSize(10).font('Helvetica')
      .text('Le bilan de compétences se déroule en trois phases :')
      .text('- Phase préliminaire : Analyse de la demande et information')
      .text('- Phase d\'investigation : Exploration des compétences et motivations')
      .text('- Phase de conclusion : Synthèse et plan d\'action');
    doc.moveDown(1);

    // Signatures
    doc.addPage();
    doc.fontSize(12).font('Helvetica-Bold').text('SIGNATURES');
    doc.moveDown(2);

    const signatureY = doc.y;
    doc.fontSize(10).font('Helvetica')
      .text('L\'Employeur', 50, signatureY)
      .text('Le Bénéficiaire', 300, signatureY);
    
    doc.moveDown(4);
    doc.text('Date et signature :', 50, doc.y)
      .text('Date et signature :', 300, doc.y - 12);

    // Footer
    doc.fontSize(8).font('Helvetica')
      .text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} par MonOPCO.fr`, 50, 750, { align: 'center' });

    doc.end();
  });
}

/**
 * Generate Attestation de Présence PDF
 */
export async function generateAttestationPresence(beneficiaire, seances, dossier) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('ATTESTATION DE PRÉSENCE', { align: 'center' });
    doc.moveDown(2);

    // Beneficiary info
    doc.fontSize(12).font('Helvetica')
      .text(`Je soussigné(e), certifie que ${beneficiaire.prenom} ${beneficiaire.nom} a bien participé aux séances suivantes :`);
    doc.moveDown(1);

    // Sessions table
    doc.fontSize(10);
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 150;
    const col3 = 300;
    const col4 = 450;

    // Table header
    doc.font('Helvetica-Bold')
      .text('Date', col1, tableTop)
      .text('Horaires', col2, tableTop)
      .text('Durée', col3, tableTop)
      .text('Thème', col4, tableTop);

    doc.moveDown(0.5);
    doc.moveTo(col1, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Table rows
    doc.font('Helvetica');
    seances.forEach((seance) => {
      const y = doc.y;
      doc.text(new Date(seance.date).toLocaleDateString('fr-FR'), col1, y)
        .text(`${seance.heure_debut} - ${seance.heure_fin}`, col2, y)
        .text(`${seance.duree}h`, col3, y)
        .text(seance.theme, col4, y, { width: 100 });
      doc.moveDown(0.8);
    });

    // Total hours
    const totalHeures = seances.reduce((sum, s) => sum + (s.duree || 0), 0);
    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica-Bold')
      .text(`Total des heures réalisées : ${totalHeures} heures`);

    // Signature
    doc.moveDown(3);
    doc.fontSize(10).font('Helvetica')
      .text('Fait à _________________, le _______________')
      .moveDown(2)
      .text('Signature du consultant :');

    // Footer
    doc.fontSize(8).font('Helvetica')
      .text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} par MonOPCO.fr`, 50, 750, { align: 'center' });

    doc.end();
  });
}

/**
 * Generate Synthèse Bilan PDF
 */
export async function generateSyntheseBilan(beneficiaire, dossier, competences) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('SYNTHÈSE DU BILAN DE COMPÉTENCES', { align: 'center' });
    doc.moveDown(2);

    // Beneficiary
    doc.fontSize(12).font('Helvetica-Bold').text('BÉNÉFICIAIRE');
    doc.fontSize(10).font('Helvetica')
      .text(`${beneficiaire.prenom} ${beneficiaire.nom}`)
      .text(`Email : ${beneficiaire.email}`);
    doc.moveDown(1);

    // Period
    doc.fontSize(12).font('Helvetica-Bold').text('PÉRIODE');
    doc.fontSize(10).font('Helvetica')
      .text(`Du ${dossier.date_debut ? new Date(dossier.date_debut).toLocaleDateString('fr-FR') : 'N/A'} au ${dossier.date_fin ? new Date(dossier.date_fin).toLocaleDateString('fr-FR') : 'N/A'}`)
      .text(`Nombre d'heures : ${dossier.heures_realisees || 0} / ${dossier.heures_total || 24}`);
    doc.moveDown(1);

    // Competences
    doc.fontSize(12).font('Helvetica-Bold').text('COMPÉTENCES IDENTIFIÉES');
    doc.fontSize(10).font('Helvetica');
    if (competences && competences.length > 0) {
      competences.forEach((comp, index) => {
        doc.text(`${index + 1}. ${comp.nom} - Niveau : ${comp.niveau}`);
      });
    } else {
      doc.text('Aucune compétence renseignée');
    }
    doc.moveDown(1);

    // Project
    doc.fontSize(12).font('Helvetica-Bold').text('PROJET PROFESSIONNEL');
    doc.fontSize(10).font('Helvetica')
      .text(dossier.notes || 'À compléter lors de la phase de conclusion');
    doc.moveDown(2);

    // Signature
    doc.fontSize(10).font('Helvetica')
      .text('Le consultant,')
      .moveDown(3)
      .text('Signature :');

    // Footer
    doc.fontSize(8).font('Helvetica')
      .text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} par MonOPCO.fr`, 50, 750, { align: 'center' });

    doc.end();
  });
}

/**
 * Generate Demande de Prise en Charge PDF
 */
export async function generateDemandePriseEnCharge(entreprise, beneficiaire, dossier) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('DEMANDE DE PRISE EN CHARGE', { align: 'center' });
    doc.fontSize(14).text('BILAN DE COMPÉTENCES', { align: 'center' });
    doc.moveDown(2);

    // Reference
    const reference = dossier.reference || `BC-${dossier.id}-${new Date().getFullYear()}`;
    doc.fontSize(11).font('Helvetica-Bold').text(`Référence: ${reference}`, { align: 'right' });
    doc.moveDown(1);

    // OPCO
    doc.fontSize(12).font('Helvetica-Bold').text('DESTINATAIRE');
    doc.fontSize(10).font('Helvetica')
      .text(`OPCO : ${entreprise.opco || 'À déterminer'}`)
      .text(`Date de la demande : ${new Date().toLocaleDateString('fr-FR')}`);
    doc.moveDown(1);

    // Entreprise
    doc.fontSize(12).font('Helvetica-Bold').text('ENTREPRISE');
    doc.fontSize(10).font('Helvetica')
      .text(`Raison sociale : ${entreprise.nom}`)
      .text(`SIRET : ${entreprise.siret}`)
      .text(`Code NAF : ${entreprise.code_naf || 'Non renseigné'}`)
      .text(`Adresse : ${entreprise.adresse || 'Non renseignée'}`);
    doc.moveDown(1);

    // Beneficiary
    doc.fontSize(12).font('Helvetica-Bold').text('SALARIÉ BÉNÉFICIAIRE');
    doc.fontSize(10).font('Helvetica')
      .text(`Nom : ${beneficiaire.nom}`)
      .text(`Prénom : ${beneficiaire.prenom}`)
      .text(`Poste : ${beneficiaire.poste || 'Non renseigné'}`);
    doc.moveDown(1);

    // Action details
    doc.fontSize(12).font('Helvetica-Bold').text('DÉTAILS DE L\'ACTION');
    doc.fontSize(10).font('Helvetica')
      .text(`Type : Bilan de compétences`)
      .text(`Durée : ${dossier.heures_total || 24} heures`)
      .text(`Coût estimé : ${dossier.montant_estime || 'À déterminer'} €`)
      .text(`Date de début souhaitée : ${dossier.date_debut ? new Date(dossier.date_debut).toLocaleDateString('fr-FR') : 'À définir'}`);
    doc.moveDown(2);

    // Signature
    doc.fontSize(10).font('Helvetica')
      .text('Fait à _________________, le _______________')
      .moveDown(3)
      .text('Signature et cachet de l\'entreprise :');

    // Footer
    doc.fontSize(8).font('Helvetica')
      .text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} par MonOPCO.fr`, 50, 750, { align: 'center' });

    doc.end();
  });
}

/**
 * Generate Facture PDF
 */
export async function generateFacture(entreprise, dossier, montant, numeroFacture) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('FACTURE', { align: 'center' });
    doc.moveDown(2);

    // Invoice number and date
    doc.fontSize(11).font('Helvetica-Bold')
      .text(`Facture N° ${numeroFacture}`, { align: 'right' })
      .text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' });
    doc.moveDown(2);

    // Provider (MonOPCO)
    doc.fontSize(12).font('Helvetica-Bold').text('PRESTATAIRE');
    doc.fontSize(10).font('Helvetica')
      .text('MonOPCO - Plateforme de gestion OPCO')
      .text('Adresse : À compléter')
      .text('SIRET : À compléter');
    doc.moveDown(1);

    // Client (Entreprise)
    doc.fontSize(12).font('Helvetica-Bold').text('CLIENT');
    doc.fontSize(10).font('Helvetica')
      .text(`${entreprise.nom}`)
      .text(`SIRET : ${entreprise.siret}`)
      .text(`Adresse : ${entreprise.adresse || 'Non renseignée'}`);
    doc.moveDown(2);

    // Invoice details
    doc.fontSize(12).font('Helvetica-Bold').text('DÉTAILS');
    doc.moveDown(0.5);

    // Table
    const tableTop = doc.y;
    doc.fontSize(10).font('Helvetica-Bold')
      .text('Description', 50, tableTop)
      .text('Quantité', 300, tableTop)
      .text('Prix unitaire', 400, tableTop)
      .text('Total HT', 480, tableTop);

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    doc.font('Helvetica')
      .text('Bilan de compétences', 50, doc.y)
      .text('1', 300, doc.y)
      .text(`${montant} €`, 400, doc.y)
      .text(`${montant} €`, 480, doc.y);

    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Totals
    const tva = montant * 0.20;
    const totalTTC = montant + tva;

    doc.fontSize(11).font('Helvetica-Bold')
      .text(`Total HT : ${montant.toFixed(2)} €`, { align: 'right' })
      .text(`TVA (20%) : ${tva.toFixed(2)} €`, { align: 'right' })
      .text(`Total TTC : ${totalTTC.toFixed(2)} €`, { align: 'right' });

    // Payment info
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica')
      .text('Conditions de paiement : À réception')
      .text('Mode de paiement : Virement bancaire');

    // Footer
    doc.fontSize(8).font('Helvetica')
      .text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} par MonOPCO.fr`, 50, 750, { align: 'center' });

    doc.end();
  });
}

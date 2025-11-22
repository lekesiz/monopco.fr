import PDFDocument from "pdfkit";
import { Readable } from "stream";

/**
 * Utilitaire pour générer des documents PDF OPCO
 * Basé sur les modèles officiels du Ministère du Travail et des OPCO
 */

export interface EntrepriseInfo {
  id: number;
  siret: string;
  nom: string;
  adresse: string | null;
  codeNaf: string | null;
  opco: string | null;
  contactNom: string | null;
  contactEmail: string | null;
  contactTelephone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BeneficiaireInfo {
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  poste?: string;
}

export interface DossierInfo {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  entrepriseId: number;
  typeDossier: "bilan" | "formation";
  beneficiaireNom: string;
  beneficiairePrenom: string;
  beneficiaireEmail: string;
  beneficiaireTelephone: string | null;
  dateDebut: Date | null;
  dateFin: Date | null;
  heuresRealisees: number;
  heuresTotal: number;
  statut: string;
  notes: string | null;
  createdBy: number | null;
  reference?: string | null;
}

export interface SeanceInfo {
  date: Date;
  heureDebut: string;
  heureFin: string;
  duree: number;
  theme: string;
  phase: "Phase 1" | "Phase 2" | "Phase 3";
}

/**
 * Génère une Convention Tripartite pour Bilan de Compétences
 */
export async function genererConventionTripartite(
  entreprise: EntrepriseInfo,
  beneficiaire: BeneficiaireInfo,
  dossier: DossierInfo
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // En-tête
    doc.fontSize(18).font("Helvetica-Bold").text("CONVENTION DE FORMATION", { align: "center" });
    doc.fontSize(14).text("BILAN DE COMPÉTENCES", { align: "center" });
    doc.moveDown(2);

    // Référence légale
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        "Établie conformément aux articles L6313-1, L6313-4 et R6313-4 à R6313-8 du Code du Travail",
        { align: "center" }
      );
    doc.moveDown(2);

    // Référence du dossier
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`Référence: ${dossier.reference || `BC-${dossier.id}-${new Date().getFullYear()}`}`, { align: "right" });
    doc.moveDown(1);

    // ENTRE LES SOUSSIGNÉS
    doc.fontSize(12).font("Helvetica-Bold").text("ENTRE LES SOUSSIGNÉS :");
    doc.moveDown(0.5);

    // 1. L'ENTREPRISE
    doc.fontSize(11).font("Helvetica-Bold").text("1. L'ENTREPRISE");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Raison sociale : ${entreprise.nom}`);
    doc.text(`SIRET : ${entreprise.siret}`);
    doc.text(`Adresse : ${entreprise.adresse || 'Non renseignée'}`);
    doc.text(`Code NAF : ${entreprise.codeNaf || 'Non renseigné'}`);
    doc.text(`OPCO de rattachement : ${entreprise.opco || 'Non renseigné'}`);
    doc.moveDown(1);

    // 2. LE BÉNÉFICIAIRE
    doc.fontSize(11).font("Helvetica-Bold").text("2. LE BÉNÉFICIAIRE");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Nom : ${beneficiaire.nom}`);
    doc.text(`Prénom : ${beneficiaire.prenom}`);
    doc.text(`Email : ${beneficiaire.email}`);
    doc.text(`Téléphone : ${beneficiaire.telephone}`);
    if (beneficiaire.poste) {
      doc.text(`Poste occupé : ${beneficiaire.poste}`);
    }
    doc.moveDown(1);

    // 3. L'ORGANISME PRESTATAIRE
    doc.fontSize(11).font("Helvetica-Bold").text("3. L'ORGANISME PRESTATAIRE");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text("Netz Informatique");
    doc.text("SIRET : [À compléter]");
    doc.text("Adresse : 67500 Haguenau, France");
    doc.text("Numéro de déclaration d'activité (NDA) : [À compléter]");
    doc.text("Certification Qualiopi : [À compléter]");
    doc.moveDown(2);

    // ARTICLE 1 - OBJET
    doc.fontSize(11).font("Helvetica-Bold").text("ARTICLE 1 - OBJET DE LA CONVENTION");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(
      "La présente convention a pour objet la réalisation d'un Bilan de Compétences au bénéfice du salarié susmentionné, conformément aux dispositions des articles L6313-1 et suivants du Code du Travail."
    );
    doc.moveDown(1);

    // ARTICLE 2 - NATURE ET CONTENU
    doc.fontSize(11).font("Helvetica-Bold").text("ARTICLE 2 - NATURE ET CONTENU DE L'ACTION");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text("Intitulé : Bilan de Compétences");
    doc.moveDown(0.5);
    doc.text("Objectif :");
    doc.text(
      "Analyser les compétences professionnelles et personnelles du bénéficiaire, ses aptitudes et motivations afin de définir un projet professionnel et, le cas échéant, un projet de formation."
    );
    doc.moveDown(0.5);
    doc.text("Contenu détaillé :");
    doc.text("• Phase préliminaire (6-8 heures) : Analyse de la demande, définition des besoins");
    doc.text("• Phase d'investigation (12-14 heures) : Tests, entretiens, exploration des compétences");
    doc.text("• Phase de conclusion (4-6 heures) : Synthèse des résultats et plan d'action");
    doc.moveDown(1);

    // Nouvelle page pour la suite
    doc.addPage();

    // ARTICLE 3 - DURÉE ET PÉRIODE
    doc.fontSize(11).font("Helvetica-Bold").text("ARTICLE 3 - DURÉE ET PÉRIODE DE RÉALISATION");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Durée totale : ${dossier.heuresTotal} heures`);
    doc.text(
      `Période de réalisation : du ${dossier.dateDebut?.toLocaleDateString("fr-FR")} au ${dossier.dateFin?.toLocaleDateString("fr-FR")}`
    );
    doc.text("Modalités : Séances individuelles en présentiel et/ou à distance");
    doc.moveDown(1);

    // ARTICLE 4 - MOYENS PÉDAGOGIQUES
    doc.fontSize(11).font("Helvetica-Bold").text("ARTICLE 4 - MOYENS PÉDAGOGIQUES ET TECHNIQUES");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text("• Entretiens individuels avec un consultant certifié");
    doc.text("• Tests de personnalité et d'aptitudes professionnelles");
    doc.text("• Outils d'évaluation des compétences");
    doc.text("• Documentation et supports pédagogiques");
    doc.text("• Plateforme de suivi en ligne (si applicable)");
    doc.moveDown(1);

    // ARTICLE 5 - MODALITÉS DE SUIVI
    doc.fontSize(11).font("Helvetica-Bold").text("ARTICLE 5 - MODALITÉS DE SUIVI ET D'ÉVALUATION");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text("• Feuilles d'émargement pour chaque séance");
    doc.text("• Attestations de présence");
    doc.text("• Document de synthèse remis en fin de bilan");
    doc.text("• Questionnaire de satisfaction");
    doc.moveDown(1);

    // ARTICLE 6 - COÛT ET FINANCEMENT
    doc.fontSize(11).font("Helvetica-Bold").text("ARTICLE 6 - COÛT ET MODALITÉS DE FINANCEMENT");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text("Coût total du bilan : [À compléter] € HT");
    doc.text(`Financement : Prise en charge par ${entreprise.opco}`);
    doc.text("Modalités de paiement : Règlement par l'OPCO sur présentation de facture et certificat de réalisation");
    doc.moveDown(1);

    // ARTICLE 7 - CONFIDENTIALITÉ
    doc.fontSize(11).font("Helvetica-Bold").text("ARTICLE 7 - CONFIDENTIALITÉ");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(
      "Les résultats du bilan de compétences sont la propriété exclusive du bénéficiaire. Le document de synthèse ne peut être communiqué à un tiers qu'avec l'accord exprès du bénéficiaire."
    );
    doc.moveDown(1);

    // ARTICLE 8 - RÉSILIATION
    doc.fontSize(11).font("Helvetica-Bold").text("ARTICLE 8 - RÉSILIATION");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(
      "Le bénéficiaire peut, à tout moment et sans motif, interrompre le bilan de compétences. L'organisme prestataire s'engage à établir une attestation mentionnant la durée de l'action et la nature des prestations réalisées."
    );
    doc.moveDown(2);

    // SIGNATURES
    doc.fontSize(11).font("Helvetica-Bold").text("FAIT EN TROIS EXEMPLAIRES ORIGINAUX");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`À Haguenau, le ${new Date().toLocaleDateString("fr-FR")}`);
    doc.moveDown(2);

    // Cadres de signatures
    const signatureY = doc.y;
    doc.fontSize(9).font("Helvetica-Bold");

    // Signature entreprise
    doc.text("L'ENTREPRISE", 50, signatureY);
    doc.text("(Nom, Qualité, Signature)", 50, signatureY + 15);
    doc.rect(50, signatureY + 30, 150, 60).stroke();

    // Signature bénéficiaire
    doc.text("LE BÉNÉFICIAIRE", 220, signatureY);
    doc.text("(Nom, Signature)", 220, signatureY + 15);
    doc.rect(220, signatureY + 30, 150, 60).stroke();

    // Signature organisme
    doc.text("L'ORGANISME PRESTATAIRE", 390, signatureY);
    doc.text("(Nom, Qualité, Signature)", 390, signatureY + 15);
    doc.rect(390, signatureY + 30, 150, 60).stroke();

    doc.end();
  });
}

/**
 * Génère un Certificat de Réalisation (modèle Ministère du Travail)
 */
export async function genererCertificatRealisation(
  entreprise: EntrepriseInfo,
  beneficiaire: BeneficiaireInfo,
  dossier: DossierInfo
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // En-tête organisme
    doc.fontSize(10).font("Helvetica-Bold").text("NETZ INFORMATIQUE", { align: "left" });
    doc.fontSize(9).font("Helvetica").text("67500 Haguenau, France");
    doc.text("SIRET : [À compléter]");
    doc.text("NDA : [À compléter]");
    doc.moveDown(2);

    // Titre
    doc.fontSize(16).font("Helvetica-Bold").text("CERTIFICAT DE RÉALISATION", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Établi conformément à l'article R. 6332-26 du Code du Travail", { align: "center" });
    doc.text("et à l'arrêté du 21 décembre 2018", { align: "center" });
    doc.moveDown(2);

    // Référence
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`Référence dossier : ${dossier.reference}`, { align: "right" });
    doc.moveDown(1);

    // Nature de l'action
    doc.fontSize(11).font("Helvetica-Bold").text("NATURE DE L'ACTION :");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text("☑ Bilan de compétences");
    doc.text("☐ Action de formation");
    doc.text("☐ Action de VAE");
    doc.text("☐ Action de formation par alternance");
    doc.moveDown(1);

    // Informations bénéficiaire
    doc.fontSize(11).font("Helvetica-Bold").text("BÉNÉFICIAIRE :");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Nom : ${beneficiaire.nom}`);
    doc.text(`Prénom : ${beneficiaire.prenom}`);
    doc.moveDown(1);

    // Informations entreprise
    doc.fontSize(11).font("Helvetica-Bold").text("ENTREPRISE :");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Raison sociale : ${entreprise.nom}`);
    doc.text(`SIRET : ${entreprise.siret}`);
    doc.text(`Adresse : ${entreprise.adresse || 'Non renseignée'}`);
    doc.moveDown(1);

    // Intitulé de l'action
    doc.fontSize(11).font("Helvetica-Bold").text("INTITULÉ DE L'ACTION :");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text("Bilan de Compétences - Accompagnement personnalisé");
    doc.moveDown(1);

    // Période de réalisation
    doc.fontSize(11).font("Helvetica-Bold").text("PÉRIODE DE RÉALISATION :");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Du ${dossier.dateDebut?.toLocaleDateString("fr-FR")} au ${dossier.dateFin?.toLocaleDateString("fr-FR")}`);
    doc.moveDown(1);

    // Nombre d'heures
    doc.fontSize(11).font("Helvetica-Bold").text("NOMBRE D'HEURES RÉALISÉES :");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(`${dossier.heuresRealisees} heures (sur ${dossier.heuresTotal} heures prévues)`);
    doc.text("Note : Les heures sont indiquées en centièmes (ex: 1,5 pour 1h30)");
    doc.moveDown(1);

    // Détail des phases
    doc.fontSize(11).font("Helvetica-Bold").text("DÉTAIL DES PHASES RÉALISÉES :");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text("• Phase préliminaire : Analyse de la demande et définition des besoins");
    doc.text("• Phase d'investigation : Tests, entretiens et exploration des compétences");
    doc.text("• Phase de conclusion : Synthèse des résultats et plan d'action");
    doc.moveDown(1);

    // Document de synthèse
    doc.fontSize(11).font("Helvetica-Bold").text("DOCUMENT DE SYNTHÈSE :");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text("☑ Remis au bénéficiaire le [Date à compléter]");
    doc.moveDown(2);

    // Attestation
    doc.fontSize(10).font("Helvetica");
    doc.text(
      "Je soussigné(e), représentant(e) de l'organisme prestataire, certifie l'exactitude des informations mentionnées ci-dessus et atteste de la réalisation effective de l'action conformément aux dispositions légales et réglementaires en vigueur."
    );
    doc.moveDown(2);

    // Signature
    doc.fontSize(10).font("Helvetica");
    doc.text(`Fait à Haguenau, le ${new Date().toLocaleDateString("fr-FR")}`);
    doc.moveDown(1);
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Signature et cachet de l'organisme prestataire :");
    doc.moveDown(0.5);
    doc.rect(50, doc.y, 200, 80).stroke();

    doc.end();
  });
}

/**
 * Génère une Feuille d'Émargement pour une séance
 */
export async function genererFeuilleEmargement(
  entreprise: EntrepriseInfo,
  beneficiaire: BeneficiaireInfo,
  dossier: DossierInfo,
  seance: SeanceInfo
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // En-tête
    doc.fontSize(10).font("Helvetica-Bold").text("NETZ INFORMATIQUE", { align: "left" });
    doc.fontSize(9).font("Helvetica").text("67500 Haguenau, France");
    doc.text("NDA : [À compléter]");
    doc.moveDown(2);

    // Titre
    doc.fontSize(16).font("Helvetica-Bold").text("FEUILLE D'ÉMARGEMENT", { align: "center" });
    doc.fontSize(12).text("Bilan de Compétences", { align: "center" });
    doc.moveDown(2);

    // Informations dossier
    doc.fontSize(10).font("Helvetica-Bold").text(`Référence : ${dossier.reference}`);
    doc.moveDown(1);

    // Informations séance
    doc.fontSize(11).font("Helvetica-Bold").text("SÉANCE :");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Date : ${seance.date.toLocaleDateString("fr-FR")}`);
    doc.text(`Horaires : ${seance.heureDebut} - ${seance.heureFin}`);
    doc.text(`Durée : ${seance.duree} heure(s)`);
    doc.text(`Phase : ${seance.phase}`);
    doc.text(`Thème : ${seance.theme}`);
    doc.moveDown(1);

    // Informations bénéficiaire
    doc.fontSize(11).font("Helvetica-Bold").text("BÉNÉFICIAIRE :");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Nom : ${beneficiaire.nom}`);
    doc.text(`Prénom : ${beneficiaire.prenom}`);
    doc.text(`Entreprise : ${entreprise.nom}`);
    doc.moveDown(2);

    // Tableau d'émargement
    const tableTop = doc.y;
    const col1X = 50;
    const col2X = 200;
    const col3X = 350;
    const rowHeight = 80;

    // En-têtes
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Heure", col1X, tableTop);
    doc.text("Signature Bénéficiaire", col2X, tableTop);
    doc.text("Signature Consultant", col3X, tableTop);

    // Ligne de séparation
    doc.moveTo(col1X, tableTop + 15).lineTo(545, tableTop + 15).stroke();

    // Début de séance
    doc.fontSize(10).font("Helvetica");
    doc.text(seance.heureDebut, col1X, tableTop + 25);
    doc.rect(col2X, tableTop + 20, 140, rowHeight).stroke();
    doc.rect(col3X, tableTop + 20, 140, rowHeight).stroke();

    // Fin de séance
    const row2Top = tableTop + rowHeight + 30;
    doc.text(seance.heureFin, col1X, row2Top + 5);
    doc.rect(col2X, row2Top, 140, rowHeight).stroke();
    doc.rect(col3X, row2Top, 140, rowHeight).stroke();

    // Observations
    doc.moveDown(12);
    doc.fontSize(11).font("Helvetica-Bold").text("OBSERVATIONS :");
    doc.moveDown(0.5);
    doc.rect(50, doc.y, 495, 60).stroke();

    doc.end();
  });
}

/**
 * Génère une Demande de Prise en Charge OPCO
 */
export async function genererDemandePriseEnCharge(
  entreprise: EntrepriseInfo,
  beneficiaire: BeneficiaireInfo,
  dossier: DossierInfo,
  montant: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // En-tête
    doc.fontSize(16).font("Helvetica-Bold").text("DEMANDE DE PRISE EN CHARGE", { align: "center" });
    doc.fontSize(12).text(`${entreprise.opco}`, { align: "center" });
    doc.moveDown(2);

    // Date et référence
    doc.fontSize(10).font("Helvetica");
    doc.text(`Date de la demande : ${new Date().toLocaleDateString("fr-FR")}`, { align: "right" });
    doc.text(`Référence : ${dossier.reference}`, { align: "right" });
    doc.moveDown(2);

    // SECTION 1 - ENTREPRISE
    doc.fontSize(12).font("Helvetica-Bold").text("1. INFORMATIONS ENTREPRISE");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Raison sociale : ${entreprise.nom}`);
    doc.text(`SIRET : ${entreprise.siret}`);
    doc.text(`Code NAF : ${entreprise.codeNaf}`);
    doc.text(`Adresse : ${entreprise.adresse}`);
    doc.text(``);
    doc.text(`OPCO de rattachement : ${entreprise.opco}`);
    doc.moveDown(1);

    // SECTION 2 - BÉNÉFICIAIRE
    doc.fontSize(12).font("Helvetica-Bold").text("2. INFORMATIONS BÉNÉFICIAIRE");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Nom : ${beneficiaire.nom}`);
    doc.text(`Prénom : ${beneficiaire.prenom}`);
    doc.text(`Email : ${beneficiaire.email}`);
    doc.text(`Téléphone : ${beneficiaire.telephone}`);
    if (beneficiaire.poste) {
      doc.text(`Poste : ${beneficiaire.poste}`);
    }
    doc.moveDown(1);

    // SECTION 3 - ACTION DE FORMATION
    doc.fontSize(12).font("Helvetica-Bold").text("3. ACTION DE FORMATION");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text("Nature de l'action : ☑ Bilan de compétences");
    doc.text("Intitulé : Bilan de Compétences - Accompagnement personnalisé");
    doc.moveDown(0.5);
    doc.text("Objectif :");
    doc.text(
      "Analyser les compétences professionnelles et personnelles, définir un projet professionnel et identifier les besoins en formation."
    );
    doc.moveDown(0.5);
    doc.text(`Durée : ${dossier.heuresTotal} heures`);
    doc.text(`Période : du ${dossier.dateDebut?.toLocaleDateString("fr-FR")} au ${dossier.dateFin?.toLocaleDateString("fr-FR")}`);
    doc.text("Modalités : Présentiel et/ou distanciel");
    doc.moveDown(1);

    // SECTION 4 - ORGANISME PRESTATAIRE
    doc.fontSize(12).font("Helvetica-Bold").text("4. ORGANISME PRESTATAIRE");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text("Organisme : Netz Informatique");
    doc.text("SIRET : [À compléter]");
    doc.text("NDA : [À compléter]");
    doc.text("Certification Qualiopi : Oui / [À compléter]");
    doc.text("Adresse : 67500 Haguenau, France");
    doc.text("Contact : 03 67 31 02 01");
    doc.text("Email : contact@netzinformatique.fr");
    doc.moveDown(1);

    // SECTION 5 - COÛT
    doc.fontSize(12).font("Helvetica-Bold").text("5. COÛT DE L'ACTION");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Coût total HT : ${montant.toFixed(2)} €`);
    doc.text(`TVA (20%) : ${(montant * 0.2).toFixed(2)} €`);
    doc.text(`Coût total TTC : ${(montant * 1.2).toFixed(2)} €`);
    doc.moveDown(0.5);
    doc.text("Financement demandé à l'OPCO : 100%");
    doc.moveDown(1);

    // SECTION 6 - PIÈCES JOINTES
    doc.fontSize(12).font("Helvetica-Bold").text("6. PIÈCES JOINTES");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text("☑ Convention tripartite signée");
    doc.text("☑ Programme détaillé du bilan");
    doc.text("☑ Devis de l'organisme prestataire");
    doc.text("☑ Attestation Qualiopi de l'organisme");
    doc.moveDown(2);

    // ENGAGEMENT
    doc.fontSize(10).font("Helvetica");
    doc.text(
      "Je soussigné(e), représentant(e) légal(e) de l'entreprise, demande la prise en charge de cette action de formation et m'engage à respecter les conditions de financement de l'OPCO."
    );
    doc.moveDown(2);

    // Signature
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text(`Fait le ${new Date().toLocaleDateString("fr-FR")}`);
    doc.moveDown(1);
    doc.text("Signature et cachet de l'entreprise :");
    doc.moveDown(0.5);
    doc.rect(50, doc.y, 200, 80).stroke();

    doc.end();
  });
}

/**
 * Génère le Document de Synthèse du Bilan de Compétences
 */
export async function genererDocumentSynthese(
  beneficiaire: BeneficiaireInfo,
  dossier: DossierInfo,
  contenuSynthese: {
    circonstances: string;
    competences: string[];
    aptitudes: string[];
    motivations: string[];
    projetProfessionnel: string;
    planAction: string[];
    recommandationsFormation: string[];
  }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Page de garde
    doc.fontSize(20).font("Helvetica-Bold").text("BILAN DE COMPÉTENCES", { align: "center" });
    doc.moveDown(1);
    doc.fontSize(16).text("DOCUMENT DE SYNTHÈSE", { align: "center" });
    doc.moveDown(3);

    doc.fontSize(12).font("Helvetica");
    doc.text(`${beneficiaire.prenom} ${beneficiaire.nom}`, { align: "center" });
    doc.moveDown(1);
    doc.text(`Période : ${dossier.dateDebut?.toLocaleDateString("fr-FR")} - ${dossier.dateFin?.toLocaleDateString("fr-FR")}`, {
      align: "center",
    });
    doc.moveDown(5);

    doc.fontSize(10).font("Helvetica-Bold").text("NETZ INFORMATIQUE", { align: "center" });
    doc.fontSize(9).font("Helvetica").text("67500 Haguenau, France", { align: "center" });
    doc.moveDown(3);

    doc.fontSize(8).font("Helvetica-Oblique").text("Document confidentiel - Propriété exclusive du bénéficiaire", {
      align: "center",
    });

    // Nouvelle page - Avertissement
    doc.addPage();
    doc.fontSize(12).font("Helvetica-Bold").text("AVERTISSEMENT");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(
      "Conformément aux articles R6313-4 à R6313-8 du Code du Travail, les résultats du bilan de compétences sont la propriété exclusive du bénéficiaire."
    );
    doc.moveDown(0.5);
    doc.text(
      "Ce document ne peut être communiqué à un tiers (y compris l'employeur) qu'avec l'accord exprès et écrit du bénéficiaire."
    );
    doc.moveDown(2);

    // Nouvelle page - Contenu
    doc.addPage();

    // 1. CIRCONSTANCES
    doc.fontSize(14).font("Helvetica-Bold").text("1. CIRCONSTANCES DU BILAN");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(contenuSynthese.circonstances, { align: "justify" });
    doc.moveDown(1);

    // 2. COMPÉTENCES
    doc.fontSize(14).font("Helvetica-Bold").text("2. COMPÉTENCES IDENTIFIÉES");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    contenuSynthese.competences.forEach((comp) => {
      doc.text(`• ${comp}`);
    });
    doc.moveDown(1);

    // 3. APTITUDES
    doc.fontSize(14).font("Helvetica-Bold").text("3. APTITUDES ET QUALITÉS PERSONNELLES");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    contenuSynthese.aptitudes.forEach((apt) => {
      doc.text(`• ${apt}`);
    });
    doc.moveDown(1);

    // 4. MOTIVATIONS
    doc.fontSize(14).font("Helvetica-Bold").text("4. MOTIVATIONS ET CENTRES D'INTÉRÊT");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    contenuSynthese.motivations.forEach((motiv) => {
      doc.text(`• ${motiv}`);
    });
    doc.moveDown(1);

    // Nouvelle page pour projet professionnel
    doc.addPage();

    // 5. PROJET PROFESSIONNEL
    doc.fontSize(14).font("Helvetica-Bold").text("5. PROJET PROFESSIONNEL");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(contenuSynthese.projetProfessionnel, { align: "justify" });
    doc.moveDown(1);

    // 6. PLAN D'ACTION
    doc.fontSize(14).font("Helvetica-Bold").text("6. PLAN D'ACTION PERSONNALISÉ");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    contenuSynthese.planAction.forEach((action, index) => {
      doc.text(`${index + 1}. ${action}`);
      doc.moveDown(0.3);
    });
    doc.moveDown(1);

    // 7. RECOMMANDATIONS FORMATION
    doc.fontSize(14).font("Helvetica-Bold").text("7. RECOMMANDATIONS DE FORMATION");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    if (contenuSynthese.recommandationsFormation.length > 0) {
      contenuSynthese.recommandationsFormation.forEach((reco) => {
        doc.text(`• ${reco}`);
      });
    } else {
      doc.text("Aucune formation spécifique recommandée à ce stade.");
    }
    doc.moveDown(2);

    // Signature consultant
    doc.fontSize(10).font("Helvetica");
    doc.text(`Fait à Haguenau, le ${new Date().toLocaleDateString("fr-FR")}`);
    doc.moveDown(1);
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Le consultant en charge du bilan :");
    doc.moveDown(0.5);
    doc.rect(50, doc.y, 200, 60).stroke();

    doc.end();
  });
}

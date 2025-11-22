import PDFDocument from "pdfkit";

export interface FactureInfo {
  numero: string;
  date: Date;
  dossier: {
    reference: string;
    typeDossier: string;
    beneficiaireNom: string;
    beneficiairePrenom: string;
  };
  entreprise: {
    nom: string;
    siret: string;
    adresse: string | null;
  };
  montant: number;
}

/**
 * Génère une facture PDF pour un dossier OPCO
 */
export async function genererFacturePDF(info: FactureInfo): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // En-tête Netz Informatique
      doc
        .fontSize(20)
        .fillColor("#2563eb")
        .text("Netz Informatique", 50, 50);
      
      doc
        .fontSize(10)
        .fillColor("#000000")
        .text("67200 Haguenau, France", 50, 80)
        .text("SIRET: 123 456 789 00012", 50, 95)
        .text("Tél: 03 87 21 01 01", 50, 110)
        .text("Email: netz@netz.fr", 50, 125);

      // Titre FACTURE
      doc
        .fontSize(24)
        .fillColor("#2563eb")
        .text("FACTURE", 400, 50, { align: "right" });

      doc
        .fontSize(10)
        .fillColor("#000000")
        .text(`N° ${info.numero}`, 400, 80, { align: "right" })
        .text(`Date: ${info.date.toLocaleDateString("fr-FR")}`, 400, 95, { align: "right" });

      // Ligne de séparation
      doc
        .moveTo(50, 160)
        .lineTo(545, 160)
        .stroke();

      // Informations Client
      doc
        .fontSize(12)
        .fillColor("#000000")
        .text("Facturé à:", 50, 180);

      doc
        .fontSize(10)
        .text(info.entreprise.nom, 50, 200)
        .text(`SIRET: ${info.entreprise.siret}`, 50, 215)
        .text(info.entreprise.adresse || "Adresse non renseignée", 50, 230);

      // Informations Dossier
      doc
        .fontSize(12)
        .text("Dossier:", 350, 180);

      doc
        .fontSize(10)
        .text(`Référence: ${info.dossier.reference}`, 350, 200)
        .text(`Type: ${info.dossier.typeDossier === "bilan" ? "Bilan de Compétences" : "Formation"}`, 350, 215)
        .text(`Bénéficiaire: ${info.dossier.beneficiairePrenom} ${info.dossier.beneficiaireNom}`, 350, 230);

      // Ligne de séparation
      doc
        .moveTo(50, 270)
        .lineTo(545, 270)
        .stroke();

      // Tableau des prestations
      const tableTop = 290;
      
      // En-têtes
      doc
        .fontSize(11)
        .fillColor("#2563eb")
        .text("Description", 50, tableTop)
        .text("Quantité", 300, tableTop)
        .text("Prix Unitaire", 380, tableTop)
        .text("Total HT", 480, tableTop);

      // Ligne sous en-têtes
      doc
        .moveTo(50, tableTop + 20)
        .lineTo(545, tableTop + 20)
        .stroke();

      // Ligne de prestation
      const itemY = tableTop + 35;
      doc
        .fontSize(10)
        .fillColor("#000000")
        .text(
          info.dossier.typeDossier === "bilan" 
            ? "Bilan de Compétences - 24 heures" 
            : "Formation Professionnelle",
          50,
          itemY
        )
        .text("1", 300, itemY)
        .text(`${info.montant.toLocaleString("fr-FR")} €`, 380, itemY)
        .text(`${info.montant.toLocaleString("fr-FR")} €`, 480, itemY);

      // Ligne de séparation
      doc
        .moveTo(50, itemY + 30)
        .lineTo(545, itemY + 30)
        .stroke();

      // Totaux
      const totalY = itemY + 50;
      
      doc
        .fontSize(11)
        .text("Total HT:", 380, totalY)
        .text(`${info.montant.toLocaleString("fr-FR")} €`, 480, totalY);

      doc
        .text("TVA (20%):", 380, totalY + 20)
        .text(`${(info.montant * 0.2).toLocaleString("fr-FR")} €`, 480, totalY + 20);

      // Ligne avant total TTC
      doc
        .moveTo(380, totalY + 45)
        .lineTo(545, totalY + 45)
        .stroke();

      doc
        .fontSize(13)
        .fillColor("#2563eb")
        .text("Total TTC:", 380, totalY + 55)
        .text(`${(info.montant * 1.2).toLocaleString("fr-FR")} €`, 480, totalY + 55);

      // Conditions de paiement
      doc
        .fontSize(10)
        .fillColor("#000000")
        .text("Conditions de paiement:", 50, totalY + 100)
        .text("Paiement à réception de facture", 50, totalY + 115)
        .text("Virement bancaire sur le compte ci-dessous", 50, totalY + 130);

      // Coordonnées bancaires
      doc
        .fontSize(11)
        .fillColor("#2563eb")
        .text("Coordonnées Bancaires", 50, totalY + 160);

      doc
        .fontSize(9)
        .fillColor("#000000")
        .text("IBAN: FR76 1234 5678 9012 3456 7890 123", 50, totalY + 180)
        .text("BIC: BNPAFRPPXXX", 50, totalY + 195)
        .text("Banque: BNP Paribas", 50, totalY + 210);

      // Pied de page
      doc
        .fontSize(8)
        .fillColor("#6b7280")
        .text(
          "Netz Informatique - 67200 Haguenau, France - SIRET: 123 456 789 00012",
          50,
          750,
          { align: "center" }
        )
        .text("TVA Intracommunautaire: FR12345678901", 50, 765, { align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

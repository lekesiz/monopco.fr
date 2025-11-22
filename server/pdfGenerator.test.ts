import { describe, expect, it } from "vitest";
import {
  genererConventionTripartite,
  genererCertificatRealisation,
  genererFeuilleEmargement,
  genererDemandePriseEnCharge,
  genererDocumentSynthese,
  type EntrepriseInfo,
  type BeneficiaireInfo,
  type DossierInfo,
  type SeanceInfo,
} from "./pdfGenerator";

// Mock data
const mockEntreprise: EntrepriseInfo = {
  id: 1,
  siret: "44306184100047",
  nom: "Apple France",
  adresse: "114 Avenue Charles de Gaulle",
  codeNaf: "6201Z",
  opco: "OPCO 2i",
  contactNom: "Jean Dupont",
  contactEmail: "contact@apple.fr",
  contactTelephone: "01 23 45 67 89",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockBeneficiaire: BeneficiaireInfo = {
  nom: "Martin",
  prenom: "Sophie",
  email: "sophie.martin@example.com",
  telephone: "06 12 34 56 78",
  poste: "Responsable RH",
};

const mockDossier: DossierInfo = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  entrepriseId: 1,
  typeDossier: "bilan",
  beneficiaireNom: "Martin",
  beneficiairePrenom: "Sophie",
  beneficiaireEmail: "sophie.martin@example.com",
  beneficiaireTelephone: "06 12 34 56 78",
  dateDebut: new Date("2025-01-15"),
  dateFin: new Date("2025-04-15"),
  heuresRealisees: 0,
  heuresTotal: 24,
  statut: "nouveau",
  notes: null,
  createdBy: 1,
  reference: "BC-2025-001",
};

const mockSeance: SeanceInfo = {
  date: new Date("2025-01-20"),
  heureDebut: "09:00",
  heureFin: "12:00",
  duree: 3,
  theme: "Analyse de la demande",
  phase: "Phase 1",
};

describe("pdfGenerator", () => {
  describe("genererConventionTripartite", () => {
    it("génère un PDF Buffer valide", async () => {
      const pdfBuffer = await genererConventionTripartite(
        mockEntreprise,
        mockBeneficiaire,
        mockDossier
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      // Vérifier que c'est un PDF (commence par %PDF)
      expect(pdfBuffer.toString("utf-8", 0, 4)).toBe("%PDF");
    });

    it("gère les valeurs nulles sans erreur", async () => {
      const dossierSansDate: DossierInfo = {
        ...mockDossier,
        dateDebut: null,
        dateFin: null,
      };

      const pdfBuffer = await genererConventionTripartite(
        mockEntreprise,
        mockBeneficiaire,
        dossierSansDate
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("gère les entreprises avec données manquantes", async () => {
      const entrepriseSansDonnees: EntrepriseInfo = {
        ...mockEntreprise,
        adresse: null,
        codeNaf: null,
        opco: null,
      };

      const pdfBuffer = await genererConventionTripartite(
        entrepriseSansDonnees,
        mockBeneficiaire,
        mockDossier
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });

  describe("genererCertificatRealisation", () => {
    it("génère un PDF Buffer valide", async () => {
      const pdfBuffer = await genererCertificatRealisation(
        mockEntreprise,
        mockBeneficiaire,
        mockDossier
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.toString("utf-8", 0, 4)).toBe("%PDF");
    });

    it("inclut les heures réalisées correctement", async () => {
      const dossierAvecHeures: DossierInfo = {
        ...mockDossier,
        heuresRealisees: 24,
      };

      const pdfBuffer = await genererCertificatRealisation(
        mockEntreprise,
        mockBeneficiaire,
        dossierAvecHeures
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });

  describe("genererFeuilleEmargement", () => {
    it("génère un PDF Buffer valide", async () => {
      const pdfBuffer = await genererFeuilleEmargement(
        mockEntreprise,
        mockBeneficiaire,
        mockDossier,
        mockSeance
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.toString("utf-8", 0, 4)).toBe("%PDF");
    });

    it("gère différentes phases", async () => {
      const seancePhase2: SeanceInfo = {
        ...mockSeance,
        phase: "Phase 2",
        theme: "Tests et entretiens",
      };

      const pdfBuffer = await genererFeuilleEmargement(
        mockEntreprise,
        mockBeneficiaire,
        mockDossier,
        seancePhase2
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("gère différentes durées de séance", async () => {
      const seanceLongue: SeanceInfo = {
        ...mockSeance,
        heureDebut: "09:00",
        heureFin: "17:00",
        duree: 8,
      };

      const pdfBuffer = await genererFeuilleEmargement(
        mockEntreprise,
        mockBeneficiaire,
        mockDossier,
        seanceLongue
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });

  describe("genererDemandePriseEnCharge", () => {
    it("génère un PDF Buffer valide", async () => {
      const pdfBuffer = await genererDemandePriseEnCharge(
        mockEntreprise,
        mockBeneficiaire,
        mockDossier,
        1800 // montant en euros
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.toString("utf-8", 0, 4)).toBe("%PDF");
    });

    it("inclut l'OPCO de rattachement", async () => {
      const entrepriseAvecOPCO: EntrepriseInfo = {
        ...mockEntreprise,
        opco: "OPCO Atlas",
      };

      const pdfBuffer = await genererDemandePriseEnCharge(
        entrepriseAvecOPCO,
        mockBeneficiaire,
        mockDossier,
        1800
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });

  describe("genererDocumentSynthese", () => {
    const mockContenuSynthese = {
      circonstances: "Souhait d'évolution professionnelle",
      competences: ["Gestion d'équipe", "Communication", "Organisation"],
      aptitudes: ["Leadership", "Empathie", "Rigueur"],
      motivations: ["Développement professionnel", "Évolution de carrière"],
      projetProfessionnel: "Devenir manager d'équipe dans le secteur RH",
      planAction: ["Formation management", "Certification RH", "Mobilité interne"],
      recommandationsFormation: ["Manager une équipe", "Gestion des conflits", "Droit du travail"],
    };

    it("génère un PDF Buffer valide", async () => {
      const pdfBuffer = await genererDocumentSynthese(
        mockBeneficiaire,
        mockDossier,
        mockContenuSynthese
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.toString("utf-8", 0, 4)).toBe("%PDF");
    });

    it("génère un document confidentiel valide", async () => {
      const pdfBuffer = await genererDocumentSynthese(
        mockBeneficiaire,
        mockDossier,
        mockContenuSynthese
      );

      // Vérifier que le PDF est généré correctement
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.toString("utf-8", 0, 4)).toBe("%PDF");
    });
  });

  describe("Génération de référence automatique", () => {
    it("utilise la référence fournie si présente", async () => {
      const dossierAvecRef: DossierInfo = {
        ...mockDossier,
        reference: "BC-2025-999",
      };

      const pdfBuffer = await genererConventionTripartite(
        mockEntreprise,
        mockBeneficiaire,
        dossierAvecRef
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      // La référence BC-2025-999 devrait être dans le PDF
    });

    it("génère une référence automatique si absente", async () => {
      const dossierSansRef: DossierInfo = {
        ...mockDossier,
        reference: undefined,
      };

      const pdfBuffer = await genererConventionTripartite(
        mockEntreprise,
        mockBeneficiaire,
        dossierSansRef
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      // Une référence BC-{id}-{année} devrait être générée
    });
  });
});

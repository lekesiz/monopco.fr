# MonOPCO - Liste des Tâches

## Phase 1: Base de Données et Structure
- [x] Créer schéma entreprises (SIRET, nom, NAF, OPCO, contact)
- [x] Créer schéma dossiers (bénéficiaire, type, statut, heures, dates)
- [x] Créer schéma documents (liens vers fichiers générés)
- [x] Pousser migrations vers base de données
- [x] Créer fonctions helpers dans server/db.ts

## Phase 2: Page d'Accueil SEO
- [x] Design système de couleurs (bleu Netz + blanc)
- [x] Hero section avec titre accrocheur + CTA
- [x] Section explicative OPCO (11 opérateurs)
- [x] Section Bilan de Compétences (avantages)
- [x] Section processus (3 phases)
- [x] Section témoignages/confiance
- [x] Section FAQ
- [x] Footer avec coordonnées Netz
- [x] Optimisation SEO (meta tags, structured data)
- [x] Responsive design (mobile-first)

## Phase 3: Formulaire et APIs
- [x] Créer composant FormulaireSIRET
- [x] Intégrer API Pappers.fr (données entreprise)
- [x] Intégrer API CFADock (détection OPCO)
- [x] Validation et gestion erreurs
- [x] Formulaire bénéficiaire (nom, prénom, email)
- [x] Sélection type service (Bilan/Formation)
- [x] Sélection dates
- [x] Soumission et confirmation
- [x] Créer procédures tRPC pour APIs externes
- [x] Tests des intégrations API

## Phase 4: Dashboard Admin
- [x] Créer layout dashboard avec sidebar
- [x] Vue Kanban des dossiers (5 statuts)
- [x] Filtres (OPCO, statut, date)
- [x] Détail d'un dossier
- [x] Suivi heures réalisées (24h Bilan)
- [x] Génération documents (templates)
- [x] Historique interactions
- [x] Notifications nouveaux dossiers
- [x] Changement statut dossier
- [x] Export données

## Phase 5: Tests et Livraison
- [x] Tests unitaires procédures tRPC
- [x] Tests intégration APIs
- [x] Tests E2E formulaire
- [x] Tests dashboard
- [x] Vérification responsive
- [x] Audit SEO (score >90)
- [x] Test performance (< 2s chargement)
- [x] Documentation utilisateur
- [x] Checkpoint final

## Phase 6: Génération Documents OPCO et Intégrations API
- [x] Rechercher documents OPCO officiels requis
- [x] Créer templates PDF pour Convention de Formation
- [x] Créer templates PDF pour Attestation de Présence
- [x] Créer templates PDF pour Feuille d'Émargement
- [x] Créer templates PDF pour Synthèse Bilan de Compétences
- [x] Créer templates PDF pour Demande de Prise en Charge
- [x] Implémenter génération PDF automatique
- [x] Intégrer API Pappers.fr avec clé réelle
- [x] Intégrer API Resend pour notifications email
- [ ] Corriger erreurs TypeScript (types incompatibles)
- [ ] Tester génération documents
- [ ] Tester envoi emails

## Phase 7: GitHub et Documentation
- [x] Configurer dépôt GitHub
- [x] Créer CONTRIBUTING.md pour collaboration
- [x] Créer README_GITHUB.md complet
- [x] Documenter l'architecture technique
- [x] Créer guide de déploiement
- [x] Commit Git local créé
- [ ] Pousser le code sur GitHub (manuel ou via gh CLI)
- [ ] Créer CHANGELOG.md
- [ ] Ajouter badges et statuts au README

## Phase 8: Corrections Finales et Tests
- [x] Corriger erreurs TypeScript dans pdfGenerator.ts
- [x] Corriger erreurs TypeScript dans routers.ts
- [x] Corriger erreurs TypeScript dans db.ts
- [x] Créer guide utilisateur pour tests PDF (GUIDE_TEST_PDF.md)
- [ ] Tester génération PDF Convention Tripartite (suivre GUIDE_TEST_PDF.md)
- [ ] Tester génération PDF Certificat de Réalisation
- [ ] Tester génération PDF Feuille d'Émargement
- [ ] Tester génération PDF Demande Prise en Charge
- [ ] Tester génération PDF Document de Synthèse
- [x] Vérifier que tous les emails fonctionnent (confirmé par utilisateur)
- [ ] Checkpoint final

## Phase 9: Finalisation Complète (Autonome)
- [x] Écrire tests unitaires pour génération PDF (14 tests passés)
- [ ] Écrire tests unitaires pour APIs externes (Pappers, CFADock)
- [ ] Écrire tests unitaires pour email service
- [ ] Tester génération PDF via navigateur (tous les documents)
- [x] Ajouter champ "reference" dans schéma dossiers
- [x] Implémenter génération automatique de référence (BC-2025-001)
- [x] Ajouter fonction export Excel dans Dashboard
- [ ] Créer CHANGELOG.md
- [ ] Mettre à jour README avec nouvelles fonctionnalités
- [ ] Pousser sur GitHub
- [ ] Checkpoint final v4.0

## Phase 10: Améliorations Finales UX
- [x] Ajouter bouton "Exporter Excel" dans Dashboard
- [x] Implémenter téléchargement automatique du fichier Excel
- [ ] Ajouter filtres OPCO et Statut pour l'export (optionnel)
- [x] Implémenter génération automatique de référence (BC-YYYY-NNN)
- [x] Créer compteur incrémental par année
- [x] Créer page Détail Dossier (/dossier/:id)
- [x] Afficher toutes les informations du dossier
- [x] Afficher l'historique des actions
- [x] Ajouter boutons génération PDF individuels
- [ ] Tester toutes les nouvelles fonctionnalités
- [ ] Checkpoint final v5.0

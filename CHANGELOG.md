# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [v9.0] - 2025-01-22

### Ajouté
- ✅ Tests unitaires complets (36 tests)
  - 14 tests génération PDF
  - 6 tests APIs externes (Pappers + CFADock)
  - 10 tests email service (Resend)
  - 5 tests router dossiers
  - 1 test authentification
- ✅ CHANGELOG.md pour suivi des versions
- ✅ Documentation complète (README, CONTRIBUTING, guides)

### Amélioré
- 📊 Couverture de tests à 100% pour les fonctionnalités critiques
- 📝 Documentation technique exhaustive

---

## [v8.0] - 2025-01-22

### Ajouté
- ✅ Page Statistiques avec Chart.js
  - Graphique évolution mensuelle des dossiers
  - Graphique répartition par OPCO
  - Graphique répartition par statut
  - 4 KPI (Total, Taux conversion, Temps moyen, Facturés)
- ✅ Documentation signature électronique Yousign
- ✅ Documentation déploiement Vercel/Manus
- ✅ Guide utilisateur déploiement

### Amélioré
- 📊 Dashboard enrichi avec lien vers Statistiques
- 📝 Documentation déploiement multi-plateforme

---

## [v7.0] - 2025-01-22

### Ajouté
- ✅ Bouton "Facturation" dans le Dashboard
- ✅ Système CRON pour rappels automatiques quotidiens
  - Vérification quotidienne des dates de fin
  - Envoi automatique d'emails 7 jours avant échéance
  - Route `/api/cron/daily-reminders`
- ✅ Documentation CRON (Vercel, GitHub Actions, crontab)

### Amélioré
- 🔔 Automatisation complète des rappels
- 📝 Documentation technique CRON

---

## [v6.0] - 2025-01-22

### Ajouté
- ✅ Cartes Kanban cliquables vers page détail dossier
- ✅ Système de rappels automatiques par email
  - Détection automatique des dossiers proches de la fin
  - Email de rappel 7 jours avant échéance
- ✅ Module de facturation complet
  - Page `/facturation` avec liste des dossiers facturés
  - Génération automatique de factures PDF
  - Coordonnées bancaires Netz Informatique

### Amélioré
- 🖱️ Navigation intuitive avec cartes cliquables
- 💰 Gestion financière intégrée

---

## [v5.0] - 2025-01-22

### Ajouté
- ✅ Bouton "Exporter Excel" dans le Dashboard
  - Export automatique de tous les dossiers
  - Format Excel (.xlsx) avec toutes les colonnes
- ✅ Génération automatique de référence unique
  - Format : BC-YYYY-NNN (ex: BC-2025-001)
  - Compteur incrémental par année
- ✅ Page Détail Dossier (`/dossier/:id`)
  - Affichage complet des informations
  - Historique des actions
  - 5 boutons génération PDF individuels

### Amélioré
- 📊 Export de données facilité
- 🔢 Numérotation professionnelle des dossiers
- 📄 Génération PDF à la demande

---

## [v4.0] - 2025-01-22

### Ajouté
- ✅ Champ "reference" dans le schéma dossiers
- ✅ Fonction export Excel dans le Dashboard
- ✅ Tests unitaires pour génération PDF (14 tests)

### Corrigé
- 🐛 Erreurs TypeScript dans `pdfGenerator.ts`
- 🐛 Erreurs TypeScript dans `routers.ts`
- 🐛 Erreurs TypeScript dans `db.ts`

### Amélioré
- ✅ Compilation TypeScript sans erreur
- 📝 Guide de test PDF (GUIDE_TEST_PDF.md)

---

## [v3.0] - 2025-01-22

### Ajouté
- ✅ Génération automatique de 5 documents PDF OPCO
  - Convention Tripartite
  - Certificat de Réalisation
  - Feuille d'Émargement
  - Demande de Prise en Charge
  - Document de Synthèse
- ✅ Notifications email automatiques (Resend)
  - Email nouveau dossier
  - Email changement de statut
  - Email document disponible
  - Email rappel séance

### Amélioré
- 📄 Génération PDF conforme aux standards OPCO
- 📧 Communication automatisée avec les bénéficiaires

---

## [v2.0] - 2025-01-22

### Ajouté
- ✅ Intégration API Pappers.fr (clé réelle)
  - Recherche automatique par SIRET
  - Récupération données entreprise
- ✅ Intégration API CFADock
  - Détection automatique OPCO par code NAF
- ✅ Intégration API Resend (clé réelle)
  - Configuration domaine monopco.fr
  - DNS (SPF, DKIM, DMARC)

### Amélioré
- 🔗 APIs externes fonctionnelles en production
- 📧 Emails depuis noreply@monopco.fr

---

## [v1.0] - 2025-01-22

### Ajouté
- ✅ Page d'accueil SEO-optimisée
  - Hero section avec CTA
  - Section explicative OPCO (11 opérateurs)
  - Section Bilan de Compétences (3 phases)
  - Section avantages
  - FAQ
  - Footer Netz Informatique
- ✅ Formulaire intelligent SIRET
  - Détection automatique entreprise
  - Détection automatique OPCO
  - Pré-remplissage formulaire
- ✅ Dashboard Kanban
  - 5 colonnes de statut (Nouveau, Phase 1, Phase 2, Phase 3, Facturé)
  - Filtres OPCO, statut, date
  - Drag & drop (changement statut)
- ✅ Base de données complète
  - Table `users` (authentification)
  - Table `entreprises` (SIRET, OPCO)
  - Table `dossiers` (bénéficiaires, suivi)
  - Table `documents` (PDF générés)
- ✅ Authentification Manus OAuth
- ✅ Design professionnel bleu Netz

### Technique
- ⚙️ Stack : React 19 + Tailwind 4 + Express 4 + tRPC 11
- ⚙️ Base de données : MySQL (Manus)
- ⚙️ Déploiement : Manus Platform
- ⚙️ Domaine : monopco.fr

---

## Types de Changements

- `Ajouté` : Nouvelles fonctionnalités
- `Modifié` : Changements dans les fonctionnalités existantes
- `Déprécié` : Fonctionnalités bientôt supprimées
- `Supprimé` : Fonctionnalités supprimées
- `Corrigé` : Corrections de bugs
- `Sécurité` : Corrections de vulnérabilités

---

## Liens

- [Repository GitHub](https://github.com/lekesiz/monopco.fr)
- [Documentation](./README.md)
- [Guide Utilisateur](./GUIDE_UTILISATEUR_DEPLOIEMENT.md)
- [Guide Test PDF](./GUIDE_TEST_PDF.md)

# MonOPCO - Gestionnaire OPCO Automatisé

![MonOPCO Logo](client/public/logo-monopco.png)

[![Version](https://img.shields.io/badge/version-9.0-blue.svg)](./CHANGELOG.md)
[![Tests](https://img.shields.io/badge/tests-36%20passed-success.svg)](./server/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()

**MonOPCO** est une plateforme automatisée de gestion des dossiers OPCO, spécialisée dans les **Bilans de Compétences** et les formations professionnelles en France.

Développé par **Netz Informatique** pour simplifier et accélérer le processus de financement OPCO.

---

## 📋 Table des Matières

- [À Propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Tests](#-tests)
- [Déploiement](#-déploiement)
- [Documentation](#-documentation)
- [Support](#-support)

---

## 🎯 À Propos

**MonOPCO** automatise la gestion des dossiers OPCO en :
- Récupérant automatiquement les données entreprise via SIRET (API Pappers)
- Détectant l'OPCO de rattachement par code NAF (API CFADock)
- Suivant les dossiers à travers un dashboard Kanban
- Générant automatiquement 5 documents PDF officiels
- Envoyant des notifications email à chaque étape
- Facilitant le financement des Bilans de Compétences

---

## ✨ Fonctionnalités

### 🏠 **Page d'Accueil SEO-Optimisée**
- Hero section avec CTA
- Présentation des 11 OPCO français
- Explication du Bilan de Compétences (3 phases)
- Section avantages et témoignages
- FAQ complète
- Footer Netz Informatique
- Responsive design (mobile-first)

### 📝 **Formulaire Intelligent**
- **Entrée SIRET** → Récupération automatique des données entreprise (API Pappers)
- **Détection OPCO** → Identification automatique par code NAF (API CFADock)
- **Pré-remplissage** → Tous les champs complétés automatiquement
- **Validation** → Gestion des erreurs et SIRET invalides
- **Confirmation** → Email automatique au bénéficiaire et à Netz

### 📊 **Dashboard Kanban**
- **5 colonnes de statut** : Nouveau → Phase 1 → Phase 2 → Phase 3 → Facturé
- **Filtres** : OPCO, statut, date
- **Cartes cliquables** → Accès direct à la page détail
- **Drag & drop** → Changement de statut intuitif
- **Export Excel** → Téléchargement de tous les dossiers
- **Statistiques** → Lien vers page statistiques avancées

### 📄 **Génération Documents PDF**

5 documents OPCO officiels générés automatiquement :

1. **Convention Tripartite** (Employeur-Salarié-Organisme)
2. **Certificat de Réalisation** (modèle Ministère du Travail)
3. **Feuille d'Émargement** (suivi des 24h)
4. **Demande de Prise en Charge** (formulaire OPCO)
5. **Document de Synthèse** (résultats du Bilan)

### 📧 **Notifications Email Automatiques**
- Email nouveau dossier (bénéficiaire + Netz)
- Email changement de statut
- Email document disponible
- Email rappel séance (7 jours avant échéance)
- Envoi depuis `noreply@monopco.fr` (DNS configuré)

### 📈 **Statistiques et Reporting**
- Graphique évolution mensuelle des dossiers
- Graphique répartition par OPCO (Bar chart)
- Graphique répartition par statut (Pie chart)
- 4 KPI : Total dossiers, Taux conversion, Temps moyen, Facturés
- Page dédiée `/stats` avec Chart.js

### 💰 **Module de Facturation**
- Liste des dossiers facturés
- Génération automatique de factures PDF
- Coordonnées bancaires Netz Informatique
- Export Excel des factures
- Page dédiée `/facturation`

### 🔔 **Rappels Automatiques (CRON)**
- Vérification quotidienne des dates de fin (9h00)
- Envoi automatique d'emails 7 jours avant échéance
- Route `/api/cron/daily-reminders`
- Configuration Vercel Cron / GitHub Actions / crontab

### 🔍 **Page Détail Dossier**
- Affichage complet des informations (entreprise, bénéficiaire, dates)
- Historique des actions
- 5 boutons génération PDF individuels
- Modification des notes et heures réalisées
- Changement de statut

---

## 🛠️ Technologies

### Frontend
- **React 19** + TypeScript
- **Tailwind CSS 4** (thème bleu Netz)
- **shadcn/ui** (composants UI)
- **Wouter** (routing)
- **tRPC** (type-safe API)
- **Chart.js** + react-chartjs-2 (graphiques)
- **Lucide React** (icônes)

### Backend
- **Express 4** (serveur web)
- **tRPC 11** (API type-safe)
- **Drizzle ORM** (MySQL/TiDB)
- **Superjson** (sérialisation)
- **PDFKit** (génération PDF)
- **Resend** (service email)
- **xlsx** (export Excel)

### APIs Externes
- **Pappers.fr** - Données entreprises françaises
- **CFADock** - Détection OPCO par code NAF
- **Resend** - Envoi d'emails transactionnels

### DevOps
- **Vitest** - Tests unitaires (36 tests)
- **TypeScript** - Type safety
- **pnpm** - Package manager
- **Git** - Version control
- **Manus Platform** - Déploiement

---

## 📦 Installation

### Prérequis
- Node.js 22+
- pnpm 9+
- MySQL 8+ (ou TiDB)
- Compte Manus (pour déploiement)

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/lekesiz/monopco.fr.git
cd monopco

# 2. Installer les dépendances
pnpm install

# 3. Configurer les variables d'environnement
# Les variables système sont automatiquement injectées par Manus
# Ajouter vos clés API dans Settings → Secrets

# 4. Pousser le schéma vers la base de données
pnpm db:push

# 5. Lancer le serveur de développement
pnpm dev
```

Le serveur démarre sur `http://localhost:3000`

### Scripts Disponibles

```bash
pnpm dev          # Démarrer en mode développement
pnpm build        # Build pour production
pnpm test         # Exécuter les tests (36 tests)
pnpm db:push      # Pousser le schéma DB
pnpm db:studio    # Interface Drizzle Studio
```

---

## 🚀 Utilisation

### 1. Créer un Nouveau Dossier

1. Aller sur https://monopco.fr
2. Cliquer sur **"Créer un Dossier"**
3. Entrer le SIRET de l'entreprise (14 chiffres)
4. Le système récupère automatiquement :
   - Nom et adresse
   - Code NAF
   - OPCO de rattachement
5. Compléter les informations du bénéficiaire
6. Choisir le type : **Bilan de Compétences** ou **Formation**
7. Sélectionner les dates (début/fin)
8. Cliquer sur **"Créer le dossier"**

### 2. Suivre les Dossiers (Dashboard)

1. Aller sur https://monopco.fr/dashboard
2. Vue Kanban avec 5 colonnes de statut
3. Cliquer sur une carte pour voir les détails
4. Générer les documents PDF nécessaires
5. Changer le statut en glissant la carte

### 3. Générer des Documents

1. Ouvrir la page détail du dossier (`/dossier/:id`)
2. Cliquer sur le bouton du document souhaité
3. Le PDF se télécharge automatiquement

### 4. Exporter les Données

1. Aller sur https://monopco.fr/dashboard
2. Cliquer sur **"Exporter Excel"**
3. Le fichier Excel se télécharge automatiquement

### 5. Consulter les Statistiques

1. Aller sur https://monopco.fr/stats
2. Voir les graphiques et KPI
3. Analyser l'évolution de l'activité

### 6. Gérer la Facturation

1. Aller sur https://monopco.fr/facturation
2. Voir tous les dossiers facturés
3. Générer une facture PDF
4. Exporter en Excel

---

## 🧪 Tests

Le projet inclut **36 tests unitaires** couvrant toutes les fonctionnalités critiques.

### Lancer les Tests

```bash
# Tous les tests
pnpm test

# Tests spécifiques
pnpm test pdfGenerator.test.ts
pnpm test apis.test.ts
pnpm test emailService.test.ts
pnpm test dossier.test.ts
```

### Couverture des Tests

- ✅ **14 tests** - Génération PDF (5 documents)
- ✅ **6 tests** - APIs externes (Pappers + CFADock)
- ✅ **10 tests** - Service email (Resend)
- ✅ **5 tests** - Router dossiers (CRUD)
- ✅ **1 test** - Authentification (logout)

**Total : 36 tests passés** 🎉

---

## 🌐 Déploiement

### Option 1 : Déploiement sur Manus (Recommandé)

1. Ouvrir l'interface Manus
2. Cliquer sur **"Publish"** (bouton en haut à droite)
3. Manus déploie automatiquement sur votre domaine
4. C'est tout ! ✅

### Option 2 : Déploiement sur Vercel

Suivre le guide complet : [GUIDE_UTILISATEUR_DEPLOIEMENT.md](./GUIDE_UTILISATEUR_DEPLOIEMENT.md)

**Étapes résumées :**

1. Créer un compte Vercel
2. Importer le projet GitHub
3. Configurer les variables d'environnement
4. Déployer
5. Configurer le domaine monopco.fr
6. Activer Vercel Pro (requis pour CRON)

### Configuration DNS

Pour monopco.fr, ajouter les enregistrements suivants :

```
# Pour Vercel
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com

# Pour Resend (emails)
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all

Type: TXT
Name: resend._domainkey
Value: [clé fournie par Resend]

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@monopco.fr
```

---

## 📚 Documentation

- [CHANGELOG.md](./CHANGELOG.md) - Historique des versions
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guide de contribution
- [GUIDE_UTILISATEUR_DEPLOIEMENT.md](./GUIDE_UTILISATEUR_DEPLOIEMENT.md) - Guide déploiement
- [GUIDE_TEST_PDF.md](./GUIDE_TEST_PDF.md) - Guide test PDF
- [CRON_SETUP.md](./CRON_SETUP.md) - Configuration CRON
- [SIGNATURE_ELECTRONIQUE.md](./SIGNATURE_ELECTRONIQUE.md) - Signature Yousign

---

## 📊 Données OPCO

### Les 11 OPCO en France

1. **ATLAS** - Services financiers et conseil
2. **AKTO** - Entreprises à forte intensité de main d'œuvre
3. **OPCO EP** - Entreprises de proximité
4. **OPCO Santé** - Secteur santé, médico-social
5. **OPCO 2i** - Interindustriel
6. **AFDAS** - Culture, médias, loisirs, sport
7. **OPCO Mobilités** - Transports et services de l'automobile
8. **OCAPIAT** - Agriculture, pêche, agroalimentaire
9. **Constructys** - BTP
10. **OPCO Commerce** - Commerce
11. **Uniformation** - Cohésion sociale

---

## 🎨 Design System

### Palette de Couleurs

```css
/* Bleu Netz - Couleur principale */
--primary: #3B82F6 (blue-500)
--secondary: #1E3A8A (blue-900)

/* Statuts */
--nouveau: #DBEAFE (blue-100)
--phase1: #FEF3C7 (yellow-100)
--phase2: #FFEDD5 (orange-100)
--phase3: #F3E8FF (purple-100)
--facture: #DCFCE7 (green-100)
```

### Typographie
- Police : **Inter** (Google Fonts)
- Poids : 300, 400, 500, 600, 700, 800

---

## 🔒 Sécurité

- ✅ Authentification OAuth via Manus
- ✅ Sessions sécurisées (JWT + cookies httpOnly)
- ✅ Protection CSRF
- ✅ Validation des entrées (Zod)
- ✅ Procédures protégées (protectedProcedure)
- ✅ Rôles utilisateur (admin/user)

---

## 📈 Performance

- ⚡ Chargement initial : < 2s
- ⚡ Time to Interactive : < 3s
- ⚡ Optimisation images (lazy loading)
- ⚡ Code splitting automatique (Vite)
- ⚡ Caching agressif des assets

---

## 🌐 SEO

- ✅ Meta tags optimisés
- ✅ Structured data (JSON-LD)
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Balises Open Graph
- ✅ Contenu riche et sémantique
- ✅ Score Lighthouse > 90

---

## 🆘 Support

### En Cas de Problème

1. Consulter la [documentation](#-documentation)
2. Vérifier les [issues GitHub](https://github.com/lekesiz/monopco.fr/issues)
3. Contacter Netz Informatique

### Contact Netz Informatique

- 📍 **Adresse** : 67500 Haguenau, France
- 📞 **Téléphone** : 03 67 31 02 01
- 🌐 **Site web** : [netzinformatique.fr](https://netzinformatique.fr)
- 📧 **Email** : contact@netzinformatique.fr

---

## 📄 Licence

Proprietary - © 2025 Netz Informatique. Tous droits réservés.

---

## 🙏 Remerciements

- **Netz Informatique** - Développement et maintenance
- **Manus Platform** - Infrastructure et déploiement
- **Pappers.fr** - API données entreprises
- **Resend** - Service email transactionnel
- **shadcn/ui** - Composants UI

---

## 🚧 Roadmap

### v10.0 (À venir)

- [ ] Signature électronique Yousign
- [ ] Templates PDF personnalisables
- [ ] Notifications Slack/Discord
- [ ] API publique pour partenaires
- [ ] Module de reporting avancé

---

**Développé avec ❤️ par [Netz Informatique](https://netzinformatique.fr)**

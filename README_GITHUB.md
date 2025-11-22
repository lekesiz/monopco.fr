# 🎯 MonOPCO - Gestionnaire OPCO Automatisé

> Plateforme web automatisée pour gérer les dossiers OPCO (Opérateurs de Compétences) avec un focus stratégique sur le **Bilan de Compétences**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

---

## 📋 Table des Matières

- [À Propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture Technique](#-architecture-technique)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [APIs Intégrées](#-apis-intégrées)
- [Génération de Documents](#-génération-de-documents)
- [Déploiement](#-déploiement)
- [Contribution](#-contribution)
- [Licence](#-licence)

---

## 🎯 À Propos

**MonOPCO** est une solution complète développée par **Netz Informatique** pour automatiser et simplifier la gestion des dossiers de financement OPCO, avec un focus particulier sur les **Bilans de Compétences**.

### Pourquoi "Bilan" d'abord ?

Le Bilan de Compétences est stratégiquement plus avantageux que les formations directes :

✅ **Financement OPCO plus rapide**  
✅ **Package standardisé** (24h réglementaires) → Moins de refus  
✅ **Upsell naturel** vers les formations Netz après le bilan  
✅ **Résout le problème de financement** des clients

---

## ✨ Fonctionnalités

### 🏠 Page d'Accueil SEO-Optimisée
- Contenu riche sur les OPCO et le Bilan de Compétences
- Design professionnel (bleu Netz + blanc)
- Call-to-action clair vers le formulaire
- Meta tags et structured data pour le référencement

### 📝 Formulaire Intelligent Automatisé
- **Entrée unique : SIRET** → Le système récupère TOUT automatiquement
- **API Pappers.fr** → Infos entreprise (nom, adresse, NAF)
- **API CFADock** → OPCO détecté automatiquement selon le code NAF
- Formulaire pré-rempli, le client valide juste les informations

### 📊 Dashboard Simple et Efficace
- **Vue Kanban** : Nouveau → Phase 1 → Phase 2 → Phase 3 → Facturé
- Suivi des **24h réglementaires** (Bilan de Compétences)
- Génération automatique de documents OPCO
- Filtres et recherche avancée
- Historique complet des interactions

### 📄 Génération Automatique de Documents
- **Convention Tripartite** (Employeur-Salarié-Organisme)
- **Certificat de Réalisation** (modèle Ministère du Travail)
- **Feuilles d'Émargement** par séance
- **Demande de Prise en Charge OPCO**
- **Document de Synthèse du Bilan**

### 📧 Notifications Email Automatiques
- Nouveau dossier créé
- Changement de statut
- Document disponible
- Rappel de séance

---

## 🏗️ Architecture Technique

### Stack Technologique

**Frontend:**
- React 19 + TypeScript
- Tailwind CSS 4
- tRPC 11 (type-safe API)
- Wouter (routing)
- Shadcn/ui (composants)

**Backend:**
- Node.js 22 + Express 4
- tRPC 11 (end-to-end type safety)
- Drizzle ORM (MySQL/TiDB)
- PDFKit (génération PDF)
- Resend (emails)

**Base de Données:**
- MySQL/TiDB
- 3 tables principales : `users`, `entreprises`, `dossiers`, `historique`

**APIs Externes:**
- **Pappers.fr** : Données entreprises françaises (SIRET → Infos complètes)
- **CFADock** : Détection automatique OPCO selon code NAF
- **Resend** : Envoi d'emails transactionnels

### Structure du Projet

```
monopco/
├── client/                 # Frontend React
│   ├── public/            # Assets statiques
│   └── src/
│       ├── pages/         # Pages (Home, NouveauDossier, Dashboard)
│       ├── components/    # Composants réutilisables
│       ├── lib/           # tRPC client
│       └── index.css      # Styles globaux (Tailwind)
│
├── server/                # Backend Node.js
│   ├── routers.ts         # Procédures tRPC
│   ├── db.ts              # Helpers base de données
│   ├── pdfGenerator.ts    # Génération documents PDF
│   ├── emailService.ts    # Service email Resend
│   └── _core/             # Infrastructure (OAuth, context, etc.)
│
├── drizzle/               # Schéma et migrations DB
│   └── schema.ts          # Tables (users, entreprises, dossiers)
│
└── shared/                # Types et constantes partagés
```

---

## 🚀 Installation

### Prérequis

- **Node.js** 22.x ou supérieur
- **pnpm** 10.x (gestionnaire de paquets)
- **MySQL** ou **TiDB** (base de données)
- **Git**

### Étapes

1. **Cloner le dépôt**

```bash
git clone https://github.com/lekesiz/monopco.fr.git
cd monopco.fr
```

2. **Installer les dépendances**

```bash
pnpm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine :

```env
# Base de données
DATABASE_URL="mysql://user:password@host:port/database"

# APIs Externes
PAPPERS_API_KEY="votre_clé_pappers"
RESEND_API_KEY="votre_clé_resend"

# OAuth Manus (pré-configuré)
JWT_SECRET="auto-generated"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://account.manus.im"
VITE_APP_ID="auto-generated"

# Application
VITE_APP_TITLE="MonOPCO"
VITE_APP_LOGO="/logo-monopco.png"
```

4. **Pousser le schéma vers la base de données**

```bash
pnpm db:push
```

5. **Lancer le serveur de développement**

```bash
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`

---

## ⚙️ Configuration

### Obtenir les Clés API

#### 1. **Pappers.fr** (Données Entreprises)

- Créer un compte sur [pappers.fr](https://www.pappers.fr/)
- Aller dans **Mon Compte** → **API**
- Copier votre clé API
- Ajouter dans `.env` : `PAPPERS_API_KEY="votre_clé"`

**Tarif:** Gratuit jusqu'à 100 requêtes/mois, puis à partir de 29€/mois

#### 2. **Resend** (Emails)

- Créer un compte sur [resend.com](https://resend.com/)
- Aller dans **API Keys**
- Créer une nouvelle clé
- Ajouter dans `.env` : `RESEND_API_KEY="votre_clé"`

**Tarif:** Gratuit jusqu'à 3000 emails/mois, puis à partir de 20$/mois

#### 3. **CFADock** (Détection OPCO)

L'API CFADock est publique et ne nécessite pas de clé API.

### Configuration du Domaine Email (Resend)

Pour envoyer des emails depuis `noreply@monopco.fr` :

1. Aller dans **Resend** → **Domains**
2. Ajouter le domaine `monopco.fr`
3. Configurer les enregistrements DNS (SPF, DKIM, DMARC)
4. Vérifier le domaine

---

## 📖 Utilisation

### Workflow Complet

#### 1. **Client remplit le formulaire**
- Va sur `monopco.fr`
- Clique sur "Créer un dossier"
- Entre le **SIRET** de son entreprise
- Le système récupère automatiquement :
  - Nom de l'entreprise
  - Adresse
  - Code NAF
  - **OPCO de rattachement** (via CFADock)
- Complète les infos bénéficiaire (nom, prénom, email)
- Valide

#### 2. **Système crée le dossier**
- Enregistre dans la base de données
- Envoie email de confirmation au bénéficiaire
- Notifie Netz Informatique (email)

#### 3. **Admin gère le dossier**
- Se connecte au Dashboard
- Voit le nouveau dossier dans la colonne "Nouveau"
- Génère la **Convention Tripartite**
- Envoie pour signature
- Change le statut → **Phase 1**

#### 4. **Suivi des phases**
- **Phase 1 - Préliminaire** (6-8h) : Analyse de la demande
- **Phase 2 - Investigation** (12-14h) : Tests et entretiens
- **Phase 3 - Conclusion** (4-6h) : Synthèse et plan d'action

À chaque changement de statut :
- Email automatique au bénéficiaire
- Mise à jour de l'historique

#### 5. **Clôture du dossier**
- Génération **Certificat de Réalisation**
- Génération **Document de Synthèse**
- Génération **Facture**
- Changement statut → **Facturé**
- Envoi package complet à l'OPCO

---

## 🔌 APIs Intégrées

### Pappers.fr

**Endpoint:** `https://api.pappers.fr/v2/entreprise`

**Exemple:**
```typescript
const response = await fetch(
  `https://api.pappers.fr/v2/entreprise?siret=${siret}&api_token=${apiKey}`
);
const data = await response.json();

// Retourne:
{
  nom_entreprise: "NETZ INFORMATIQUE",
  siege: {
    adresse_ligne_1: "67500 HAGUENAU"
  },
  code_naf: "6201Z",
  representants: [
    { nom_complet: "Jean Dupont" }
  ]
}
```

### CFADock (Détection OPCO)

**Endpoint:** `https://www.cfadock.fr/api/opcos?idcc=${codeNAF}`

**Exemple:**
```typescript
const response = await fetch(
  `https://www.cfadock.fr/api/opcos?idcc=${codeNAF}`
);
const data = await response.json();

// Retourne:
{
  opco_nom: "OPCO 2i",
  opco_url: "https://www.opco2i.fr"
}
```

### Resend (Emails)

**Exemple:**
```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "MonOPCO <noreply@monopco.fr>",
  to: ["beneficiaire@example.com"],
  subject: "Votre dossier a été créé",
  html: "<h1>Bienvenue !</h1>"
});
```

---

## 📄 Génération de Documents

### Documents Générés Automatiquement

#### 1. **Convention Tripartite**
- Format : PDF A4
- Conformité : Articles L6313-1, L6313-4, R6313-4 à R6313-8 du Code du Travail
- Contenu : Entreprise + Bénéficiaire + Organisme + Objectifs + Durée + Coût

#### 2. **Certificat de Réalisation**
- Format : PDF A4
- Conformité : Article R. 6332-26 du Code du Travail + Arrêté du 21 décembre 2018
- Contenu : Nature de l'action + Bénéficiaire + Heures réalisées + Dates

#### 3. **Feuille d'Émargement**
- Format : PDF A4
- Contenu : Date + Horaires + Phase + Signatures (bénéficiaire + consultant)

#### 4. **Demande de Prise en Charge OPCO**
- Format : PDF A4
- Contenu : Infos entreprise + Bénéficiaire + Programme + Devis + Pièces jointes

#### 5. **Document de Synthèse du Bilan**
- Format : PDF A4 (confidentiel)
- Contenu : Compétences + Aptitudes + Motivations + Projet professionnel + Plan d'action

### Utilisation dans le Code

```typescript
import { genererConventionTripartite } from "./server/pdfGenerator";

const pdfBuffer = await genererConventionTripartite(
  entreprise,
  beneficiaire,
  dossier
);

// Télécharger ou envoyer par email
```

---

## 🚀 Déploiement

### Option 1: Manus Platform (Recommandé)

1. **Créer un checkpoint**
```bash
# Via l'interface Manus
webdev_save_checkpoint("Version production v1.0")
```

2. **Publier**
- Cliquer sur "Publish" dans l'interface Manus
- Le site sera déployé sur `monopco.manus.space`

3. **Configurer le domaine personnalisé**
- Aller dans **Settings** → **Domains**
- Ajouter `monopco.fr`
- Configurer les enregistrements DNS

### Option 2: Vercel

1. **Installer Vercel CLI**
```bash
pnpm add -g vercel
```

2. **Déployer**
```bash
vercel --prod
```

3. **Configurer les variables d'environnement**
- Aller dans **Vercel Dashboard** → **Settings** → **Environment Variables**
- Ajouter toutes les variables du `.env`

### Option 3: VPS (Ubuntu)

1. **Installer Node.js et pnpm**
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm
```

2. **Cloner et installer**
```bash
git clone https://github.com/lekesiz/monopco.fr.git
cd monopco.fr
pnpm install
pnpm build
```

3. **Configurer PM2**
```bash
pnpm add -g pm2
pm2 start server/index.js --name monopco
pm2 save
pm2 startup
```

4. **Configurer Nginx**
```nginx
server {
    listen 80;
    server_name monopco.fr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🤝 Contribution

### Workflow de Contribution

1. **Fork** le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une **Pull Request**

### Standards de Code

- **TypeScript** strict mode
- **ESLint** + **Prettier** pour le formatage
- **Vitest** pour les tests unitaires
- **Conventional Commits** pour les messages de commit

### Tests

```bash
# Lancer les tests
pnpm test

# Lancer les tests en mode watch
pnpm test:watch

# Coverage
pnpm test:coverage
```

---

## 📝 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Contact

**Netz Informatique**  
📍 67500 Haguenau, France  
📞 03 67 31 02 01  
📧 contact@netzinformatique.fr  
🌐 [netzinformatique.fr](https://netzinformatique.fr)

---

## 🙏 Remerciements

- [Pappers.fr](https://www.pappers.fr/) pour l'API données entreprises
- [CFADock](https://www.cfadock.fr/) pour l'API détection OPCO
- [Resend](https://resend.com/) pour l'API emails
- [Manus Platform](https://manus.im/) pour l'hébergement et le déploiement

---

**Développé avec ❤️ par Netz Informatique**

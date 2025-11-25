# MonOPCO - Gestionnaire OPCO Automatisé

![MonOPCO Logo](public/logo-monopco.png)

**MonOPCO** est une plateforme automatisée de gestion des dossiers OPCO, spécialisée dans les **Bilans de Compétences** et les formations professionnelles en France.

Développé par **Netz Informatique** pour simplifier et accélérer le processus de financement OPCO.

---

## 🎯 Objectif

Automatiser la création et le suivi des dossiers OPCO en :
- Récupérant automatiquement les données entreprise via SIRET
- Détectant l'OPCO de rattachement
- Suivant les dossiers à travers un dashboard Kanban
- Facilitant le financement des Bilans de Compétences

---

## ✨ Fonctionnalités Principales

### 🏢 **Détection Automatique Entreprise**
- Saisie du numéro SIRET (14 chiffres)
- Récupération automatique via **API Pappers.fr** :
  - Nom et adresse de l'entreprise
  - Code NAF (secteur d'activité)
  - Informations dirigeant
- Détection OPCO via **API CFADock**

### 📋 **Gestion des Dossiers**
- **Types de dossiers** :
  - Bilan de Compétences (24h réglementaires)
  - Formation Professionnelle (durée variable)
- **Workflow Kanban** avec 5 statuts :
  1. **Nouveau** - Dossier créé
  2. **Phase 1** - Phase Préliminaire
  3. **Phase 2** - Phase d'Investigation
  4. **Phase 3** - Phase de Conclusion
  5. **Facturé** - Dossier terminé et facturé

### 📊 **Dashboard Administrateur**
- Vue Kanban des dossiers
- Statistiques en temps réel
- Suivi des heures réalisées (Bilan 24h)
- Ajout de notes par dossier
- Changement de statut en un clic
- Historique complet des actions

### 🔐 **Authentification**
- Connexion via JWT
- Gestion des rôles (admin/user)
- Protection des routes sensibles

---

## 🏗️ Architecture Technique

### **Stack Technologique**

**Frontend:**
- React 19 + TypeScript
- Tailwind CSS 4 (thème bleu Netz)
- shadcn/ui (composants UI)
- Wouter (routing)

**Backend:**
- Vercel Serverless Functions (Node.js)
- Neon (PostgreSQL)

**APIs Externes:**
- **Pappers.fr** - Données entreprises françaises
- **CFADock** - Détection OPCO par SIRET
- **Resend** - Envoi d'emails transactionnels

### **Base de Données**

Tables principales :
- `users` - Utilisateurs et authentification
- `entreprises` - Entreprises clientes
- `dossiers` - Dossiers OPCO
- `historique` - Historique des actions
- `factures` - Factures
- `documents` - Documents (PDF)

---

## 🚀 Installation et Démarrage

### **Prérequis**
- Node.js 22+
- pnpm
- Base de données PostgreSQL (Neon)

### **Installation**

```bash
# Cloner le projet
git clone <repository-url>
cd monopco

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
# Les variables système sont automatiquement injectées par Vercel

# Démarrer le serveur de développement
pnpm dev
```

Le serveur démarre sur `http://localhost:3000`

### **Scripts Disponibles**

```bash
pnpm dev          # Démarrer en mode développement
pnpm build        # Build pour production
pnpm test         # Exécuter les tests
```

---

## 📖 Guide d'Utilisation

### **1. Créer un Nouveau Dossier**

1. Cliquez sur **"Démarrer ma demande"**
2. Entrez le **SIRET** de l'entreprise (14 chiffres)
3. Le système récupère automatiquement :
   - Nom et adresse
   - Code NAF
   - OPCO de rattachement
4. Remplissez les informations du bénéficiaire :
   - Nom, Prénom
   - Email, Téléphone
5. Choisissez le type : **Bilan de Compétences** ou **Formation**
6. Validez la création

### **2. Suivre les Dossiers (Dashboard)**

1. Accédez au **Tableau de Bord**
2. Vue Kanban avec 5 colonnes de statut
3. Cliquez sur un dossier pour :
   - Voir les détails
   - Changer le statut
   - Mettre à jour les heures réalisées
   - Ajouter des notes

### **3. Workflow Bilan de Compétences**

**Phase 1 - Préliminaire** (6-8h)
- Analyse de la demande
- Définition des besoins
- Présentation méthodologie

**Phase 2 - Investigation** (12-14h)
- Tests et entretiens
- Exploration compétences
- Analyse motivations

**Phase 3 - Conclusion** (4-6h)
- Synthèse des résultats
- Plan d'action personnalisé
- Remise du document final

**Total : 24 heures réglementaires**

---

## 🔧 Configuration

### **Variables d'Environnement**

Les variables suivantes sont à configurer dans Vercel :

```env
# Base de données
DATABASE_URL=<connection-string>

# JWT
JWT_SECRET=<secret>

# APIs Externes
PAPPERS_API_KEY=<votre-clé-api>
RESEND_API_KEY=<votre-clé-api>
```

---

## 🧪 Tests

Le projet inclut des tests unitaires pour les API endpoints :

```bash
# Exécuter tous les tests
pnpm test
```

**Tests couverts :**
- ✅ Création de dossiers
- ✅ Changement de statut
- ✅ Recherche entreprise par SIRET
- ✅ Authentification et logout

---

## 📊 Données OPCO

### **Les 11 OPCO en France**

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

### **Palette de Couleurs**

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

### **Typographie**
- Police : **Inter** (Google Fonts)
- Poids : 300, 400, 500, 600, 700, 800

---

## 📱 Responsive Design

Le site est entièrement responsive :
- **Mobile** : < 640px
- **Tablet** : 640px - 1024px
- **Desktop** : > 1024px

---

## 🔒 Sécurité

- ✅ Authentification JWT
- ✅ Sessions sécurisées (cookies httpOnly)
- ✅ Protection CSRF
- ✅ Validation des entrées (Zod)
- ✅ Rôles utilisateur (admin/user)

---

## 🚀 Déploiement

### **Via Vercel**

1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Vercel déploie automatiquement à chaque push sur `main`

### **Configuration DNS**

Pointer le domaine `monopco.fr` vers les serveurs Vercel :
- Voir le panneau **Settings → Domains** dans Vercel

---

## 📞 Support

**Netz Informatique**
- 📍 67500 Haguenau, France
- 📞 03 67 31 02 01
- 🌐 [netzinformatique.fr](https://netzinformatique.fr)
- 📧 contact@netzinformatique.fr

---

## 📝 Licence

© 2025 MonOPCO - Netz Informatique. Tous droits réservés.

---

## 🙏 Remerciements

- **Vercel** - Infrastructure et déploiement
- **Neon** - Base de données PostgreSQL
- **Pappers.fr** - API données entreprises
- **Resend** - API envoi d'emails
- **shadcn/ui** - Composants UI

---

## 🔄 Roadmap

### **Version 1.1** (Q2 2025)
- [ ] Génération automatique des documents OPCO (PDF)
- [ ] Notifications email automatiques
- [ ] Export Excel des dossiers
- [ ] Intégration calendrier (Google Calendar)

### **Version 1.2** (Q3 2025)
- [ ] Module de facturation intégré
- [ ] Signature électronique des conventions
- [ ] API publique pour intégrations tierces
- [ ] Application mobile (React Native)

### **Version 2.0** (Q4 2025)
- [ ] IA pour pré-remplissage intelligent
- [ ] Chatbot assistant OPCO
- [ ] Prédiction taux d'acceptation dossiers
- [ ] Tableau de bord analytique avancé

---

**Fait avec ❤️ par Netz Informatique**

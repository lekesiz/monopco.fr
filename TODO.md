
# MonOPCO.fr - TODO Exhaustif

**Dernière mise à jour:** 25 novembre 2025  
**Statut Global:** 40% complété

---

## Légende

- ✅ **Terminé**
- 🚧 **En cours**
- ⏳ **À faire**
- 🔴 **Critique** (bloquant)
- 🟡 **Important** (priorité haute)
- 🟢 **Normal** (priorité moyenne)
- 🔵 **Nice to have** (priorité basse)

---

## Phase 1: Fondations et Corrections Urgentes

### 1.1 Corrections des Bugs Critiques

- [x] ✅ 🔴 **Fix OPCO Detection** - NAF 62/63 vers OPCOMMERCE
- [x] ✅ 🔴 **Fix Dashboard Data** - Remplacer localStorage par API
- [x] ✅ 🔴 **Fix AI Improvement** - Corriger l'API Gemini
- [x] ✅ 🔴 **Fix Bilan Flow** - Continuer vers SIRET au lieu de redirect
- [x] ✅ 🟡 **Fix "En savoir plus" button** - Scroll vers section OPCO
- [x] ✅ 🟡 **Fix "Mot de passe oublié"** - Créer page de réinitialisation
- [x] ✅ 🟡 **Fix Login feedback** - Ajouter messages d'erreur/succès
- [x] ✅ 🟡 **Fix SIRET feedback** - Ajouter notifications
- [x] ✅ 🟡 **Fix Footer links** - Corriger les liens légaux
- [x] ✅ 🟢 **Fix 404 page** - Créer page 404
- [x] ✅ 🟢 **Fix Admin demo user** - Différencier les comptes
- [x] ✅ 🟢 **Fix CTA button** - Améliorer visibilité
- [x] ✅ 🟢 **Redesign Legal Pages** - Design professionnel cohérent
- [x] ✅ 🔴 **Fix Build Error** - Remplacer `react-router-dom` par `wouter`

### 1.2 Authentification Réelle

- [ ] ⏳ 🔴 **Créer table `users`** dans PostgreSQL
- [ ] ⏳ 🔴 **API Auth - Register**
- [ ] ⏳ 🔴 **API Auth - Login**
- [ ] ⏳ 🔴 **API Auth - Logout**
- [ ] ⏳ 🔴 **API Auth - Refresh Token**
- [ ] ⏳ 🟡 **API Auth - Forgot Password**
- [ ] ⏳ 🟡 **API Auth - Reset Password**
- [ ] ⏳ 🔴 **Frontend - Page Register**
- [ ] ⏳ 🔴 **Frontend - Page Login**
- [ ] ⏳ 🔴 **Frontend - Protected Routes**
- [ ] ⏳ 🟡 **Frontend - Page Forgot Password**
- [ ] ⏳ 🟡 **Frontend - Page Reset Password**
- [ ] ⏳ 🔴 **Middleware Auth pour API**
- [ ] ⏳ 🟡 **Email Verification**

### 1.3 Amélioration du Schéma de Base de Données

- [ ] ⏳ 🔴 **Ajouter champs manquants dans `dossiers`**
- [ ] ⏳ 🟡 **Créer table `documents`**
- [ ] ⏳ 🟡 **Créer table `emails`**
- [ ] ⏳ 🟡 **Créer table `payments`**
- [ ] ⏳ 🟡 **Créer table `logs`**

---

## Phase 2: Fonctionnalités Core

### 2.1 Gestion des Documents

- [ ] ⏳ 🔴 **Setup Vercel Blob Storage**
- [ ] ⏳ 🔴 **API Documents - Upload**
- [ ] ⏳ 🔴 **API Documents - Download**
- [ ] ⏳ 🟡 **API Documents - Delete**
- [ ] ⏳ 🔴 **API Documents - List by Dossier**
- [ ] ⏳ 🔴 **Frontend - Upload Component**
- [ ] ⏳ 🔴 **Frontend - Documents List**
- [ ] ⏳ 🟡 **Frontend - Documents Checklist**

### 2.2 Génération Automatique de Documents

- [ ] ⏳ 🔴 **Setup Puppeteer**
- [ ] ⏳ 🔴 **Template - Formulaire de Demande**
- [ ] ⏳ 🔴 **Template - Convention de Formation**
- [ ] ⏳ 🔴 **Template - Calendrier Prévisionnel**
- [ ] ⏳ 🔴 **Template - Lettre d'Engagement**
- [ ] ⏳ 🟡 **Template - Récapitulatif du Dossier**
- [ ] ⏳ 🔴 **API Generate - All**
- [ ] ⏳ 🔴 **Frontend - Bouton "Générer les Documents"**

### 2.3 Système de Notifications (Emails)

- [ ] ⏳ 🔴 **Setup Resend API**
- [ ] ⏳ 🔴 **Template Email - Confirmation Création Dossier**
- [ ] ⏳ 🔴 **Template Email - Confirmation Envoi OPCO**
- [ ] ⏳ 🟡 **Template Email - Demande de Compléments**
- [ ] ⏳ 🔴 **Template Email - Notification Validation**
- [ ] ⏳ 🟡 **Template Email - Notification Refus**
- [ ] ⏳ 🟡 **Template Email - Rappel Justificatifs**

---

## Phase 3: Dashboard Admin

### 3.1 Gestion des Dossiers

- [ ] 🚧 🔴 **Page Admin Utilisateurs** - En cours de déploiement
- [ ] ⏳ 🟡 **Page Admin Dossiers - Vue d'ensemble**
- [ ] ⏳ 🟡 **Page Admin Dossiers - Validation**
- [ ] ⏳ 🟡 **Page Admin Dossiers - Actions en masse**

### 3.2 Dashboard Admin - Rapports

- [ ] ⏳ 🟡 **Page Admin Rapports**
- [ ] ⏳ 🟡 **API Admin - Rapports**
- [ ] ⏳ 🟡 **Export Excel**

---

## Phase 4: Qualité et Performance

### 4.1 Tests Automatisés

- [ ] ⏳ 🟡 **Setup Jest + React Testing Library**
- [ ] ⏳ 🟡 **Tests Unitaires - Frontend**
- [ ] ⏳ 🟡 **Tests Unitaires - Backend**
- [ ] ⏳ 🟢 **Tests E2E - Playwright**

### 4.2 Optimisations Performance

- [ ] ⏳ 🟡 **Frontend - Code Splitting**
- [ ] ⏳ 🟡 **Backend - Cache**
- [ ] ⏳ 🟡 **Database - Indexes**

---

## Backlog (Nice to Have)

- [ ] 🔵 **Multi-langue**
- [ ] 🔵 **Signature Électronique**
- [ ] 🔵 **Intégration RH**


# Architecture Technique - MonOPCO.fr

## Vue d'Ensemble

MonOPCO.fr est une application web full-stack construite avec une architecture moderne et scalable. L'application permet aux entreprises françaises de gérer leurs demandes de financement OPCO de manière automatisée et simplifiée.

## Stack Technique Actuelle

### Frontend

**Framework:** React 18+ avec TypeScript  
**Build Tool:** Vite  
**Routing:** React Router v6  
**State Management:** React Context API + useState/useReducer  
**Styling:** Tailwind CSS  
**Icons:** Lucide React  
**Forms:** HTML5 native + validation custom  
**HTTP Client:** Fetch API native

### Backend

**Runtime:** Node.js 22.13.0  
**API:** Serverless Functions (Vercel)  
**Language:** JavaScript (ES Modules .mjs)  
**Database:** PostgreSQL (Neon Serverless)  
**ORM:** pg (node-postgres) - SQL direct  
**Authentication:** JWT + bcrypt (mock pour l'instant)

### Services Externes

**APIs Utilisées:**
- **Pappers API:** Récupération des informations entreprise via SIRET
- **CFADock API:** Tentative de récupération OPCO (fallback sur mapping NAF)
- **Google Gemini API:** Amélioration des textes avec AI
- **Resend API:** Envoi d'emails transactionnels (configuré mais non utilisé)

**Hébergement:**
- **Frontend + Backend:** Vercel
- **Database:** Neon (PostgreSQL Serverless)
- **DNS:** Vercel

### Outils de Développement

**Version Control:** Git + GitHub  
**CI/CD:** Vercel (déploiement automatique sur push)  
**Package Manager:** pnpm  
**Linting:** ESLint (à configurer)  
**Testing:** Aucun (à ajouter)

## Architecture Actuelle

### Structure des Dossiers

```
/home/ubuntu/monopco.fr/
├── api/                          # Backend API (Serverless Functions)
│   ├── companies/
│   │   └── lookup.mjs           # Lookup SIRET → Infos entreprise + OPCO
│   ├── dossiers/
│   │   ├── create.mjs           # Créer un dossier
│   │   ├── list.mjs             # Lister les dossiers
│   │   ├── update.mjs           # Mettre à jour un dossier
│   │   └── delete.mjs           # Supprimer un dossier
│   └── ai/
│       ├── improve.mjs          # Améliorer un texte avec Gemini
│       └── analyze.mjs          # Analyser la conformité avec Gemini
├── pages/                        # Pages React
│   ├── Home.tsx                 # Page d'accueil
│   ├── Basvuru.tsx              # Formulaire de demande
│   ├── Dashboard.tsx            # Dashboard utilisateur
│   ├── Dossiers.tsx             # Liste des dossiers
│   ├── DossierForm.tsx          # Édition d'un dossier
│   ├── Login.tsx                # Page de connexion
│   ├── ForgotPassword.tsx       # Réinitialisation mot de passe
│   ├── MentionsLegales.tsx      # Mentions légales
│   ├── CGU.tsx                  # Conditions générales
│   ├── PolitiqueConfidentialite.tsx  # Politique de confidentialité
│   └── NotFound.tsx             # Page 404
├── services/                     # Services frontend
│   ├── authService.ts           # Authentification (mock)
│   ├── dataService.ts           # Accès aux données (API calls)
│   └── geminiService.ts         # Appels API Gemini (via backend)
├── App.tsx                       # Composant principal + routing
├── index.html                    # Point d'entrée HTML
├── main.tsx                      # Point d'entrée React
├── package.json                  # Dépendances
├── tsconfig.json                 # Configuration TypeScript
├── tailwind.config.js            # Configuration Tailwind
├── vite.config.ts                # Configuration Vite
└── vercel.json                   # Configuration Vercel
```

### Base de Données (Neon PostgreSQL)

**Tables Existantes:**

**Table: `dossiers`**
```sql
CREATE TABLE dossiers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  type_dossier VARCHAR(50),           -- 'bilan' ou 'formation'
  statut VARCHAR(50) DEFAULT 'brouillon',
  entreprise_siret VARCHAR(14),
  entreprise_nom VARCHAR(255),
  entreprise_adresse TEXT,
  entreprise_effectif INTEGER,
  entreprise_contact_nom VARCHAR(255),
  entreprise_contact_email VARCHAR(255),
  entreprise_contact_tel VARCHAR(20),
  opco VARCHAR(100),
  beneficiaire_nom VARCHAR(255),
  beneficiaire_prenom VARCHAR(255),
  beneficiaire_poste VARCHAR(255),
  beneficiaire_contrat VARCHAR(50),
  beneficiaire_anciennete VARCHAR(50),
  beneficiaire_email VARCHAR(255),
  formation_titre VARCHAR(255),
  formation_organisme VARCHAR(255),
  formation_date_debut DATE,
  formation_date_fin DATE,
  formation_duree INTEGER,            -- en heures
  formation_modalites VARCHAR(100),
  montant_estime DECIMAL(10,2),
  montant_accorde DECIMAL(10,2),
  objectifs TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- PRIMARY KEY sur `id`
- Index sur `user_id` (pour requêtes par utilisateur)
- Index sur `statut` (pour filtres)
- Index sur `entreprise_siret` (pour recherche)

**Tables Manquantes (à créer):**
- `users` - Utilisateurs (entreprises)
- `admins` - Administrateurs Netz Informatique
- `documents` - Documents uploadés
- `emails` - Historique des emails envoyés
- `payments` - Suivi des paiements
- `logs` - Logs d'activité

### API Endpoints Actuels

**Companies API:**
- `POST /api/companies/lookup` - Lookup SIRET → Infos + OPCO

**Dossiers API:**
- `POST /api/dossiers/create` - Créer un dossier
- `GET /api/dossiers/list` - Lister les dossiers
- `PUT /api/dossiers/update` - Mettre à jour un dossier
- `DELETE /api/dossiers/delete` - Supprimer un dossier

**AI API:**
- `POST /api/ai/improve` - Améliorer un texte
- `POST /api/ai/analyze` - Analyser la conformité

### Authentification Actuelle

**Système Mock:**
- Utilisateurs hardcodés dans `authService.ts`
- Pas de vraie base de données users
- JWT non implémenté
- Sessions stockées en localStorage

**Utilisateurs Mock:**
1. Entreprise: `user@example.com` / `password123`
2. Admin OPCO: `admin@monopco.fr` / `admin123`

## Architecture Cible

### Améliorations Nécessaires

#### 1. Authentification Réelle

**Objectif:** Remplacer le système mock par une authentification sécurisée.

**Implémentation:**
- Créer la table `users` dans PostgreSQL
- Créer les endpoints API:
  - `POST /api/auth/register` - Inscription
  - `POST /api/auth/login` - Connexion
  - `POST /api/auth/logout` - Déconnexion
  - `POST /api/auth/refresh` - Refresh token
  - `POST /api/auth/forgot-password` - Demande de réinitialisation
  - `POST /api/auth/reset-password` - Réinitialisation
- Utiliser JWT pour les tokens
- Stocker les tokens en httpOnly cookies (sécurisé)
- Hash des mots de passe avec bcrypt

**Table `users`:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  entreprise_siret VARCHAR(14),
  entreprise_nom VARCHAR(255),
  entreprise_adresse TEXT,
  entreprise_effectif INTEGER,
  contact_nom VARCHAR(255),
  contact_prenom VARCHAR(255),
  contact_tel VARCHAR(20),
  role VARCHAR(50) DEFAULT 'user',    -- 'user' ou 'admin'
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. Gestion des Documents

**Objectif:** Permettre l'upload, le stockage et la gestion des documents.

**Implémentation:**
- Créer la table `documents` dans PostgreSQL
- Créer les endpoints API:
  - `POST /api/documents/upload` - Upload un document
  - `GET /api/documents/:id` - Télécharger un document
  - `DELETE /api/documents/:id` - Supprimer un document
  - `GET /api/documents/dossier/:dossierId` - Lister les documents d'un dossier
- Stocker les fichiers sur Vercel Blob Storage ou AWS S3
- Limiter la taille des fichiers (10 Mo max)
- Accepter uniquement les PDFs

**Table `documents`:**
```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  type VARCHAR(100),                  -- 'devis', 'programme', 'convention', etc.
  url TEXT NOT NULL,                  -- URL du fichier stocké
  taille INTEGER,                     -- en bytes
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. Génération Automatique de Documents

**Objectif:** Générer automatiquement les documents requis (formulaire, convention, lettre, etc.).

**Implémentation:**
- Créer des templates de documents (HTML → PDF)
- Utiliser une librairie de génération PDF:
  - Option 1: Puppeteer (headless Chrome)
  - Option 2: PDFKit (Node.js)
  - Option 3: jsPDF (frontend)
- Créer les endpoints API:
  - `POST /api/documents/generate/formulaire` - Générer le formulaire
  - `POST /api/documents/generate/convention` - Générer la convention
  - `POST /api/documents/generate/calendrier` - Générer le calendrier
  - `POST /api/documents/generate/lettre` - Générer la lettre d'engagement
  - `POST /api/documents/generate/all` - Générer tous les documents
- Personnaliser les documents avec les données du dossier

**Templates:**
- `/templates/formulaire.html`
- `/templates/convention.html`
- `/templates/calendrier.html`
- `/templates/lettre.html`

#### 4. Système de Notifications

**Objectif:** Envoyer des emails automatiques à chaque étape du processus.

**Implémentation:**
- Utiliser Resend API (déjà configuré)
- Créer la table `emails` pour l'historique
- Créer les endpoints API:
  - `POST /api/emails/send` - Envoyer un email
  - `GET /api/emails/dossier/:dossierId` - Historique des emails d'un dossier
- Créer des templates d'emails:
  - Confirmation de création de dossier
  - Confirmation d'envoi à l'OPCO
  - Demande de compléments
  - Notification de validation
  - Notification de refus
  - Rappel pour justificatifs
  - Notification de paiement

**Table `emails`:**
```sql
CREATE TABLE emails (
  id SERIAL PRIMARY KEY,
  dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  template VARCHAR(100),
  sent_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'sent'   -- 'sent', 'failed', 'bounced'
);
```

#### 5. Dashboard Admin Complet

**Objectif:** Créer un dashboard admin puissant pour Netz Informatique.

**Implémentation:**
- Créer les pages admin:
  - `/admin/dashboard` - Vue d'ensemble
  - `/admin/dossiers` - Liste des dossiers
  - `/admin/dossiers/:id` - Détail d'un dossier
  - `/admin/entreprises` - Liste des entreprises
  - `/admin/entreprises/:id` - Fiche entreprise
  - `/admin/rapports` - Rapports et statistiques
  - `/admin/utilisateurs` - Gestion des admins
- Créer les endpoints API:
  - `GET /api/admin/stats` - Statistiques globales
  - `GET /api/admin/dossiers` - Liste des dossiers (avec filtres)
  - `PUT /api/admin/dossiers/:id/validate` - Valider un dossier
  - `PUT /api/admin/dossiers/:id/request-complements` - Demander des compléments
  - `GET /api/admin/rapports/mensuel` - Rapport mensuel
  - `GET /api/admin/rapports/opco` - Rapport par OPCO
- Protéger les routes admin (middleware de vérification du rôle)

#### 6. Suivi des Paiements

**Objectif:** Suivre les paiements des OPCO et les remboursements.

**Implémentation:**
- Créer la table `payments`
- Créer les endpoints API:
  - `GET /api/payments/list` - Liste des paiements
  - `POST /api/payments/mark-paid` - Marquer comme payé
  - `GET /api/payments/pending` - Paiements en attente
- Ajouter des champs dans `dossiers`:
  - `payment_status` - 'pending', 'paid', 'partial'
  - `payment_date` - Date de réception du paiement
  - `payment_amount` - Montant reçu

**Table `payments`:**
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
  montant_attendu DECIMAL(10,2),
  montant_recu DECIMAL(10,2),
  date_reception DATE,
  reference VARCHAR(255),
  statut VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'paid', 'partial'
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 7. Logs et Audit Trail

**Objectif:** Tracer toutes les actions importantes pour la sécurité et le debugging.

**Implémentation:**
- Créer la table `logs`
- Logger toutes les actions:
  - Création/modification/suppression de dossiers
  - Connexion/déconnexion
  - Envoi d'emails
  - Validation admin
  - Upload/suppression de documents
- Créer un endpoint API:
  - `GET /api/logs` - Consulter les logs (admin only)

**Table `logs`:**
```sql
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),           -- 'dossier', 'document', 'user', etc.
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 8. Amélioration de l'AI

**Objectif:** Utiliser l'AI de manière plus avancée pour améliorer les dossiers.

**Fonctionnalités AI à Ajouter:**

**A. Analyse Prédictive**
- Endpoint: `POST /api/ai/predict-acceptance`
- Input: Données du dossier
- Output: Score de probabilité d'acceptation (0-100%)
- Recommandations pour améliorer le dossier

**B. Génération de Justifications**
- Endpoint: `POST /api/ai/generate-justification`
- Input: Titre de la formation, poste du salarié, secteur
- Output: Justification professionnelle complète

**C. Suggestions de Formations**
- Endpoint: `POST /api/ai/suggest-formations`
- Input: Profil du salarié, secteur, OPCO
- Output: Liste de formations recommandées

**D. Vérification de Conformité**
- Endpoint: `POST /api/ai/check-compliance`
- Input: Dossier complet
- Output: Liste des problèmes détectés + suggestions

#### 9. Rapports et Exports

**Objectif:** Permettre l'export des données en Excel/PDF.

**Implémentation:**
- Créer les endpoints API:
  - `GET /api/rapports/mensuel/export` - Export Excel du rapport mensuel
  - `GET /api/rapports/dossiers/export` - Export Excel de la liste des dossiers
  - `GET /api/rapports/opco/export` - Export Excel du rapport par OPCO
- Utiliser une librairie d'export:
  - Excel: `exceljs` ou `xlsx`
  - PDF: `pdfkit` ou `puppeteer`

#### 10. Tests Automatisés

**Objectif:** Assurer la qualité du code et éviter les régressions.

**Implémentation:**
- **Tests Unitaires:** Jest + React Testing Library
- **Tests d'Intégration:** Supertest pour les API
- **Tests E2E:** Playwright ou Cypress
- CI/CD: Exécuter les tests automatiquement sur chaque commit

**Couverture Cible:**
- 80% de couverture de code
- Tests critiques: Authentification, Création de dossier, Validation admin

## Sécurité

### Mesures de Sécurité à Implémenter

**1. Authentification**
- JWT avec expiration courte (15 min)
- Refresh tokens avec expiration longue (7 jours)
- Tokens stockés en httpOnly cookies
- CSRF protection

**2. Autorisation**
- Middleware de vérification du rôle
- Vérification que l'utilisateur a accès au dossier demandé
- Admin: Accès à tous les dossiers
- User: Accès uniquement à ses dossiers

**3. Validation des Données**
- Validation côté frontend (UX)
- Validation côté backend (sécurité)
- Sanitization des inputs (prévention XSS)
- Validation des fichiers uploadés (type, taille)

**4. Protection des APIs**
- Rate limiting (max 100 requêtes/min par IP)
- CORS configuré correctement
- Headers de sécurité (Helmet.js)

**5. Protection des Données**
- Chiffrement des mots de passe (bcrypt)
- Chiffrement des données sensibles en base (optionnel)
- Conformité RGPD:
  - Droit à l'oubli (suppression des données)
  - Droit d'accès (export des données)
  - Consentement explicite

**6. Monitoring et Alertes**
- Monitoring des erreurs (Sentry)
- Monitoring des performances (Vercel Analytics)
- Alertes en cas d'activité suspecte

## Performance

### Optimisations à Implémenter

**1. Frontend**
- Code splitting (React.lazy)
- Lazy loading des images
- Compression des assets (Vite)
- Service Worker pour le cache (PWA)

**2. Backend**
- Cache des résultats API (Redis ou Vercel KV)
- Pagination des listes (max 50 items par page)
- Indexes sur les colonnes fréquemment requêtées
- Connection pooling pour PostgreSQL

**3. Database**
- Indexes sur `user_id`, `statut`, `entreprise_siret`
- Requêtes optimisées (éviter les N+1)
- Archivage des anciens dossiers (> 2 ans)

**4. CDN**
- Utiliser Vercel Edge Network
- Cache des assets statiques
- Compression Gzip/Brotli

## Scalabilité

### Architecture Scalable

**1. Serverless Functions**
- Avantage: Scale automatiquement
- Pas de gestion de serveurs
- Pay-per-use

**2. Database Serverless**
- Neon PostgreSQL: Scale automatiquement
- Connection pooling intégré
- Pas de limite de connexions

**3. Horizontal Scaling**
- Vercel: Deploy sur plusieurs régions
- Edge Functions pour la latence minimale

**4. Queue System (Futur)**
- Si besoin de traiter des tâches longues (génération de PDFs, envoi d'emails en masse)
- Utiliser Vercel Queues ou AWS SQS

## Monitoring et Observabilité

### Outils à Mettre en Place

**1. Error Tracking**
- Sentry pour les erreurs frontend et backend
- Alertes en temps réel
- Stack traces complètes

**2. Performance Monitoring**
- Vercel Analytics pour les métriques web
- Core Web Vitals (LCP, FID, CLS)
- Temps de chargement des pages

**3. Logs**
- Vercel Logs pour les fonctions serverless
- Logs structurés (JSON)
- Recherche et filtrage

**4. Uptime Monitoring**
- Pingdom ou UptimeRobot
- Alertes si le site est down
- Monitoring des endpoints critiques

## Déploiement

### Pipeline CI/CD Actuel

**Vercel:**
- Déploiement automatique sur push vers `main`
- Preview deployments sur les PRs
- Rollback en un clic

### Environnements

**Production:**
- URL: https://www.monopco.fr
- Branch: `main`
- Database: Neon Production

**Staging (à créer):**
- URL: https://staging.monopco.fr
- Branch: `staging`
- Database: Neon Staging

**Development:**
- URL: http://localhost:5173
- Branch: `dev` ou feature branches
- Database: Neon Dev ou local PostgreSQL

### Variables d'Environnement

**Production:**
- `DATABASE_URL` - Neon PostgreSQL
- `PAPPERS_API_KEY` - API Pappers
- `GEMINI_API_KEY` - API Google Gemini
- `RESEND_API_KEY` - API Resend
- `JWT_SECRET` - Secret pour JWT
- `NODE_ENV=production`

**Staging:**
- Mêmes variables avec des valeurs de staging

## Roadmap Technique

### Phase 1: Fondations (2 semaines)
- ✅ Setup initial (fait)
- ✅ Database schema de base (fait)
- ✅ API SIRET lookup (fait)
- ✅ API dossiers CRUD (fait)
- ✅ Frontend de base (fait)
- ⏳ Authentification réelle
- ⏳ Gestion des users

### Phase 2: Fonctionnalités Core (3 semaines)
- ⏳ Upload et gestion des documents
- ⏳ Génération automatique de documents
- ⏳ Système de notifications (emails)
- ⏳ Dashboard utilisateur complet
- ⏳ Amélioration de l'AI

### Phase 3: Dashboard Admin (2 semaines)
- ⏳ Dashboard admin complet
- ⏳ Validation des dossiers
- ⏳ Communication avec clients
- ⏳ Rapports et statistiques

### Phase 4: Avancé (2 semaines)
- ⏳ Suivi des paiements
- ⏳ Logs et audit trail
- ⏳ Analyse prédictive AI
- ⏳ Exports Excel/PDF

### Phase 5: Qualité et Performance (1 semaine)
- ⏳ Tests automatisés
- ⏳ Optimisations performance
- ⏳ Monitoring et alertes
- ⏳ Documentation complète

### Phase 6: Production Ready (1 semaine)
- ⏳ Tests A-Z complets
- ⏳ Corrections finales
- ⏳ Déploiement en production
- ⏳ Formation des admins

**Durée Totale Estimée:** 11 semaines

## Conclusion

L'architecture technique de MonOPCO.fr est solide et moderne, basée sur des technologies éprouvées (React, Node.js, PostgreSQL, Vercel). Les fondations sont en place, mais de nombreuses fonctionnalités critiques doivent encore être développées pour atteindre un niveau production-ready.

Les priorités sont:
1. **Authentification réelle** (sécurité)
2. **Gestion des documents** (fonctionnalité core)
3. **Dashboard admin** (outil de gestion)
4. **Notifications** (communication)
5. **Tests** (qualité)

Avec une équipe dédiée et un développement structuré, le projet peut être complété à 100% en **11 semaines**.

---

**Dernière mise à jour:** 25 novembre 2025

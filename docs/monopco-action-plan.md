# Plan d'Action - MonOPCO.fr
Date: 25 novembre 2025

## Objectif

Corriger tous les problèmes identifiés lors des tests A-Z et implémenter les fonctionnalités manquantes critiques pour rendre MonOPCO.fr 100% opérationnel en production.

---

## Phase 1: Corrections Urgentes (Priorité Immédiate)

### Tâche 1.1: Créer la Page Utilisateurs Admin ⏱️ 4h

**Problème:** Route `/users` renvoie 404, menu visible mais page manquante

**Actions:**
1. Créer `/pages/Users.tsx` avec interface de gestion
2. Créer `/api/users/list.mjs` pour récupérer la liste
3. Créer `/api/users/update.mjs` pour modifier un utilisateur
4. Créer `/api/users/delete.mjs` pour supprimer un utilisateur
5. Ajouter recherche, filtres et pagination
6. Tester avec le compte admin

**Fichiers à créer:**
- `/pages/Users.tsx`
- `/api/users/list.mjs`
- `/api/users/update.mjs`
- `/api/users/delete.mjs`

**Critères de succès:**
- Page accessible sur `/users` pour les admins
- Liste des utilisateurs affichée
- Recherche et filtres fonctionnels
- Modification et suppression possibles

---

### Tâche 1.2: Implémenter l'Authentification Réelle ⏱️ 12h

**Problème:** Système d'authentification mock, pas de sécurité réelle

**Actions:**

**1.2.1: Base de données (2h)**
- Créer table `users` dans PostgreSQL
- Ajouter colonnes: id, email, password_hash, entreprise_siret, entreprise_nom, contact_nom, role, email_verified, created_at, updated_at
- Créer index sur email (unique) et entreprise_siret
- Migrer les utilisateurs démo en base

**1.2.2: Backend API (6h)**
- Créer `/api/auth/register.mjs` - Inscription
- Créer `/api/auth/login.mjs` - Connexion
- Créer `/api/auth/logout.mjs` - Déconnexion
- Créer `/api/auth/refresh.mjs` - Refresh token
- Créer `/api/auth/forgot-password.mjs` - Mot de passe oublié
- Créer `/api/auth/reset-password.mjs` - Réinitialisation
- Créer middleware d'authentification JWT

**1.2.3: Frontend (4h)**
- Créer `/pages/Register.tsx` - Page d'inscription
- Modifier `/pages/Login.tsx` - Remplacer le mock
- Créer `/pages/ForgotPassword.tsx` - Mot de passe oublié
- Créer `/pages/ResetPassword.tsx` - Réinitialisation
- Créer context React pour l'authentification
- Implémenter protected routes

**Fichiers à créer:**
- `schema-users.sql`
- `/api/auth/register.mjs`
- `/api/auth/login.mjs`
- `/api/auth/logout.mjs`
- `/api/auth/refresh.mjs`
- `/api/auth/forgot-password.mjs`
- `/api/auth/reset-password.mjs`
- `/api/middleware/auth.mjs`
- `/pages/Register.tsx`
- `/pages/ForgotPassword.tsx`
- `/pages/ResetPassword.tsx`
- `/services/authService.ts`

**Critères de succès:**
- Inscription fonctionnelle avec validation
- Connexion avec JWT et httpOnly cookies
- Déconnexion qui invalide les tokens
- Récupération de mot de passe par email
- Protected routes qui redirigent vers login
- Refresh automatique des tokens

---

### Tâche 1.3: Implémenter la Gestion des Documents ⏱️ 10h

**Problème:** Impossible d'uploader ou télécharger des documents

**Actions:**

**1.3.1: Setup Vercel Blob (1h)**
- Créer un Blob Store sur Vercel
- Configurer BLOB_READ_WRITE_TOKEN dans Vercel
- Tester upload/download basique

**1.3.2: Base de données (1h)**
- Créer table `documents` dans PostgreSQL
- Colonnes: id, dossier_id, nom, type, url, taille, uploaded_by, uploaded_at
- Index sur dossier_id
- Foreign key vers dossiers (ON DELETE CASCADE)

**1.3.3: Backend API (4h)**
- Créer `/api/documents/upload.mjs` - Upload vers Blob
- Créer `/api/documents/download.mjs` - URL signée temporaire
- Créer `/api/documents/list.mjs` - Liste par dossier
- Créer `/api/documents/delete.mjs` - Suppression
- Validation: type PDF, taille max 10 Mo

**1.3.4: Frontend (4h)**
- Créer `/components/DocumentUpload.tsx` - Drag & drop
- Créer `/components/DocumentList.tsx` - Liste avec actions
- Créer `/components/DocumentChecklist.tsx` - Documents obligatoires
- Intégrer dans `/pages/DossierEdit.tsx`

**Fichiers à créer:**
- `schema-documents.sql`
- `/api/documents/upload.mjs`
- `/api/documents/download.mjs`
- `/api/documents/list.mjs`
- `/api/documents/delete.mjs`
- `/components/DocumentUpload.tsx`
- `/components/DocumentList.tsx`
- `/components/DocumentChecklist.tsx`

**Critères de succès:**
- Upload de fichiers fonctionnel
- Liste des documents affichée
- Téléchargement sécurisé
- Suppression possible
- Drag & drop opérationnel
- Barre de progression visible

---

## Phase 2: Fonctionnalités Core (Priorité Haute)

### Tâche 2.1: Générer les PDF Automatiquement ⏱️ 16h

**Problème:** Pas de génération automatique des documents OPCO

**Actions:**

**2.1.1: Setup Puppeteer (2h)**
- Installer @sparticuz/chromium pour Vercel
- Installer puppeteer-core
- Configurer pour serverless
- Tester génération PDF basique

**2.1.2: Templates HTML (6h)**
- Créer `/templates/pdf/formulaire.html` - Formulaire de demande
- Créer `/templates/pdf/convention.html` - Convention de formation
- Créer `/templates/pdf/calendrier.html` - Calendrier prévisionnel
- Créer `/templates/pdf/lettre.html` - Lettre d'engagement
- Créer `/templates/pdf/recapitulatif.html` - Récapitulatif
- Styling CSS professionnel pour chaque template

**2.1.3: Backend API (6h)**
- Créer `/api/documents/generate/formulaire.mjs`
- Créer `/api/documents/generate/convention.mjs`
- Créer `/api/documents/generate/calendrier.mjs`
- Créer `/api/documents/generate/lettre.mjs`
- Créer `/api/documents/generate/all.mjs` - Génération ZIP
- Upload automatique vers Blob Storage

**2.1.4: Frontend (2h)**
- Ajouter bouton "Générer les documents" dans DossierEdit
- Modal de progression
- Téléchargement automatique du ZIP
- Affichage des documents générés

**Fichiers à créer:**
- `/templates/pdf/formulaire.html`
- `/templates/pdf/convention.html`
- `/templates/pdf/calendrier.html`
- `/templates/pdf/lettre.html`
- `/templates/pdf/recapitulatif.html`
- `/api/documents/generate/formulaire.mjs`
- `/api/documents/generate/convention.mjs`
- `/api/documents/generate/calendrier.mjs`
- `/api/documents/generate/lettre.mjs`
- `/api/documents/generate/all.mjs`
- `/lib/pdfGenerator.ts`

**Critères de succès:**
- Génération de chaque document PDF
- Génération de tous les documents en ZIP
- Upload automatique vers Blob
- Téléchargement fonctionnel
- Templates professionnels
- Variables dynamiques correctes

---

### Tâche 2.2: Automatiser les Notifications Email ⏱️ 12h

**Problème:** Pas d'emails automatiques pour les événements importants

**Actions:**

**2.2.1: Base de données (1h)**
- Créer table `emails` dans PostgreSQL
- Colonnes: id, dossier_id, recipient_email, subject, body, template, sent_at, status
- Index sur dossier_id et sent_at

**2.2.2: Templates Email (4h)**
- Créer `/templates/email/confirmation-creation.html`
- Créer `/templates/email/confirmation-envoi-opco.html`
- Créer `/templates/email/demande-complements.html`
- Créer `/templates/email/notification-validation.html`
- Créer `/templates/email/notification-refus.html`
- Créer `/templates/email/rappel-justificatifs.html`
- Version HTML + texte brut pour chaque template

**2.2.3: Backend API (5h)**
- Créer `/api/emails/send.mjs` - Envoi générique
- Créer `/lib/emailService.ts` - Service d'envoi
- Intégrer Resend API
- Créer triggers automatiques:
  - Après création de dossier
  - Après changement de statut
  - Rappels programmés
- Logger tous les envois dans table `emails`

**2.2.4: Frontend (2h)**
- Ajouter bouton "Envoyer un email" dans DossierEdit
- Modal de composition d'email
- Historique des emails envoyés
- Prévisualisation des templates

**Fichiers à créer:**
- `schema-emails.sql`
- `/templates/email/confirmation-creation.html`
- `/templates/email/confirmation-envoi-opco.html`
- `/templates/email/demande-complements.html`
- `/templates/email/notification-validation.html`
- `/templates/email/notification-refus.html`
- `/templates/email/rappel-justificatifs.html`
- `/api/emails/send.mjs`
- `/lib/emailService.ts`
- `/components/EmailComposer.tsx`
- `/components/EmailHistory.tsx`

**Critères de succès:**
- Email de confirmation après création
- Email après envoi OPCO
- Emails de notification de statut
- Rappels automatiques
- Historique visible
- Templates professionnels

---

## Phase 3: Amélioration UX (Priorité Moyenne)

### Tâche 3.1: Compléter le Workflow des Dossiers ⏱️ 8h

**Problème:** Statut "BROUILLON" uniquement, pas de workflow complet

**Actions:**

**3.1.1: Base de données (1h)**
- Ajouter colonnes dans table `dossiers`:
  - `user_id` INTEGER REFERENCES users(id)
  - `payment_status` VARCHAR(50)
  - `payment_date` DATE
  - `payment_amount` DECIMAL(10,2)
  - `validation_admin_date` TIMESTAMP
  - `validation_admin_by` INTEGER REFERENCES users(id)
  - `envoi_opco_date` TIMESTAMP
  - `reponse_opco_date` TIMESTAMP
  - `motif_refus` TEXT

**3.1.2: Backend API (3h)**
- Créer `/api/dossiers/change-status.mjs` - Changement de statut
- Créer `/api/dossiers/validate.mjs` - Validation admin
- Créer `/api/dossiers/send-to-opco.mjs` - Envoi OPCO
- Créer `/api/dossiers/record-payment.mjs` - Enregistrer paiement
- Créer table `logs` pour historique

**3.1.3: Frontend (4h)**
- Créer `/components/StatusWorkflow.tsx` - Visualisation du workflow
- Créer `/components/ValidationForm.tsx` - Formulaire de validation admin
- Créer `/components/PaymentForm.tsx` - Formulaire de paiement
- Ajouter boutons d'action selon le statut
- Historique des changements de statut

**Fichiers à créer:**
- `schema-workflow.sql`
- `/api/dossiers/change-status.mjs`
- `/api/dossiers/validate.mjs`
- `/api/dossiers/send-to-opco.mjs`
- `/api/dossiers/record-payment.mjs`
- `/components/StatusWorkflow.tsx`
- `/components/ValidationForm.tsx`
- `/components/PaymentForm.tsx`

**Critères de succès:**
- Tous les statuts implémentés
- Workflow de validation admin
- Suivi des paiements
- Historique des changements
- Notifications automatiques
- Permissions par rôle

---

### Tâche 3.2: Dashboard Avancé avec Statistiques ⏱️ 6h

**Problème:** Dashboard basique sans analyses approfondies

**Actions:**

**3.2.1: Backend API (2h)**
- Créer `/api/stats/overview.mjs` - Vue d'ensemble
- Créer `/api/stats/by-opco.mjs` - Statistiques par OPCO
- Créer `/api/stats/by-month.mjs` - Évolution mensuelle
- Créer `/api/stats/conversion.mjs` - Taux de conversion
- Créer `/api/stats/average-time.mjs` - Temps moyen de traitement

**3.2.2: Frontend (4h)**
- Créer `/components/StatsOverview.tsx` - Vue d'ensemble
- Créer `/components/ChartByOpco.tsx` - Graphique par OPCO
- Créer `/components/ChartEvolution.tsx` - Évolution temporelle
- Créer `/components/StatsConversion.tsx` - Taux de conversion
- Intégrer dans Dashboard avec onglets

**Fichiers à créer:**
- `/api/stats/overview.mjs`
- `/api/stats/by-opco.mjs`
- `/api/stats/by-month.mjs`
- `/api/stats/conversion.mjs`
- `/api/stats/average-time.mjs`
- `/components/StatsOverview.tsx`
- `/components/ChartByOpco.tsx`
- `/components/ChartEvolution.tsx`
- `/components/StatsConversion.tsx`

**Critères de succès:**
- Graphiques détaillés
- Statistiques par OPCO
- Évolution mensuelle
- Taux de conversion
- Temps moyen de traitement
- Export en CSV/PDF

---

### Tâche 3.3: Recherche et Filtres Avancés ⏱️ 5h

**Problème:** Recherche et filtres basiques

**Actions:**

**3.3.1: Backend API (2h)**
- Modifier `/api/dossiers/list.mjs` pour supporter:
  - Filtres multiples (statut, OPCO, date, montant)
  - Tri par colonne
  - Recherche full-text (formation, salarié, entreprise)
  - Pagination avancée

**3.3.2: Frontend (3h)**
- Créer `/components/AdvancedFilters.tsx` - Panneau de filtres
- Créer `/components/SortableTable.tsx` - Tableau triable
- Créer `/components/SearchBar.tsx` - Barre de recherche améliorée
- Sauvegarder les filtres dans localStorage
- Bouton "Réinitialiser les filtres"

**Fichiers à créer:**
- `/components/AdvancedFilters.tsx`
- `/components/SortableTable.tsx`
- `/components/SearchBar.tsx`

**Critères de succès:**
- Filtres multiples fonctionnels
- Tri par colonne
- Recherche full-text
- Sauvegarde des filtres
- Performance optimale

---

## Phase 4: Optimisation et Tests (Priorité Basse)

### Tâche 4.1: Tests Automatisés ⏱️ 8h

**Actions:**
- Setup Jest et React Testing Library
- Tests unitaires pour les composants clés
- Tests d'intégration pour les APIs
- Tests E2E avec Playwright
- Coverage minimum 70%

### Tâche 4.2: Documentation ⏱️ 4h

**Actions:**
- Documentation API avec Swagger
- Guide utilisateur
- Guide admin
- README technique
- Diagrammes d'architecture

### Tâche 4.3: Optimisation Performance ⏱️ 4h

**Actions:**
- Lazy loading des composants
- Optimisation des requêtes SQL
- Cache Redis pour les données fréquentes
- Compression des images
- Minification des assets

---

## Récapitulatif des Temps

| Phase | Tâches | Temps total |
|-------|--------|-------------|
| Phase 1 | Corrections urgentes | 26h |
| Phase 2 | Fonctionnalités core | 28h |
| Phase 3 | Amélioration UX | 19h |
| Phase 4 | Optimisation et tests | 16h |
| **TOTAL** | **Toutes les phases** | **89h** |

---

## Planning de Réalisation

### Semaine 1 (Jours 1-5)
- Lundi: Tâche 1.1 (Page Utilisateurs) + Début 1.2 (Auth)
- Mardi-Mercredi: Tâche 1.2 (Auth complète)
- Jeudi-Vendredi: Tâche 1.3 (Gestion documents)

### Semaine 2 (Jours 6-10)
- Lundi-Mardi: Tâche 2.1 (Génération PDF)
- Mercredi-Jeudi: Tâche 2.2 (Notifications email)
- Vendredi: Tâche 3.1 (Workflow dossiers)

### Semaine 3 (Jours 11-15)
- Lundi: Tâche 3.2 (Dashboard avancé)
- Mardi: Tâche 3.3 (Recherche avancée)
- Mercredi-Jeudi: Tâche 4.1 (Tests)
- Vendredi: Tâches 4.2 et 4.3 (Doc + Optim)

---

## Ordre d'Exécution Recommandé

1. **Tâche 1.1** - Page Utilisateurs (4h) - Correction immédiate du bug 404
2. **Tâche 1.2** - Authentification réelle (12h) - Bloquant pour la production
3. **Tâche 1.3** - Gestion documents (10h) - Core feature
4. **Tâche 2.1** - Génération PDF (16h) - Valeur ajoutée principale
5. **Tâche 2.2** - Notifications email (12h) - Améliore l'UX
6. **Tâche 3.1** - Workflow complet (8h) - Suivi de bout en bout
7. **Tâche 3.2** - Dashboard avancé (6h) - Analytics
8. **Tâche 3.3** - Recherche avancée (5h) - Productivité
9. **Tâche 4.1** - Tests (8h) - Qualité
10. **Tâches 4.2 et 4.3** - Doc + Optim (8h) - Finitions

---

## Critères de Validation Globaux

### Avant la mise en production

- [ ] Tous les tests A-Z passent (15/15)
- [ ] Authentification réelle fonctionnelle
- [ ] Gestion des documents opérationnelle
- [ ] Génération PDF automatique
- [ ] Emails automatiques envoyés
- [ ] Workflow complet implémenté
- [ ] Dashboard avec statistiques
- [ ] Recherche et filtres avancés
- [ ] Tests automatisés (coverage > 70%)
- [ ] Documentation complète
- [ ] Performance optimisée (< 2s chargement)
- [ ] Sécurité validée (OWASP Top 10)
- [ ] RGPD conforme
- [ ] Backup automatique configuré

---

## Prochaine Étape Immédiate

**Commencer par la Tâche 1.1: Créer la Page Utilisateurs Admin**

Cette tâche est la plus rapide (4h) et corrige un bug visible immédiatement. Elle permettra de valider le workflow de développement avant de s'attaquer aux tâches plus complexes.

**Commande pour démarrer:**
```bash
cd /home/ubuntu/monopco.fr
git checkout -b feature/users-page
```

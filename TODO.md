# MonOPCO.fr - TODO Exhaustif

**Dernière mise à jour:** 25 novembre 2025  
**Statut Global:** 35% complété

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

### 1.2 Authentification Réelle

- [ ] ⏳ 🔴 **Créer table `users`** dans PostgreSQL
  - Champs: id, email, password_hash, entreprise_siret, entreprise_nom, contact_nom, role, email_verified, created_at, updated_at
  - Index sur email (unique)
  - Index sur entreprise_siret

- [ ] ⏳ 🔴 **API Auth - Register**
  - Endpoint: `POST /api/auth/register`
  - Validation: email valide, mot de passe fort (min 8 caractères)
  - Hash du mot de passe avec bcrypt
  - Envoi d'email de vérification
  - Retour: JWT token

- [ ] ⏳ 🔴 **API Auth - Login**
  - Endpoint: `POST /api/auth/login`
  - Vérification email + password
  - Génération JWT (access token 15min + refresh token 7 jours)
  - Stockage en httpOnly cookies
  - Retour: user info + tokens

- [ ] ⏳ 🔴 **API Auth - Logout**
  - Endpoint: `POST /api/auth/logout`
  - Suppression des cookies
  - Invalidation du refresh token

- [ ] ⏳ 🔴 **API Auth - Refresh Token**
  - Endpoint: `POST /api/auth/refresh`
  - Vérification du refresh token
  - Génération d'un nouveau access token
  - Retour: nouveau access token

- [ ] ⏳ 🟡 **API Auth - Forgot Password**
  - Endpoint: `POST /api/auth/forgot-password`
  - Génération d'un token de réinitialisation (expiration 1h)
  - Envoi d'email avec lien de réinitialisation
  - Stockage du token en base

- [ ] ⏳ 🟡 **API Auth - Reset Password**
  - Endpoint: `POST /api/auth/reset-password`
  - Vérification du token
  - Hash du nouveau mot de passe
  - Mise à jour en base
  - Invalidation du token

- [ ] ⏳ 🔴 **Frontend - Page Register**
  - Formulaire: email, password, confirm password, entreprise_siret
  - Validation frontend
  - Appel API register
  - Redirection vers dashboard après succès

- [ ] ⏳ 🔴 **Frontend - Page Login**
  - Remplacer le système mock
  - Appel API login
  - Stockage du user en context
  - Redirection vers dashboard

- [ ] ⏳ 🔴 **Frontend - Protected Routes**
  - Middleware de vérification du token
  - Redirection vers login si non authentifié
  - Refresh automatique du token

- [ ] ⏳ 🟡 **Frontend - Page Forgot Password**
  - Formulaire: email
  - Appel API forgot-password
  - Message de confirmation

- [ ] ⏳ 🟡 **Frontend - Page Reset Password**
  - Formulaire: nouveau mot de passe, confirm
  - Appel API reset-password
  - Redirection vers login après succès

- [ ] ⏳ 🔴 **Middleware Auth pour API**
  - Vérification du JWT sur chaque requête API
  - Extraction du user_id du token
  - Ajout du user_id dans req.user

- [ ] ⏳ 🟡 **Email Verification**
  - Envoi d'email de vérification après register
  - Endpoint: `GET /api/auth/verify-email/:token`
  - Mise à jour de email_verified en base

### 1.3 Amélioration du Schéma de Base de Données

- [ ] ⏳ 🔴 **Ajouter champs manquants dans `dossiers`**
  - `user_id` INTEGER REFERENCES users(id) - Propriétaire du dossier
  - `payment_status` VARCHAR(50) - 'pending', 'paid', 'partial'
  - `payment_date` DATE - Date de réception du paiement
  - `payment_amount` DECIMAL(10,2) - Montant reçu
  - `validation_admin_date` TIMESTAMP - Date de validation admin
  - `validation_admin_by` INTEGER REFERENCES users(id) - Admin qui a validé
  - `envoi_opco_date` TIMESTAMP - Date d'envoi à l'OPCO
  - `reponse_opco_date` TIMESTAMP - Date de réponse de l'OPCO
  - `motif_refus` TEXT - Motif de refus si applicable

- [ ] ⏳ 🟡 **Créer table `documents`**
  - Champs: id, dossier_id, nom, type, url, taille, uploaded_by, uploaded_at
  - Index sur dossier_id
  - Foreign key vers dossiers (ON DELETE CASCADE)

- [ ] ⏳ 🟡 **Créer table `emails`**
  - Champs: id, dossier_id, recipient_email, subject, body, template, sent_at, status
  - Index sur dossier_id
  - Index sur sent_at

- [ ] ⏳ 🟡 **Créer table `payments`**
  - Champs: id, dossier_id, montant_attendu, montant_recu, date_reception, reference, statut, created_at
  - Index sur dossier_id
  - Index sur statut

- [ ] ⏳ 🟡 **Créer table `logs`**
  - Champs: id, user_id, action, entity_type, entity_id, details (JSONB), ip_address, user_agent, created_at
  - Index sur user_id
  - Index sur created_at
  - Index sur entity_type + entity_id

- [ ] ⏳ 🟢 **Créer table `admins`** (ou ajouter role dans users)
  - Si table séparée: id, user_id, permissions (JSONB), created_at
  - Si role dans users: Ajouter colonne `role` ('user', 'admin', 'super_admin')

---

## Phase 2: Fonctionnalités Core

### 2.1 Gestion des Documents

- [ ] ⏳ 🔴 **Setup Vercel Blob Storage**
  - Créer un Blob Store sur Vercel
  - Configurer les variables d'environnement
  - Tester l'upload/download

- [ ] ⏳ 🔴 **API Documents - Upload**
  - Endpoint: `POST /api/documents/upload`
  - Validation: type PDF, taille max 10 Mo
  - Upload vers Vercel Blob
  - Insertion en base avec URL
  - Retour: document info

- [ ] ⏳ 🔴 **API Documents - Download**
  - Endpoint: `GET /api/documents/:id`
  - Vérification des permissions (user propriétaire ou admin)
  - Génération d'une URL signée temporaire
  - Redirection vers Blob Storage

- [ ] ⏳ 🟡 **API Documents - Delete**
  - Endpoint: `DELETE /api/documents/:id`
  - Vérification des permissions
  - Suppression du fichier sur Blob Storage
  - Suppression de l'entrée en base

- [ ] ⏳ 🔴 **API Documents - List by Dossier**
  - Endpoint: `GET /api/documents/dossier/:dossierId`
  - Retour: liste des documents avec URL de téléchargement

- [ ] ⏳ 🔴 **Frontend - Upload Component**
  - Composant réutilisable pour upload
  - Drag & drop
  - Preview du fichier
  - Barre de progression
  - Gestion des erreurs

- [ ] ⏳ 🔴 **Frontend - Documents List**
  - Affichage de la liste des documents d'un dossier
  - Bouton de téléchargement
  - Bouton de suppression
  - Indication du type de document

- [ ] ⏳ 🟡 **Frontend - Documents Checklist**
  - Checklist des documents obligatoires
  - Indication des documents présents/manquants
  - Liens vers upload pour documents manquants

### 2.2 Génération Automatique de Documents

- [ ] ⏳ 🔴 **Setup Puppeteer**
  - Installer Puppeteer
  - Configurer pour Vercel Serverless
  - Tester la génération de PDF

- [ ] ⏳ 🔴 **Template - Formulaire de Demande de Prise en Charge**
  - Créer template HTML
  - Variables dynamiques: entreprise, bénéficiaire, formation, OPCO
  - Styling professionnel

- [ ] ⏳ 🔴 **Template - Convention de Formation**
  - Créer template HTML
  - Variables dynamiques: entreprise, organisme, dates, montant
  - Clauses légales standard

- [ ] ⏳ 🔴 **Template - Calendrier Prévisionnel**
  - Créer template HTML
  - Génération automatique à partir des dates
  - Format tableau clair

- [ ] ⏳ 🔴 **Template - Lettre d'Engagement**
  - Créer template HTML
  - Variables dynamiques: entreprise, objectifs, formation
  - Ton formel et professionnel

- [ ] ⏳ 🟡 **Template - Récapitulatif du Dossier**
  - Créer template HTML
  - Liste de tous les documents
  - Statut de chaque document
  - Checklist de vérification

- [ ] ⏳ 🔴 **API Generate - Formulaire**
  - Endpoint: `POST /api/documents/generate/formulaire`
  - Input: dossier_id
  - Génération du PDF avec Puppeteer
  - Upload vers Blob Storage
  - Insertion en base
  - Retour: document info

- [ ] ⏳ 🔴 **API Generate - Convention**
  - Endpoint: `POST /api/documents/generate/convention`
  - Même logique que formulaire

- [ ] ⏳ 🔴 **API Generate - Calendrier**
  - Endpoint: `POST /api/documents/generate/calendrier`
  - Même logique

- [ ] ⏳ 🔴 **API Generate - Lettre**
  - Endpoint: `POST /api/documents/generate/lettre`
  - Même logique

- [ ] ⏳ 🔴 **API Generate - All**
  - Endpoint: `POST /api/documents/generate/all`
  - Génération de tous les documents en une fois
  - Création d'un ZIP
  - Retour: URL du ZIP

- [ ] ⏳ 🔴 **Frontend - Bouton "Générer les Documents"**
  - Dans le formulaire de dossier
  - Appel API generate/all
  - Affichage de la progression
  - Téléchargement automatique du ZIP

### 2.3 Système de Notifications (Emails)

- [ ] ⏳ 🔴 **Setup Resend API**
  - Vérifier la configuration
  - Tester l'envoi d'email
  - Configurer le domaine (monopco.fr)

- [ ] ⏳ 🔴 **Template Email - Confirmation Création Dossier**
  - HTML + texte brut
  - Variables: nom client, numéro dossier, type
  - CTA: "Voir mon dossier"

- [ ] ⏳ 🔴 **Template Email - Confirmation Envoi OPCO**
  - Variables: nom client, numéro dossier, OPCO, délai estimé
  - CTA: "Suivre mon dossier"

- [ ] ⏳ 🟡 **Template Email - Demande de Compléments**
  - Variables: nom client, numéro dossier, liste des documents manquants
  - CTA: "Compléter mon dossier"

- [ ] ⏳ 🔴 **Template Email - Notification Validation**
  - Variables: nom client, numéro dossier, montant accordé
  - CTA: "Voir les détails"

- [ ] ⏳ 🟡 **Template Email - Notification Refus**
  - Variables: nom client, numéro dossier, motif du refus
  - CTA: "Contacter le support"

- [ ] ⏳ 🟡 **Template Email - Rappel Justificatifs**
  - Variables: nom client, numéro dossier, date limite
  - Liste des justificatifs à fournir
  - CTA: "Envoyer les justificatifs"

- [ ] ⏳ 🟡 **Template Email - Notification Paiement**
  - Variables: nom client, numéro dossier, montant reçu
  - CTA: "Voir mon historique"

- [ ] ⏳ 🔴 **API Emails - Send**
  - Endpoint: `POST /api/emails/send`
  - Input: recipient, template, variables
  - Envoi via Resend
  - Insertion en base (historique)
  - Gestion des erreurs

- [ ] ⏳ 🟡 **API Emails - List by Dossier**
  - Endpoint: `GET /api/emails/dossier/:dossierId`
  - Retour: historique des emails

- [ ] ⏳ 🔴 **Automatisation - Envoi Email Création**
  - Trigger: Création d'un dossier
  - Appel automatique de l'API send

- [ ] ⏳ 🔴 **Automatisation - Envoi Email Envoi OPCO**
  - Trigger: Changement de statut vers "envoyé"
  - Appel automatique

- [ ] ⏳ 🟡 **Automatisation - Envoi Email Validation**
  - Trigger: Changement de statut vers "validé"
  - Appel automatique

- [ ] ⏳ 🟡 **Automatisation - Rappel Justificatifs**
  - Cron job: Tous les jours
  - Vérifier les dossiers validés avec formation terminée
  - Envoyer un rappel si justificatifs non reçus

### 2.4 Amélioration du Dashboard Utilisateur

- [ ] ⏳ 🔴 **Dashboard - Vue d'Ensemble**
  - Statistiques: Total engagé, Dossiers déposés, En attente, Validés
  - Graphique: Évolution des dossiers par mois
  - Actions rapides: Nouveau dossier, Voir mes dossiers

- [ ] ⏳ 🔴 **Dashboard - Liste des Dossiers**
  - Table avec: ID, Type, Bénéficiaire, OPCO, Montant, Statut, Actions
  - Filtres: Par statut, Par type, Par période
  - Recherche globale
  - Tri par colonne

- [ ] ⏳ 🟡 **Dashboard - Détail d'un Dossier**
  - Toutes les informations du dossier
  - Timeline des événements
  - Liste des documents
  - Bouton "Télécharger tous les documents"
  - Bouton "Modifier" (si brouillon)
  - Bouton "Envoyer à l'OPCO" (si prêt)

- [ ] ⏳ 🟡 **Dashboard - Profil Utilisateur**
  - Informations personnelles
  - Informations entreprise
  - Modifier le profil
  - Changer le mot de passe

- [ ] ⏳ 🟢 **Dashboard - Historique et Rapports**
  - Liste de tous les dossiers (archivés inclus)
  - Export Excel
  - Statistiques personnalisées

### 2.5 Amélioration de l'AI

- [ ] ⏳ 🟡 **AI - Analyse Prédictive**
  - Endpoint: `POST /api/ai/predict-acceptance`
  - Input: Données du dossier
  - Analyse avec Gemini
  - Output: Score (0-100%), Recommandations
  - Affichage dans le frontend

- [ ] ⏳ 🟡 **AI - Génération de Justifications**
  - Endpoint: `POST /api/ai/generate-justification`
  - Input: Titre formation, Poste, Secteur
  - Génération avec Gemini
  - Output: Justification professionnelle complète
  - Bouton dans le formulaire

- [ ] ⏳ 🟢 **AI - Suggestions de Formations**
  - Endpoint: `POST /api/ai/suggest-formations`
  - Input: Profil salarié, Secteur, OPCO
  - Suggestions avec Gemini
  - Output: Liste de formations recommandées
  - Affichage dans le formulaire

- [ ] ⏳ 🟡 **AI - Vérification de Conformité**
  - Endpoint: `POST /api/ai/check-compliance`
  - Input: Dossier complet
  - Analyse avec Gemini
  - Output: Liste des problèmes + Suggestions
  - Affichage avant envoi à l'OPCO

---

## Phase 3: Dashboard Admin

### 3.1 Dashboard Admin - Vue d'Ensemble

- [ ] ⏳ 🔴 **Page Admin Dashboard**
  - Route: `/admin/dashboard`
  - Protection: Admin only
  - KPIs: Total dossiers, En cours, Validés, Montant engagé, Taux d'acceptation
  - Alertes: Dossiers à valider, Compléments demandés, Retards, Messages non lus
  - Graphiques: Évolution dossiers, Répartition par statut, Par OPCO, Par type

- [ ] ⏳ 🔴 **API Admin - Stats Globales**
  - Endpoint: `GET /api/admin/stats`
  - Retour: Toutes les statistiques pour le dashboard
  - Cache: 5 minutes

### 3.2 Dashboard Admin - Gestion des Dossiers

- [ ] ⏳ 🔴 **Page Admin Dossiers**
  - Route: `/admin/dossiers`
  - Liste de tous les dossiers (toutes entreprises)
  - Filtres avancés: Statut, OPCO, Type, Période, Entreprise, Montant
  - Recherche globale
  - Actions en masse: Export, Email groupé

- [ ] ⏳ 🔴 **Page Admin Dossier Détail**
  - Route: `/admin/dossiers/:id`
  - Toutes les informations du dossier
  - Fiche entreprise (lien)
  - Timeline complète
  - Documents avec preview
  - Historique des emails
  - Actions admin: Valider, Demander compléments, Modifier, Relancer OPCO, Marquer comme payé, Archiver, Supprimer

- [ ] ⏳ 🔴 **API Admin - Validation Dossier**
  - Endpoint: `PUT /api/admin/dossiers/:id/validate`
  - Vérifications automatiques
  - Changement de statut vers "validé"
  - Envoi email au client
  - Log de l'action

- [ ] ⏳ 🟡 **API Admin - Demande Compléments**
  - Endpoint: `PUT /api/admin/dossiers/:id/request-complements`
  - Input: Liste des éléments manquants
  - Changement de statut vers "compléments demandés"
  - Envoi email au client
  - Log de l'action

- [ ] ⏳ 🟡 **API Admin - Relancer OPCO**
  - Endpoint: `POST /api/admin/dossiers/:id/relance-opco`
  - Génération d'un email de relance
  - Envoi à l'OPCO
  - Log de l'action

- [ ] ⏳ 🟡 **API Admin - Marquer comme Payé**
  - Endpoint: `PUT /api/admin/dossiers/:id/mark-paid`
  - Input: Montant reçu, Date, Référence
  - Changement de statut vers "payé"
  - Envoi email au client
  - Log de l'action

- [ ] ⏳ 🟡 **Checklist de Validation Admin**
  - Composant réutilisable
  - Liste des vérifications
  - Cocher/décocher chaque item
  - Commentaires optionnels
  - Validation finale

### 3.3 Dashboard Admin - Gestion des Entreprises

- [ ] ⏳ 🟡 **Page Admin Entreprises**
  - Route: `/admin/entreprises`
  - Liste de toutes les entreprises clientes
  - Colonnes: Nom, SIRET, Contact, Nb dossiers, Montant total, Dernière activité
  - Filtres: Par secteur, Par OPCO, Par activité
  - Recherche

- [ ] ⏳ 🟡 **Page Admin Entreprise Détail**
  - Route: `/admin/entreprises/:id`
  - Fiche complète de l'entreprise
  - Historique de tous les dossiers
  - Statistiques: Nb dossiers, Montant total, Taux d'acceptation
  - Historique des emails
  - Notes internes
  - Actions: Créer un dossier, Envoyer un email, Archiver

- [ ] ⏳ 🟡 **API Admin - Entreprises List**
  - Endpoint: `GET /api/admin/entreprises`
  - Filtres et pagination
  - Retour: Liste des entreprises avec stats

- [ ] ⏳ 🟡 **API Admin - Entreprise Détail**
  - Endpoint: `GET /api/admin/entreprises/:id`
  - Retour: Fiche complète + dossiers + emails

### 3.4 Dashboard Admin - Communication

- [ ] ⏳ 🟡 **Composant Email Editor**
  - Templates pré-remplis
  - Éditeur WYSIWYG (optionnel)
  - Variables dynamiques
  - Preview
  - Envoi

- [ ] ⏳ 🟡 **API Admin - Send Email**
  - Endpoint: `POST /api/admin/emails/send`
  - Input: recipient, subject, body, template
  - Envoi via Resend
  - Insertion en base
  - Log

- [ ] ⏳ 🟢 **Messagerie Interne (Optionnel)**
  - Chat en temps réel avec les clients
  - Historique des conversations
  - Notifications

### 3.5 Dashboard Admin - Rapports

- [ ] ⏳ 🟡 **Page Admin Rapports**
  - Route: `/admin/rapports`
  - Sélection du type de rapport
  - Sélection de la période
  - Génération et affichage
  - Export Excel/PDF

- [ ] ⏳ 🟡 **API Admin - Rapport Mensuel**
  - Endpoint: `GET /api/admin/rapports/mensuel`
  - Input: Mois, Année
  - Retour: Statistiques complètes du mois

- [ ] ⏳ 🟡 **API Admin - Rapport par OPCO**
  - Endpoint: `GET /api/admin/rapports/opco`
  - Input: Période
  - Retour: Statistiques par OPCO (comparaison)

- [ ] ⏳ 🟡 **API Admin - Rapport Financier**
  - Endpoint: `GET /api/admin/rapports/financier`
  - Input: Période
  - Retour: Montants engagés, payés, en attente

- [ ] ⏳ 🟡 **API Admin - Rapport Performance**
  - Endpoint: `GET /api/admin/rapports/performance`
  - Input: Période
  - Retour: Délais moyens, Taux d'acceptation, Satisfaction

- [ ] ⏳ 🟡 **Export Excel**
  - Utiliser `exceljs`
  - Génération de fichiers Excel
  - Endpoint: `GET /api/admin/rapports/:type/export`

- [ ] ⏳ 🟢 **Export PDF**
  - Utiliser Puppeteer
  - Génération de PDF à partir des rapports HTML
  - Endpoint: `GET /api/admin/rapports/:type/export-pdf`

### 3.6 Dashboard Admin - Gestion des Utilisateurs

- [ ] ⏳ 🟢 **Page Admin Utilisateurs**
  - Route: `/admin/utilisateurs`
  - Liste des admins
  - Colonnes: Nom, Email, Rôle, Dernière connexion, Statut
  - Actions: Créer, Modifier, Désactiver

- [ ] ⏳ 🟢 **API Admin - Users List**
  - Endpoint: `GET /api/admin/users`
  - Retour: Liste des admins

- [ ] ⏳ 🟢 **API Admin - Create User**
  - Endpoint: `POST /api/admin/users`
  - Input: Email, Nom, Rôle
  - Génération d'un mot de passe temporaire
  - Envoi d'email d'invitation

- [ ] ⏳ 🟢 **API Admin - Update User**
  - Endpoint: `PUT /api/admin/users/:id`
  - Modification des permissions

- [ ] ⏳ 🟢 **API Admin - Deactivate User**
  - Endpoint: `DELETE /api/admin/users/:id`
  - Désactivation du compte

---

## Phase 4: Fonctionnalités Avancées

### 4.1 Suivi des Paiements

- [ ] ⏳ 🟡 **Page Admin Paiements**
  - Route: `/admin/paiements`
  - Liste des dossiers en attente de paiement
  - Colonnes: Dossier, Entreprise, Montant attendu, Date limite, Statut
  - Filtres: Par statut, Par OPCO, Par période
  - Actions: Marquer comme payé, Relancer

- [ ] ⏳ 🟡 **API Admin - Payments List**
  - Endpoint: `GET /api/admin/payments`
  - Filtres et pagination
  - Retour: Liste des paiements

- [ ] ⏳ 🟡 **API Admin - Mark as Paid**
  - Endpoint: `PUT /api/admin/payments/:id/mark-paid`
  - Input: Montant, Date, Référence
  - Mise à jour du dossier
  - Envoi email au client

- [ ] ⏳ 🟢 **Rapprochement Bancaire (Optionnel)**
  - Import des virements bancaires (CSV)
  - Rapprochement automatique avec les dossiers
  - Identification des paiements non rapprochés

### 4.2 Logs et Audit Trail

- [ ] ⏳ 🟡 **Logging Automatique**
  - Middleware de logging pour toutes les actions
  - Insertion en table `logs`
  - Capture: user_id, action, entity, details, IP, user agent

- [ ] ⏳ 🟡 **Page Admin Logs**
  - Route: `/admin/logs`
  - Liste de tous les logs
  - Filtres: Par user, Par action, Par entity, Par période
  - Recherche
  - Export

- [ ] ⏳ 🟡 **API Admin - Logs List**
  - Endpoint: `GET /api/admin/logs`
  - Filtres et pagination
  - Retour: Liste des logs

### 4.3 Analyse Prédictive AI Avancée

- [ ] ⏳ 🟢 **AI - Prédiction du Délai**
  - Endpoint: `POST /api/ai/predict-delay`
  - Input: Dossier, OPCO
  - Analyse historique
  - Output: Délai estimé (jours)

- [ ] ⏳ 🟢 **AI - Identification des Patterns**
  - Analyse des dossiers refusés
  - Identification des erreurs fréquentes
  - Recommandations pour améliorer le taux d'acceptation

- [ ] ⏳ 🟢 **AI - Chatbot Support Client**
  - Intégration d'un chatbot sur le site
  - Réponses automatiques aux questions fréquentes
  - Escalade vers un humain si nécessaire

---

## Phase 5: Qualité et Performance

### 5.1 Tests Automatisés

- [ ] ⏳ 🟡 **Setup Jest + React Testing Library**
  - Configuration
  - Premier test de smoke

- [ ] ⏳ 🟡 **Tests Unitaires - Frontend**
  - Composants critiques: Login, Register, DossierForm, Dashboard
  - Services: authService, dataService
  - Couverture: 70%

- [ ] ⏳ 🟡 **Tests Unitaires - Backend**
  - API Auth
  - API Dossiers
  - API Documents
  - Couverture: 80%

- [ ] ⏳ 🟡 **Tests d'Intégration - API**
  - Utiliser Supertest
  - Tester les flows complets: Register → Login → Create Dossier → Upload Document

- [ ] ⏳ 🟢 **Tests E2E - Playwright**
  - Flow utilisateur complet: Register → Create Dossier → Submit
  - Flow admin: Login → Validate Dossier → Send Email

- [ ] ⏳ 🟡 **CI/CD - GitHub Actions**
  - Exécuter les tests sur chaque commit
  - Bloquer le merge si tests échouent

### 5.2 Optimisations Performance

- [ ] ⏳ 🟡 **Frontend - Code Splitting**
  - React.lazy pour les pages
  - Lazy loading des composants lourds

- [ ] ⏳ 🟡 **Frontend - Image Optimization**
  - Lazy loading des images
  - Compression des images
  - WebP format

- [ ] ⏳ 🟡 **Backend - Cache**
  - Utiliser Vercel KV (Redis)
  - Cache des résultats API (SIRET lookup, stats)
  - TTL: 1 heure

- [ ] ⏳ 🟡 **Backend - Pagination**
  - Toutes les listes: Max 50 items par page
  - Pagination côté serveur

- [ ] ⏳ 🟡 **Database - Indexes**
  - Vérifier tous les indexes
  - Ajouter des indexes manquants
  - Analyser les slow queries

- [ ] ⏳ 🟡 **Database - Connection Pooling**
  - Configurer le pool de connexions
  - Limiter le nombre de connexions

### 5.3 Monitoring et Alertes

- [ ] ⏳ 🟡 **Setup Sentry**
  - Frontend: Capture des erreurs React
  - Backend: Capture des erreurs API
  - Alertes par email

- [ ] ⏳ 🟡 **Setup Vercel Analytics**
  - Activer Web Analytics
  - Suivre les Core Web Vitals

- [ ] ⏳ 🟡 **Uptime Monitoring**
  - Utiliser UptimeRobot ou Pingdom
  - Monitoring des endpoints critiques
  - Alertes si down

- [ ] ⏳ 🟢 **Custom Monitoring Dashboard**
  - Dashboard interne avec métriques
  - Grafana + Prometheus (optionnel)

### 5.4 Sécurité

- [ ] ⏳ 🟡 **Rate Limiting**
  - Limiter les requêtes API: 100/min par IP
  - Utiliser Vercel Edge Middleware

- [ ] ⏳ 🟡 **CORS Configuration**
  - Configurer correctement les origines autorisées
  - Vercel.json

- [ ] ⏳ 🟡 **Security Headers**
  - Utiliser Helmet.js
  - CSP, X-Frame-Options, etc.

- [ ] ⏳ 🟡 **Input Validation**
  - Validation côté frontend (UX)
  - Validation côté backend (sécurité)
  - Sanitization (prévention XSS)

- [ ] ⏳ 🟡 **CSRF Protection**
  - Tokens CSRF pour les formulaires
  - Vérification côté backend

- [ ] ⏳ 🟡 **SQL Injection Prevention**
  - Utiliser des requêtes paramétrées
  - Jamais de concaténation de strings

- [ ] ⏳ 🟢 **Penetration Testing**
  - Audit de sécurité externe
  - Correction des vulnérabilités

### 5.5 Documentation

- [ ] ⏳ 🟡 **Documentation API**
  - Swagger/OpenAPI
  - Endpoints, paramètres, exemples
  - Héberger sur /api/docs

- [ ] ⏳ 🟡 **Documentation Utilisateur**
  - Guide d'utilisation
  - FAQ complète
  - Tutoriels vidéo (optionnel)

- [ ] ⏳ 🟡 **Documentation Admin**
  - Guide d'administration
  - Procédures de validation
  - Gestion des incidents

- [ ] ⏳ 🟡 **Documentation Technique**
  - Architecture
  - Setup local
  - Déploiement
  - Contribution

---

## Phase 6: Production Ready

### 6.1 Tests A-Z Complets

- [ ] ⏳ 🔴 **Tests Utilisateur - Flow Complet Bilan**
  - Register → Login → Create Dossier Bilan → Upload Documents → Submit → Track Status → Receive Validation → Send Justificatifs → Receive Payment

- [ ] ⏳ 🔴 **Tests Utilisateur - Flow Complet Formation**
  - Même flow avec Formation au lieu de Bilan

- [ ] ⏳ 🔴 **Tests Admin - Flow Complet**
  - Login Admin → View Dashboard → Validate Dossier → Send Email → Mark as Paid → Generate Report

- [ ] ⏳ 🟡 **Tests de Charge**
  - Simuler 100 utilisateurs simultanés
  - Vérifier les performances
  - Identifier les bottlenecks

- [ ] ⏳ 🟡 **Tests de Sécurité**
  - Tester les injections SQL
  - Tester les XSS
  - Tester les CSRF
  - Tester l'authentification

- [ ] ⏳ 🟡 **Tests de Compatibilité**
  - Chrome, Firefox, Safari, Edge
  - Desktop, Tablet, Mobile
  - iOS, Android

### 6.2 Corrections Finales

- [ ] ⏳ 🔴 **Corriger tous les bugs critiques**
  - Liste des bugs identifiés lors des tests
  - Priorisation
  - Correction

- [ ] ⏳ 🟡 **Corriger tous les bugs importants**
  - Bugs non bloquants mais gênants

- [ ] ⏳ 🟢 **Améliorer l'UX**
  - Feedback utilisateurs
  - Ajustements UI/UX

### 6.3 Déploiement Production

- [ ] ⏳ 🔴 **Setup Environnement Staging**
  - URL: staging.monopco.fr
  - Database: Neon Staging
  - Variables d'environnement

- [ ] ⏳ 🔴 **Tests sur Staging**
  - Tests A-Z complets sur staging
  - Validation finale

- [ ] ⏳ 🔴 **Migration Database Production**
  - Backup de la database actuelle
  - Exécution des migrations
  - Vérification

- [ ] ⏳ 🔴 **Déploiement Production**
  - Merge vers main
  - Vérification du déploiement Vercel
  - Tests smoke sur production

- [ ] ⏳ 🟡 **Configuration DNS**
  - Vérifier que monopco.fr pointe vers Vercel
  - Vérifier les certificats SSL

- [ ] ⏳ 🟡 **Configuration Emails**
  - Vérifier que le domaine est configuré sur Resend
  - Tester l'envoi d'emails depuis production

### 6.4 Formation et Support

- [ ] ⏳ 🟡 **Formation des Admins**
  - Session de formation pour l'équipe Netz Informatique
  - Démonstration du dashboard admin
  - Procédures de validation
  - Gestion des incidents

- [ ] ⏳ 🟡 **Documentation Support**
  - FAQ pour le support client
  - Réponses aux questions fréquentes
  - Procédures de résolution des problèmes

- [ ] ⏳ 🟢 **Vidéos Tutoriels**
  - Vidéo: Comment créer un dossier
  - Vidéo: Comment suivre un dossier
  - Vidéo: Comment utiliser le dashboard admin

### 6.5 Lancement

- [ ] ⏳ 🟡 **Annonce Officielle**
  - Email aux clients existants (si applicable)
  - Post sur les réseaux sociaux
  - Communiqué de presse (optionnel)

- [ ] ⏳ 🟡 **Monitoring Intensif**
  - Surveiller les erreurs
  - Surveiller les performances
  - Réagir rapidement aux problèmes

- [ ] ⏳ 🟡 **Support Réactif**
  - Répondre rapidement aux questions
  - Corriger les bugs rapidement
  - Collecter les feedbacks

---

## Backlog (Nice to Have)

### Fonctionnalités Futures

- [ ] 🔵 **Multi-langue** - Support de l'anglais
- [ ] 🔵 **Mobile App** - Application mobile native
- [ ] 🔵 **Intégration OPCO** - API directes avec les OPCO (si disponibles)
- [ ] 🔵 **Signature Électronique** - Intégration DocuSign ou similaire
- [ ] 🔵 **Comptabilité** - Export pour logiciels comptables
- [ ] 🔵 **Marketplace** - Annuaire des organismes de formation
- [ ] 🔵 **Comparateur** - Comparer les formations et les prix
- [ ] 🔵 **Recommandations AI** - Recommandations personnalisées de formations
- [ ] 🔵 **Gamification** - Badges, points pour encourager l'utilisation
- [ ] 🔵 **Intégration RH** - Intégration avec logiciels RH (Payfit, etc.)

---

## Statistiques

**Total des Tâches:** 200+  
**Terminées:** 13  
**En cours:** 0  
**À faire:** 187+

**Progression Globale:** ~6.5%

**Estimation Temps Total:** 11 semaines (avec une équipe de 2-3 développeurs)

---

**Note:** Ce TODO est un document vivant qui sera mis à jour au fur et à mesure de l'avancement du projet. Les priorités peuvent être ajustées en fonction des besoins et des feedbacks.

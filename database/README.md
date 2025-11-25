# Database Migrations

Ce dossier contient les migrations de base de données pour MonOPCO.fr.

## Prérequis

Les migrations nécessitent que la variable d'environnement `DATABASE_URL` soit configurée dans Vercel.

## Migrations Disponibles

1. **001_create_users_and_tables.sql** - Crée les tables principales (users, documents, emails, payments, logs)
2. **002_add_refresh_tokens.sql** - Ajoute la table refresh_tokens pour l'authentification JWT

## Exécution des Migrations

### En Local (si DATABASE_URL est configuré)

```bash
node database/run-migrations.mjs
```

### Sur Vercel (Production)

Les migrations doivent être exécutées manuellement via le dashboard Neon ou via un script de déploiement.

**Option 1: Via Neon Dashboard**
1. Aller sur https://console.neon.tech
2. Sélectionner votre projet
3. Aller dans "SQL Editor"
4. Copier-coller le contenu de chaque fichier .sql
5. Exécuter

**Option 2: Via psql**
```bash
psql $DATABASE_URL -f database/migrations/001_create_users_and_tables.sql
psql $DATABASE_URL -f database/migrations/002_add_refresh_tokens.sql
```

## Structure des Tables

### users
- Authentification et profil utilisateur
- Colonnes: id, email, password_hash, entreprise_siret, entreprise_nom, contact_nom, role, etc.

### refresh_tokens
- Gestion des refresh tokens JWT
- Colonnes: id, user_id, token, expires_at, created_at

### documents
- Stockage des métadonnées des documents uploadés
- Colonnes: id, dossier_id, nom, type, url, taille, uploaded_by, uploaded_at

### emails
- Historique des emails envoyés
- Colonnes: id, dossier_id, recipient_email, subject, body, template, sent_at, status

### payments
- Suivi des paiements OPCO
- Colonnes: id, dossier_id, montant_attendu, montant_recu, date_reception, reference, statut

### logs
- Audit trail de toutes les actions
- Colonnes: id, user_id, action, entity_type, entity_id, details (JSONB), ip_address, user_agent, created_at

## Notes

- Les migrations sont idempotentes (peuvent être exécutées plusieurs fois sans erreur)
- Utilisation de `IF NOT EXISTS` et `DO $$` pour éviter les erreurs
- Les indexes sont créés automatiquement pour optimiser les performances

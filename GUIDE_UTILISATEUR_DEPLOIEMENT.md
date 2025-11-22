# Guide Utilisateur - Déploiement MonOPCO

Ce document liste **toutes les actions que VOUS devez effectuer** pour déployer et finaliser MonOPCO en production.

---

## ✅ Déjà Fait (par l'IA)

- ✅ Code complet poussé sur GitHub : https://github.com/lekesiz/monopco.fr
- ✅ Base de données configurée (Manus)
- ✅ Domaine acheté : monopco.fr
- ✅ APIs intégrées : Pappers, Resend, CFADock
- ✅ Génération de 5 documents PDF OPCO
- ✅ Dashboard Kanban avec statistiques
- ✅ Module de facturation
- ✅ Système de rappels automatiques (CRON)
- ✅ Documentation complète

---

## 📋 Actions à Effectuer (PAR VOUS)

### 🔴 PRIORITÉ 1 : Déploiement Vercel (30 minutes)

#### Étape 1 : Créer un Compte Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur **"Sign Up"**
3. Choisir **"Continue with GitHub"**
4. Autoriser Vercel à accéder à votre compte GitHub

#### Étape 2 : Importer le Projet

1. Sur Vercel Dashboard, cliquer sur **"Add New..." → "Project"**
2. Chercher le dépôt : `lekesiz/monopco.fr`
3. Cliquer sur **"Import"**

#### Étape 3 : Configurer le Build

**Framework Preset:** Vite  
**Root Directory:** `./`  
**Build Command:** `pnpm build`  
**Output Directory:** `dist`  
**Install Command:** `pnpm install`

**⚠️ IMPORTANT:** Ne pas cliquer sur "Deploy" tout de suite !

#### Étape 4 : Ajouter les Variables d'Environnement

Cliquer sur **"Environment Variables"** et ajouter :

```env
# Base de données (COPIER depuis Manus Dashboard)
DATABASE_URL=mysql://...

# JWT (COPIER depuis Manus Dashboard)
JWT_SECRET=...

# OAuth (COPIER depuis Manus Dashboard)
VITE_APP_ID=...
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=...
OWNER_NAME=...

# App Config
VITE_APP_TITLE=MonOPCO
VITE_APP_LOGO=/logo-monopco.png

# Forge API (COPIER depuis Manus Dashboard)
BUILT_IN_FORGE_API_URL=...
BUILT_IN_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_URL=...

# Pappers API (VOUS L'AVEZ DÉJÀ)
PAPPERS_API_KEY=votre_cle_pappers

# Resend API (VOUS L'AVEZ DÉJÀ)
RESEND_API_KEY=votre_cle_resend

# CRON Secret (GÉNÉRER UN NOUVEAU)
CRON_SECRET=GENERER_UN_SECRET_ALEATOIRE
```

**Comment générer CRON_SECRET :**

Option 1 - En ligne :
1. Aller sur [randomkeygen.com](https://randomkeygen.com)
2. Copier une clé "Fort Knox Passwords"

Option 2 - Terminal :
```bash
openssl rand -base64 32
```

#### Étape 5 : Déployer

1. Cliquer sur **"Deploy"**
2. Attendre 2-3 minutes
3. Vérifier que le build est réussi (✅ vert)
4. Cliquer sur le lien de preview (ex: `monopco-git-main-lekesiz.vercel.app`)
5. Tester que le site fonctionne

#### Étape 6 : Configurer le Domaine monopco.fr

1. Sur Vercel Dashboard → Project Settings → **Domains**
2. Cliquer sur **"Add"**
3. Entrer : `monopco.fr`
4. Cliquer sur **"Add"**
5. Vercel affiche les DNS à configurer

**Configurer les DNS chez votre Registrar (IONOS/OVH) :**

Aller sur votre registrar → Gestion DNS → Ajouter :

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

6. Attendre 15-30 minutes (propagation DNS)
7. Vérifier sur Vercel que le domaine est validé (✅ vert)
8. Tester : https://monopco.fr

#### Étape 7 : Activer Vercel Pro (REQUIS pour CRON)

⚠️ **IMPORTANT:** Le plan gratuit ne supporte pas les CRON Jobs. Vous DEVEZ passer à Vercel Pro pour activer les rappels automatiques quotidiens.

1. Sur Vercel Dashboard → Settings → **Billing**
2. Cliquer sur **"Upgrade to Pro"**
3. Entrer les informations de paiement
4. **Prix:** 20$/mois (environ 18€/mois)

5. Vérifier que le CRON est actif :
   - Aller sur Project → **Cron Jobs**
   - Vous devriez voir : `/api/cron/daily-reminders` - `0 9 * * *` (tous les jours à 9h00)

---

### 🟡 PRIORITÉ 2 : Configuration Resend Email (15 minutes)

#### Étape 1 : Ajouter le Domaine dans Resend

1. Aller sur [resend.com](https://resend.com)
2. Se connecter
3. Aller dans **"Domains"** (menu gauche)
4. Cliquer sur **"Add Domain"**
5. Entrer : `monopco.fr`
6. Cliquer sur **"Add"**

#### Étape 2 : Configurer les DNS

Resend affiche 3 enregistrements DNS à ajouter :

**Aller chez votre registrar → Gestion DNS → Ajouter :**

```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
TTL: 3600
```

```
Type: TXT
Name: resend._domainkey
Value: [COPIER la longue clé fournie par Resend]
TTL: 3600
```

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@monopco.fr
TTL: 3600
```

#### Étape 3 : Vérifier le Domaine

1. Attendre 15-30 minutes (propagation DNS)
2. Sur Resend → Domains → Cliquer sur **"Verify"**
3. Vérifier que les 3 enregistrements sont validés (✅ vert)

#### Étape 4 : Tester l'Envoi d'Email

1. Sur Resend → Domains → monopco.fr → **"Send Test Email"**
2. From : `noreply@monopco.fr`
3. To : `votre-email@example.com`
4. Subject : `Test MonOPCO`
5. Body : `Email de test depuis MonOPCO`
6. Cliquer sur **"Send"**
7. Vérifier que l'email arrive bien dans votre boîte

---

### 🟢 PRIORITÉ 3 : Tests de Production (30 minutes)

#### Test 1 : Formulaire SIRET

1. Aller sur https://monopco.fr
2. Cliquer sur **"Créer un Dossier"**
3. Entrer un SIRET valide : `44306184100047` (Google France)
4. Cliquer sur **"Continuer"**
5. ✅ Vérifier que les données entreprise sont récupérées automatiquement
6. ✅ Vérifier que l'OPCO est détecté automatiquement

#### Test 2 : Création de Dossier

1. Remplir le formulaire complet :
   - Bénéficiaire : Nom, Prénom, Email
   - Type : Bilan de Compétences
   - Dates : Date début, Date fin
2. Cliquer sur **"Créer le dossier"**
3. ✅ Vérifier que le dossier est créé
4. ✅ Vérifier que vous recevez un email de confirmation

#### Test 3 : Dashboard

1. Aller sur https://monopco.fr/dashboard
2. ✅ Vérifier que le dossier apparaît dans la colonne "Nouveau"
3. Cliquer sur le dossier pour voir les détails
4. ✅ Vérifier que toutes les informations sont correctes

#### Test 4 : Génération PDF

1. Sur la page détail dossier, cliquer sur **"Générer Convention Tripartite"**
2. ✅ Vérifier que le PDF se télécharge
3. ✅ Ouvrir le PDF et vérifier que les données sont correctes
4. Répéter pour les 4 autres documents

#### Test 5 : Statistiques

1. Aller sur https://monopco.fr/stats
2. ✅ Vérifier que les graphiques s'affichent correctement
3. ✅ Vérifier que les KPI sont corrects

#### Test 6 : Export Excel

1. Sur le Dashboard, cliquer sur **"Exporter Excel"**
2. ✅ Vérifier que le fichier Excel se télécharge
3. ✅ Ouvrir le fichier et vérifier que les données sont correctes

#### Test 7 : Facturation

1. Aller sur https://monopco.fr/facturation
2. Changer le statut d'un dossier en "Facturé"
3. ✅ Vérifier que le dossier apparaît dans la liste
4. Cliquer sur **"Générer Facture"**
5. ✅ Vérifier que le PDF de facture se télécharge

---

### 🔵 OPTIONNEL : Signature Électronique Yousign (1 heure)

⚠️ **Note:** Cette étape est optionnelle mais fortement recommandée pour permettre la signature numérique des conventions.

#### Étape 1 : Créer un Compte Yousign

1. Aller sur [yousign.com](https://yousign.com)
2. Cliquer sur **"Essai gratuit"** (14 jours gratuits)
3. Créer un compte

#### Étape 2 : Récupérer la Clé API

1. Sur Yousign Dashboard → Settings → **API Keys**
2. Cliquer sur **"Create API Key"**
3. Copier la clé API

#### Étape 3 : Ajouter la Clé dans Vercel

1. Sur Vercel Dashboard → Project Settings → **Environment Variables**
2. Ajouter :
   ```
   YOUSIGN_API_KEY=votre_cle_yousign
   ```
3. Cliquer sur **"Save"**
4. Redéployer le projet (Vercel le fait automatiquement)

#### Étape 4 : Implémenter le Code

⚠️ **Note:** Le code d'intégration Yousign est déjà documenté dans `SIGNATURE_ELECTRONIQUE.md`. Vous devrez :

1. Créer `server/yousignService.ts` (code fourni dans la doc)
2. Ajouter les procédures tRPC (code fourni dans la doc)
3. Mettre à jour le schéma DB (ajouter `signatureRequestId` et `signatureStatus`)
4. Ajouter le bouton "Envoyer pour Signature" dans le Dashboard

**Temps estimé:** 1-2 heures de développement

**Alternative:** Demander à l'IA de le faire pour vous en disant "implémente la signature électronique Yousign selon SIGNATURE_ELECTRONIQUE.md"

---

## 📊 Récapitulatif des Coûts Mensuels

| Service | Plan | Prix | Requis ? |
|---------|------|------|----------|
| Vercel Pro | Pro | 20$/mois | ✅ OUI (CRON) |
| Resend | Starter | 10€/mois | ✅ OUI (Emails) |
| Pappers | Starter | 29€/mois | ✅ OUI (SIRET) |
| Yousign | Starter | 10€/mois | ⚠️ Optionnel |
| **TOTAL** | | **~69€/mois** | |

**Avec Yousign:** ~79€/mois

---

## 🆘 En Cas de Problème

### Problème 1 : Le build Vercel échoue

**Solution:**
1. Vérifier les logs Vercel Dashboard → Deployments → Cliquer sur le déploiement → **"View Function Logs"**
2. Chercher l'erreur
3. Vérifier que toutes les variables d'environnement sont bien configurées

### Problème 2 : Les emails ne partent pas

**Solution:**
1. Vérifier que le domaine Resend est bien vérifié (✅ vert)
2. Vérifier que les DNS sont bien configurés
3. Tester l'envoi d'email depuis Resend Dashboard
4. Vérifier les logs Vercel pour voir les erreurs

### Problème 3 : L'API Pappers ne fonctionne pas

**Solution:**
1. Vérifier que `PAPPERS_API_KEY` est bien configurée dans Vercel
2. Tester la clé API sur [pappers.fr/api](https://www.pappers.fr/api)
3. Vérifier que vous avez des crédits Pappers restants

### Problème 4 : Le CRON ne s'exécute pas

**Solution:**
1. Vérifier que vous êtes bien sur Vercel Pro
2. Vérifier que le CRON est actif dans Vercel Dashboard → Cron Jobs
3. Vérifier les logs : Vercel Dashboard → Functions → Chercher `/api/cron/daily-reminders`

### Problème 5 : Le domaine monopco.fr ne fonctionne pas

**Solution:**
1. Vérifier que les DNS sont bien configurés chez votre registrar
2. Attendre 24h maximum (propagation DNS)
3. Tester avec [whatsmydns.net](https://www.whatsmydns.net) → Entrer `monopco.fr`
4. Vérifier que Vercel affiche le domaine en ✅ vert

---

## ✅ Checklist Finale

Avant de considérer le déploiement comme terminé, vérifier :

- [ ] ✅ Site accessible sur https://monopco.fr
- [ ] ✅ Certificat SSL actif (cadenas vert)
- [ ] ✅ Formulaire SIRET fonctionne
- [ ] ✅ Création de dossier fonctionne
- [ ] ✅ Email de confirmation reçu
- [ ] ✅ Dashboard affiche les dossiers
- [ ] ✅ Génération des 5 PDF fonctionne
- [ ] ✅ Page Statistiques affiche les graphiques
- [ ] ✅ Export Excel fonctionne
- [ ] ✅ Page Facturation fonctionne
- [ ] ✅ CRON actif (Vercel Pro)
- [ ] ✅ Domaine Resend vérifié
- [ ] ✅ Pas d'erreurs dans les logs Vercel

---

## 🎉 Félicitations !

Une fois toutes ces étapes complétées, MonOPCO sera 100% opérationnel en production ! 🚀

**Support:**
- Documentation complète dans le dépôt GitHub
- En cas de problème technique, contacter Netz Informatique

---

## 📝 Prochaines Améliorations Suggérées

1. **Signature électronique Yousign** (voir `SIGNATURE_ELECTRONIQUE.md`)
2. **Templates PDF personnalisables** (permettre de modifier logo, coordonnées, mentions légales)
3. **Notifications Slack/Discord** (alertes en temps réel pour nouveaux dossiers)
4. **API publique** (permettre aux partenaires de créer des dossiers via API)
5. **Module de reporting** (rapports mensuels automatiques par OPCO)

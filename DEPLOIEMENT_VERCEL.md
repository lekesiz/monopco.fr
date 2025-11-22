# Déploiement Vercel - MonOPCO

Ce document explique comment déployer MonOPCO sur Vercel en production.

---

## 🎯 Prérequis

- ✅ Compte Vercel (gratuit ou Pro)
- ✅ Dépôt GitHub : https://github.com/lekesiz/monopco.fr
- ✅ Domaine : monopco.fr (déjà acheté)
- ✅ Base de données MySQL/TiDB (fournie par Manus)

---

## 📋 Étapes de Déploiement

### 1. Connecter le Dépôt GitHub à Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur **"New Project"**
3. Importer le dépôt : `lekesiz/monopco.fr`
4. Autoriser Vercel à accéder au dépôt

### 2. Configurer le Projet

**Framework Preset:** Vite  
**Root Directory:** `./`  
**Build Command:** `pnpm build`  
**Output Directory:** `dist`  
**Install Command:** `pnpm install`

### 3. Configurer les Variables d'Environnement

Dans Vercel Dashboard → Project Settings → Environment Variables, ajouter :

#### Variables Système (Déjà configurées dans Manus)

```env
DATABASE_URL=mysql://...
JWT_SECRET=...
VITE_APP_ID=...
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=...
OWNER_NAME=...
VITE_APP_TITLE=MonOPCO
VITE_APP_LOGO=/logo-monopco.png
BUILT_IN_FORGE_API_URL=...
BUILT_IN_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_URL=...
```

#### Variables Personnalisées (À ajouter)

```env
# API Pappers (Données entreprises)
PAPPERS_API_KEY=votre_cle_pappers

# Resend (Notifications email)
RESEND_API_KEY=votre_cle_resend

# CRON Secret (Sécurité)
CRON_SECRET=generer_un_secret_aleatoire

# Yousign (Signature électronique) - Optionnel
YOUSIGN_API_KEY=votre_cle_yousign
```

**Générer un CRON_SECRET :**

```bash
openssl rand -base64 32
```

### 4. Configurer le Domaine Personnalisé

1. Aller sur Vercel Dashboard → Project Settings → Domains
2. Ajouter `monopco.fr` et `www.monopco.fr`
3. Configurer les DNS chez votre registrar (IONOS/OVH) :

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Attendre la propagation DNS (15-30 minutes)
5. Vercel génère automatiquement le certificat SSL

### 5. Déployer

1. Cliquer sur **"Deploy"**
2. Attendre la fin du build (~2-3 minutes)
3. Vérifier que le déploiement est réussi
4. Tester l'application sur `https://monopco.fr`

---

## 🔧 Configuration Post-Déploiement

### 1. Vérifier le CRON

Le fichier `vercel.json` configure automatiquement le CRON :

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Vérifier dans Vercel Dashboard → Cron Jobs** que le CRON est bien actif.

### 2. Tester les Emails Resend

1. Configurer le domaine `monopco.fr` dans Resend (voir `GUIDE_EMAIL.md`)
2. Créer un dossier test
3. Vérifier que l'email de confirmation arrive

### 3. Tester l'API Pappers

1. Créer un dossier avec un SIRET valide (ex: `44306184100047`)
2. Vérifier que les données entreprise sont récupérées automatiquement

### 4. Tester la Génération PDF

1. Créer un dossier complet
2. Aller dans le Dashboard → Détail dossier
3. Générer les 5 documents PDF
4. Vérifier que les PDF sont bien générés et téléchargeables

---

## 📊 Monitoring

### 1. Logs Vercel

- Aller sur Vercel Dashboard → Project → Logs
- Filtrer par type : Functions, Edge, Build
- Rechercher les erreurs

### 2. Analytics

Vercel Analytics est automatiquement activé :
- Aller sur Vercel Dashboard → Project → Analytics
- Voir les métriques : Visites, Temps de chargement, Erreurs

### 3. Alertes

Configurer des alertes Slack/Discord pour les erreurs :

1. Aller sur Vercel Dashboard → Project → Settings → Notifications
2. Ajouter une intégration Slack/Discord
3. Sélectionner les événements : Deployment Failed, Error Rate

---

## 🚀 Déploiements Automatiques

Vercel déploie automatiquement à chaque push sur `main` :

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
```

Vercel détecte le push et déploie automatiquement (~2 minutes).

---

## 🔒 Sécurité

### 1. Variables d'Environnement

✅ **Ne jamais commit** les fichiers `.env` dans Git  
✅ **Toujours utiliser** les Environment Variables de Vercel  
✅ **Régénérer** les secrets régulièrement (tous les 6 mois)

### 2. Rate Limiting

Ajouter un rate limiting sur les endpoints sensibles :

```typescript
import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requêtes par IP
  message: "Trop de requêtes, réessayez plus tard"
});

app.use("/api/", apiLimiter);
```

### 3. CORS

Configurer CORS pour autoriser uniquement `monopco.fr` :

```typescript
import cors from "cors";

app.use(cors({
  origin: ["https://monopco.fr", "https://www.monopco.fr"],
  credentials: true
}));
```

---

## 💰 Coûts Vercel

### Plan Hobby (Gratuit)

- ✅ Déploiements illimités
- ✅ 100 GB bande passante/mois
- ✅ Domaines personnalisés
- ✅ SSL automatique
- ❌ Pas de CRON (nécessite Pro)

### Plan Pro (20$/mois)

- ✅ Tout du plan Hobby
- ✅ **CRON Jobs** (requis pour MonOPCO)
- ✅ 1 TB bande passante/mois
- ✅ Analytics avancés
- ✅ Support prioritaire

**Recommandation:** Plan Pro pour activer les rappels automatiques quotidiens.

---

## 🧪 Tests Avant Production

### 1. Tester en Preview

Vercel crée automatiquement un environnement de preview pour chaque PR :

```bash
git checkout -b feature/nouvelle-fonctionnalite
git push origin feature/nouvelle-fonctionnalite
```

Vercel génère une URL de preview : `https://monopco-git-feature-nouvelle-fonctionnalite-lekesiz.vercel.app`

### 2. Checklist Avant Production

- [ ] Tester le formulaire SIRET
- [ ] Tester la création de dossier
- [ ] Tester la génération PDF
- [ ] Tester les emails Resend
- [ ] Tester le Dashboard
- [ ] Tester la page Statistiques
- [ ] Tester la page Facturation
- [ ] Vérifier les logs (pas d'erreurs)
- [ ] Vérifier les performances (< 2s chargement)
- [ ] Tester sur mobile (responsive)

---

## 🔄 Rollback en Cas de Problème

Si un déploiement cause des problèmes :

1. Aller sur Vercel Dashboard → Project → Deployments
2. Trouver le dernier déploiement fonctionnel
3. Cliquer sur **"..."** → **"Promote to Production"**
4. Le rollback est instantané

---

## 📝 Résumé

| Étape | Action | Statut |
|-------|--------|--------|
| 1 | Connecter GitHub à Vercel | ⏳ À faire |
| 2 | Configurer variables d'environnement | ⏳ À faire |
| 3 | Configurer domaine monopco.fr | ⏳ À faire |
| 4 | Déployer en production | ⏳ À faire |
| 5 | Vérifier CRON | ⏳ À faire |
| 6 | Tester emails Resend | ⏳ À faire |
| 7 | Tester API Pappers | ⏳ À faire |
| 8 | Tester génération PDF | ⏳ À faire |
| 9 | Configurer monitoring | ⏳ À faire |
| 10 | Activer Vercel Pro (CRON) | ⏳ À faire |

---

## 🆘 Support

En cas de problème :
1. Consulter la documentation Vercel : https://vercel.com/docs
2. Consulter les logs Vercel Dashboard
3. Contacter le support Vercel : support@vercel.com
4. Contacter Netz Informatique : netz@netz.fr

---

## 🎉 Félicitations !

Une fois déployé, MonOPCO sera accessible sur **https://monopco.fr** et gérera automatiquement :
- ✅ Détection SIRET/OPCO automatique
- ✅ Génération de 5 documents PDF OPCO
- ✅ Notifications email via Resend
- ✅ Rappels automatiques quotidiens (9h00)
- ✅ Dashboard Kanban avec statistiques
- ✅ Module de facturation
- ✅ Export Excel

**Bon déploiement ! 🚀**

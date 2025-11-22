# Configuration CRON pour Rappels Automatiques

Ce document explique comment configurer l'exécution quotidienne automatique des rappels email pour les dossiers MonOPCO.

---

## 🎯 Objectif

Appeler automatiquement l'endpoint `trpc.reminders.checkAndSend` **tous les jours à 9h00** pour :
- Vérifier tous les dossiers actifs
- Identifier ceux qui se terminent dans 7 jours
- Envoyer automatiquement des emails de rappel aux bénéficiaires et à Netz Informatique

---

## ⚙️ Option 1: Vercel Cron Jobs (Recommandé)

### Prérequis
- Projet déployé sur Vercel
- Plan Vercel Pro ou supérieur (Cron gratuit jusqu'à 100 exécutions/mois)

### Configuration

#### 1. Créer le fichier `vercel.json` à la racine du projet

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

**Explication du schedule:**
- `0 9 * * *` = Tous les jours à 9h00 (heure UTC)
- Format: `minute hour day month dayOfWeek`

#### 2. Créer l'endpoint CRON dans `server/_core/cron.ts`

```typescript
import { Router } from "express";
import { runDailyReminderCheck } from "../reminderService";

export const cronRouter = Router();

// Endpoint protégé par Vercel Cron Secret
cronRouter.get("/daily-reminders", async (req, res) => {
  // Vérifier le secret Vercel Cron
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("[CRON] Starting daily reminders check...");
    await runDailyReminderCheck();
    res.status(200).json({ success: true, message: "Daily reminders sent" });
  } catch (error: any) {
    console.error("[CRON] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});
```

#### 3. Enregistrer le router dans `server/_core/index.ts`

```typescript
import { cronRouter } from "./cron";

// Ajouter après les autres routers
app.use("/api/cron", cronRouter);
```

#### 4. Configurer le secret dans Vercel

1. Aller sur Vercel Dashboard → Votre projet → Settings → Environment Variables
2. Ajouter une nouvelle variable :
   - **Name:** `CRON_SECRET`
   - **Value:** Générer un secret aléatoire (ex: `openssl rand -base64 32`)
   - **Environment:** Production, Preview, Development

#### 5. Déployer sur Vercel

```bash
git add vercel.json server/_core/cron.ts server/_core/index.ts
git commit -m "feat: Add Vercel Cron for daily reminders"
git push origin main
```

#### 6. Vérifier les logs

- Aller sur Vercel Dashboard → Votre projet → Logs
- Filtrer par `/api/cron/daily-reminders`
- Vérifier que le CRON s'exécute tous les jours à 9h00

---

## ⚙️ Option 2: GitHub Actions

### Configuration

#### 1. Créer `.github/workflows/daily-reminders.yml`

```yaml
name: Daily Reminders

on:
  schedule:
    # Tous les jours à 9h00 UTC
    - cron: '0 9 * * *'
  workflow_dispatch: # Permet l'exécution manuelle

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Call Reminders Endpoint
        run: |
          curl -X POST https://monopco.fr/api/trpc/reminders.checkAndSend \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.API_SECRET }}" \
            -d '{}'
```

#### 2. Ajouter un secret GitHub

1. Aller sur GitHub → Votre repo → Settings → Secrets and variables → Actions
2. Ajouter un nouveau secret :
   - **Name:** `API_SECRET`
   - **Value:** Même valeur que `CRON_SECRET` dans Vercel

#### 3. Protéger l'endpoint tRPC

Modifier `server/routers.ts` :

```typescript
reminders: router({
  checkAndSend: protectedProcedure
    .use(async ({ ctx, next }) => {
      // Vérifier le secret pour les appels CRON
      const authHeader = ctx.req.headers.authorization;
      if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
        return next({ ctx });
      }
      // Sinon, vérifier que l'utilisateur est admin
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    })
    .mutation(async () => {
      await runDailyReminderCheck();
      return { success: true };
    })
}),
```

---

## ⚙️ Option 3: Serveur Linux avec Crontab

### Configuration

#### 1. Créer un script shell `scripts/daily-reminders.sh`

```bash
#!/bin/bash

# Configuration
API_URL="https://monopco.fr/api/trpc/reminders.checkAndSend"
API_SECRET="votre_secret_ici"

# Appeler l'endpoint
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_SECRET" \
  -d '{}'

# Logger le résultat
echo "[$(date)] Daily reminders executed" >> /var/log/monopco-cron.log
```

#### 2. Rendre le script exécutable

```bash
chmod +x scripts/daily-reminders.sh
```

#### 3. Ajouter au crontab

```bash
crontab -e
```

Ajouter la ligne suivante :

```cron
0 9 * * * /path/to/monopco/scripts/daily-reminders.sh
```

#### 4. Vérifier les logs

```bash
tail -f /var/log/monopco-cron.log
```

---

## 🧪 Test Manuel

Pour tester immédiatement sans attendre le CRON :

### Via le Dashboard (Admin uniquement)

1. Se connecter en tant qu'admin
2. Ouvrir la console navigateur (F12)
3. Exécuter :

```javascript
await trpc.reminders.checkAndSend.mutate();
```

### Via cURL

```bash
curl -X POST https://monopco.fr/api/trpc/reminders.checkAndSend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_CRON_SECRET" \
  -d '{}'
```

---

## 📊 Monitoring

### Vérifier les emails envoyés

1. Consulter les logs Resend : https://resend.com/logs
2. Vérifier l'historique des dossiers dans le Dashboard
3. Rechercher "rappel_automatique" dans les actions

### Alertes en cas d'échec

Ajouter une notification Slack/Discord en cas d'erreur :

```typescript
cronRouter.get("/daily-reminders", async (req, res) => {
  try {
    await runDailyReminderCheck();
    res.status(200).json({ success: true });
  } catch (error: any) {
    // Envoyer une alerte
    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `❌ CRON Failed: ${error.message}`
      })
    });
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🔒 Sécurité

### Bonnes pratiques

1. ✅ **Toujours utiliser un secret** pour protéger l'endpoint CRON
2. ✅ **Ne jamais exposer le secret** dans le code source (utiliser `.env`)
3. ✅ **Limiter les appels** (rate limiting) pour éviter les abus
4. ✅ **Logger toutes les exécutions** pour l'audit
5. ✅ **Tester régulièrement** le CRON en production

### Rate Limiting (Optionnel)

```typescript
import rateLimit from "express-rate-limit";

const cronLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 2, // Max 2 appels par heure
  message: "Too many CRON requests"
});

cronRouter.get("/daily-reminders", cronLimiter, async (req, res) => {
  // ...
});
```

---

## 📝 Résumé

| Méthode | Avantages | Inconvénients |
|---------|-----------|---------------|
| **Vercel Cron** | ✅ Intégré, facile, gratuit (100/mois) | ❌ Nécessite Vercel Pro |
| **GitHub Actions** | ✅ Gratuit, flexible, logs GitHub | ❌ Moins fiable que Vercel |
| **Crontab Linux** | ✅ Contrôle total, pas de limite | ❌ Nécessite un serveur dédié |

**Recommandation:** Utiliser **Vercel Cron** pour la simplicité et la fiabilité.

---

## 🆘 Support

En cas de problème :
1. Vérifier les logs Vercel/GitHub Actions
2. Tester manuellement l'endpoint
3. Vérifier que `CRON_SECRET` est bien configuré
4. Contacter Netz Informatique : netz@netz.fr

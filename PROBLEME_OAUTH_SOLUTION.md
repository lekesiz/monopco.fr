# Guide de Résolution: Problème OAuth - Boucle Infinie de Connexion

**Date:** 22 Novembre 2025  
**Priorité:** CRITIQUE  
**Statut:** Non résolu  
**Auteur:** Manus AI

---

## 🔴 Symptômes du Problème

Les utilisateurs rencontrent une boucle infinie lors de la tentative de connexion à la plateforme MonOPCO sur le domaine `monopco.fr`. Le comportement observé est le suivant:

1. L'utilisateur clique sur "Tableau de Bord" depuis la page d'accueil
2. Le système redirige vers la page de connexion Manus OAuth
3. L'utilisateur sélectionne son compte et autorise l'application
4. Après autorisation, redirection vers la page d'accueil de MonOPCO
5. L'utilisateur tente à nouveau d'accéder au Dashboard
6. Le système redirige à nouveau vers la page de connexion
7. **Boucle infinie**: retour à l'étape 2

### Comportement Attendu

Après une connexion réussie via Manus OAuth, l'utilisateur devrait pouvoir accéder au Dashboard et à toutes les pages protégées sans être redirigé vers la page de connexion.

### Impact

**Gravité:** CRITIQUE  
**Utilisateurs affectés:** Tous les utilisateurs tentant d'accéder à la plateforme  
**Fonctionnalités bloquées:** Dashboard, Nouveau Dossier, Facturation, Statistiques, Paramètres

---

## 🔍 Diagnostic du Problème

### Analyse Technique

Le problème réside dans la gestion des cookies de session OAuth. Le système utilise un cookie nommé `manus_session` pour maintenir l'état d'authentification de l'utilisateur. Ce cookie est créé lors du callback OAuth et doit être envoyé avec chaque requête pour identifier l'utilisateur connecté.

### Cause Racine

Le fichier `server/_core/cookies.ts` contient la configuration des cookies de session. Cette configuration est optimisée pour un environnement de développement local (`localhost`) mais n'est pas adaptée au domaine de production `monopco.fr`.

**Code actuel (problématique):**

```typescript
// server/_core/cookies.ts
export function getSessionCookieOptions(req: Request) {
  return {
    httpOnly: true,
    secure: req.protocol === "https",
    sameSite: "none" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  };
}
```

### Problèmes Identifiés

#### 1. Attribut `sameSite: "none"` Sans `domain`

L'attribut `sameSite: "none"` est utilisé pour permettre les cookies cross-site, ce qui est nécessaire pour OAuth. Cependant, lorsque `sameSite` est défini sur `"none"`, le navigateur exige que l'attribut `Secure` soit également défini et que le cookie spécifie un `domain` explicite.

**Conséquence:** Le cookie peut ne pas être stocké correctement par le navigateur sur `monopco.fr`.

#### 2. Absence de l'Attribut `domain`

Sans l'attribut `domain`, le cookie est créé pour le domaine exact de la requête (par exemple, `www.monopco.fr`). Si l'utilisateur accède ensuite à `monopco.fr` (sans `www`), le cookie ne sera pas envoyé, car il est lié à un sous-domaine différent.

**Conséquence:** L'utilisateur apparaît comme non connecté sur certaines variations du domaine.

#### 3. Configuration Non Adaptée à la Production

La configuration actuelle ne fait pas de distinction entre l'environnement de développement et de production. Les paramètres qui fonctionnent sur `localhost` peuvent ne pas fonctionner sur un domaine personnalisé en HTTPS.

**Conséquence:** Comportement imprévisible en production.

### Vérification du Problème

Pour confirmer le diagnostic, ouvrez les DevTools du navigateur (F12) sur `monopco.fr` après une tentative de connexion:

1. **Onglet Application → Cookies**
   - Vérifiez si le cookie `manus_session` existe
   - Si absent: le cookie n'est pas créé
   - Si présent: vérifiez les attributs `Domain`, `Secure`, `SameSite`

2. **Onglet Network**
   - Filtrez par `/api/oauth/callback`
   - Vérifiez la réponse HTTP: cherchez l'en-tête `Set-Cookie`
   - Vérifiez si le cookie est bien envoyé dans les requêtes suivantes

3. **Onglet Console**
   - Cherchez des erreurs liées aux cookies ou à CORS

---

## ✅ Solution Proposée

### Modification du Code

Remplacez la fonction `getSessionCookieOptions` dans `server/_core/cookies.ts` par le code suivant:

```typescript
// server/_core/cookies.ts
import type { Request } from "express";

export function getSessionCookieOptions(req: Request) {
  const isProduction = process.env.NODE_ENV === "production";
  const isHttps = req.protocol === "https";
  
  // Configuration de base
  const options: any = {
    httpOnly: true,
    secure: isHttps,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  };
  
  // Configuration spécifique à la production
  if (isProduction) {
    options.domain = ".monopco.fr"; // Permet www.monopco.fr et monopco.fr
    options.sameSite = "none"; // Requis pour OAuth cross-site
  } else {
    options.sameSite = "lax"; // Plus sécurisé pour le développement local
  }
  
  return options;
}
```

### Explications des Changements

#### 1. Détection de l'Environnement

```typescript
const isProduction = process.env.NODE_ENV === "production";
const isHttps = req.protocol === "https";
```

Le code détecte automatiquement si l'application s'exécute en production ou en développement. Cela permet d'appliquer des configurations différentes selon le contexte.

#### 2. Attribut `domain` en Production

```typescript
if (isProduction) {
  options.domain = ".monopco.fr";
}
```

En production, le cookie est créé pour `.monopco.fr` (avec un point au début). Cela signifie que le cookie sera envoyé pour:
- `monopco.fr`
- `www.monopco.fr`
- `app.monopco.fr`
- Tout sous-domaine de `monopco.fr`

**Important:** Le point au début est crucial. Sans lui, le cookie ne fonctionnerait que pour le domaine exact.

#### 3. `sameSite` Adaptatif

```typescript
if (isProduction) {
  options.sameSite = "none"; // OAuth cross-site
} else {
  options.sameSite = "lax"; // Développement local
}
```

- **Production (`none`):** Permet au cookie d'être envoyé dans les requêtes cross-site, ce qui est nécessaire pour OAuth (redirection depuis `manus.im` vers `monopco.fr`)
- **Développement (`lax`):** Plus sécurisé pour le développement local, empêche certaines attaques CSRF

#### 4. `secure` Dynamique

```typescript
secure: isHttps,
```

Le cookie est marqué `Secure` uniquement si la connexion utilise HTTPS. Cela empêche le cookie d'être envoyé sur des connexions non sécurisées.

---

## 🛠️ Étapes de Correction

### Étape 1: Modifier le Fichier

1. Ouvrez le fichier `server/_core/cookies.ts`
2. Remplacez la fonction `getSessionCookieOptions` par le code de la solution
3. Sauvegardez le fichier

### Étape 2: Vérifier les Variables d'Environnement

Assurez-vous que `NODE_ENV` est défini sur `"production"` dans l'environnement de production:

```bash
# Dans Manus UI → Settings → Secrets
NODE_ENV=production
```

### Étape 3: Redéployer l'Application

1. Commit les changements dans Git:
```bash
cd /home/ubuntu/monopco.fr
git add server/_core/cookies.ts
git commit -m "fix: Corriger la configuration des cookies OAuth pour monopco.fr"
git push origin main
```

2. Redéployez via Manus UI:
   - Cliquez sur le bouton "Publish"
   - Attendez la fin du déploiement

### Étape 4: Tester la Correction

1. **Vider le cache et les cookies du navigateur:**
   - Chrome/Edge: Ctrl+Shift+Delete → Cocher "Cookies" → Effacer
   - Firefox: Ctrl+Shift+Delete → Cocher "Cookies" → Effacer
   - Safari: Préférences → Confidentialité → Gérer les données → Supprimer tout

2. **Tester la connexion:**
   - Accédez à `http://monopco.fr`
   - Cliquez sur "Tableau de Bord"
   - Connectez-vous via Manus OAuth
   - Vérifiez que vous êtes redirigé vers le Dashboard
   - Actualisez la page (F5)
   - Vérifiez que vous restez connecté

3. **Vérifier les cookies dans DevTools:**
   - Ouvrez DevTools (F12)
   - Onglet Application → Cookies → `http://monopco.fr`
   - Vérifiez que `manus_session` existe avec:
     - `Domain`: `.monopco.fr`
     - `Secure`: `true`
     - `HttpOnly`: `true`
     - `SameSite`: `None`
     - `Expires`: Date dans 7 jours

4. **Tester sur différentes variations du domaine:**
   - `http://monopco.fr/dashboard`
   - `http://www.monopco.fr/dashboard` (si configuré)
   - Vérifiez que la connexion persiste

### Étape 5: Créer un Test Unitaire

Créez un test pour valider la configuration des cookies:

```typescript
// server/cookies.test.ts
import { describe, it, expect } from "vitest";
import { getSessionCookieOptions } from "./_core/cookies";

describe("getSessionCookieOptions", () => {
  it("devrait utiliser sameSite=lax en développement", () => {
    process.env.NODE_ENV = "development";
    
    const req = {
      protocol: "http",
    } as any;
    
    const options = getSessionCookieOptions(req);
    
    expect(options.sameSite).toBe("lax");
    expect(options.domain).toBeUndefined();
    expect(options.secure).toBe(false);
  });
  
  it("devrait utiliser sameSite=none et domain en production", () => {
    process.env.NODE_ENV = "production";
    
    const req = {
      protocol: "https",
    } as any;
    
    const options = getSessionCookieOptions(req);
    
    expect(options.sameSite).toBe("none");
    expect(options.domain).toBe(".monopco.fr");
    expect(options.secure).toBe(true);
  });
  
  it("devrait marquer secure=true uniquement en HTTPS", () => {
    const reqHttp = { protocol: "http" } as any;
    const reqHttps = { protocol: "https" } as any;
    
    expect(getSessionCookieOptions(reqHttp).secure).toBe(false);
    expect(getSessionCookieOptions(reqHttps).secure).toBe(true);
  });
});
```

Exécutez le test:
```bash
pnpm test server/cookies.test.ts
```

---

## 🔧 Solutions Alternatives

Si la solution principale ne fonctionne pas, voici des alternatives à essayer:

### Alternative 1: Utiliser `sameSite: "lax"` en Production

Si `sameSite: "none"` pose problème, essayez `"lax"`:

```typescript
if (isProduction) {
  options.domain = ".monopco.fr";
  options.sameSite = "lax"; // Au lieu de "none"
}
```

**Avantage:** Plus sécurisé, moins de problèmes de compatibilité  
**Inconvénient:** Peut ne pas fonctionner si OAuth implique des redirections cross-site

### Alternative 2: Utiliser un Sous-Domaine Dédié

Configurez OAuth pour utiliser un sous-domaine dédié (par exemple, `app.monopco.fr`):

```typescript
if (isProduction) {
  options.domain = "app.monopco.fr"; // Sans le point
  options.sameSite = "lax";
}
```

**Avantage:** Meilleur contrôle, plus sécurisé  
**Inconvénient:** Nécessite une configuration DNS supplémentaire

### Alternative 3: Session Basée sur JWT

Remplacer les cookies par des tokens JWT stockés dans `localStorage`:

**Avantages:**
- Pas de problèmes de cookies cross-domain
- Fonctionne sur tous les navigateurs
- Facile à déboguer

**Inconvénients:**
- Moins sécurisé (vulnérable aux attaques XSS)
- Nécessite une refonte du système d'authentification
- Plus complexe à implémenter

---

## 📊 Tableau de Comparaison des Solutions

| Solution | Complexité | Sécurité | Compatibilité | Temps Estimé |
|----------|------------|----------|---------------|--------------|
| **Solution Principale** (domain + sameSite) | Faible | Élevée | Excellente | 30 min |
| **Alternative 1** (sameSite: lax) | Faible | Très Élevée | Bonne | 15 min |
| **Alternative 2** (Sous-domaine) | Moyenne | Très Élevée | Excellente | 2 heures |
| **Alternative 3** (JWT) | Élevée | Moyenne | Excellente | 1-2 jours |

**Recommandation:** Commencer par la **Solution Principale**. Si elle ne fonctionne pas, essayer l'**Alternative 1**.

---

## 🐛 Débogage Avancé

Si le problème persiste après avoir appliqué la solution, suivez ces étapes de débogage:

### 1. Activer les Logs Détaillés

Ajoutez des logs dans `server/_core/cookies.ts`:

```typescript
export function getSessionCookieOptions(req: Request) {
  const isProduction = process.env.NODE_ENV === "production";
  const isHttps = req.protocol === "https";
  
  const options: any = {
    httpOnly: true,
    secure: isHttps,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  
  if (isProduction) {
    options.domain = ".monopco.fr";
    options.sameSite = "none";
  } else {
    options.sameSite = "lax";
  }
  
  // LOG DÉTAILLÉ
  console.log("[COOKIE CONFIG]", {
    isProduction,
    isHttps,
    protocol: req.protocol,
    host: req.get("host"),
    options,
  });
  
  return options;
}
```

Vérifiez les logs dans la console du serveur après une tentative de connexion.

### 2. Vérifier le Callback OAuth

Ajoutez des logs dans le callback OAuth (`server/_core/auth.ts` ou similaire):

```typescript
// Après la création du cookie
console.log("[OAUTH CALLBACK] Cookie set:", {
  cookieName: "manus_session",
  cookieOptions: getSessionCookieOptions(req),
  userOpenId: user.openId,
});
```

### 3. Vérifier le Context tRPC

Ajoutez des logs dans `server/_core/context.ts`:

```typescript
export async function createContext({ req, res }: CreateContextOptions) {
  const sessionToken = req.cookies[COOKIE_NAME];
  
  console.log("[TRPC CONTEXT]", {
    hasCookie: !!sessionToken,
    cookieName: COOKIE_NAME,
    allCookies: Object.keys(req.cookies),
    host: req.get("host"),
  });
  
  // ... reste du code
}
```

### 4. Tester avec curl

Testez manuellement la création et l'envoi du cookie:

```bash
# 1. Simuler le callback OAuth (remplacez TOKEN par un vrai token)
curl -v -X GET "http://monopco.fr/api/oauth/callback?code=TOKEN" \
  -c cookies.txt

# 2. Vérifier que le cookie est sauvegardé
cat cookies.txt

# 3. Tester une requête protégée avec le cookie
curl -v -X GET "http://monopco.fr/api/trpc/auth.me" \
  -b cookies.txt
```

### 5. Vérifier les En-Têtes HTTP

Utilisez les DevTools pour inspecter les en-têtes:

```
# Requête vers /api/oauth/callback
Request Headers:
  Host: monopco.fr
  ...

Response Headers:
  Set-Cookie: manus_session=...; Domain=.monopco.fr; Secure; HttpOnly; SameSite=None
  ...

# Requête suivante vers /api/trpc/auth.me
Request Headers:
  Host: monopco.fr
  Cookie: manus_session=...
  ...
```

Si `Cookie` est absent dans la deuxième requête, le problème est confirmé.

---

## 📚 Ressources Complémentaires

### Documentation Officielle

- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [MDN: SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [Chrome: SameSite Cookie Changes](https://www.chromium.org/updates/same-site/)

### Articles Techniques

- [Understanding SameSite Cookies](https://web.dev/samesite-cookies-explained/)
- [Secure Cookie Best Practices](https://owasp.org/www-community/controls/SecureCookieAttribute)

### Outils de Débogage

- [Chrome DevTools: Application Tab](https://developer.chrome.com/docs/devtools/application/cookies/)
- [Firefox DevTools: Storage Inspector](https://firefox-source-docs.mozilla.org/devtools-user/storage_inspector/)

---

## ✅ Checklist de Validation

Avant de considérer le problème comme résolu, vérifiez tous les points suivants:

- [ ] Le code de `server/_core/cookies.ts` a été modifié
- [ ] `NODE_ENV=production` est défini dans l'environnement de production
- [ ] L'application a été redéployée
- [ ] Le cache du navigateur a été vidé
- [ ] La connexion fonctionne sur `monopco.fr`
- [ ] La connexion fonctionne sur `www.monopco.fr` (si applicable)
- [ ] Le cookie `manus_session` est visible dans DevTools
- [ ] Le cookie a les bons attributs (Domain, Secure, SameSite)
- [ ] L'actualisation de la page ne déconnecte pas l'utilisateur
- [ ] Les tests unitaires passent
- [ ] Les logs ne montrent aucune erreur liée aux cookies

---

## 📞 Support

Si le problème persiste après avoir suivi ce guide:

1. **Vérifiez les logs du serveur** pour des erreurs spécifiques
2. **Capturez une trace réseau complète** (DevTools → Network → Export HAR)
3. **Contactez le support Manus** à https://help.manus.im avec:
   - Description détaillée du problème
   - Fichier HAR de la trace réseau
   - Logs du serveur
   - Captures d'écran des cookies dans DevTools

---

**Dernière mise à jour:** 22 Novembre 2025  
**Version du guide:** 1.0  
**Auteur:** Manus AI

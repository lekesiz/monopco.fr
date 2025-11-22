# Prompt pour Claude Code - MonOPCO

## 🎯 Objectif

Corriger le problème de boucle infinie de connexion OAuth sur le projet MonOPCO (https://github.com/lekesiz/monopco.fr) et implémenter un système de gestion des utilisateurs pour les employés.

---

## 📋 Contexte du Projet

**Nom:** MonOPCO - Gestionnaire OPCO Automatisé  
**Repository:** https://github.com/lekesiz/monopco.fr  
**Site Production:** http://monopco.fr  
**Stack:** React 19 + TypeScript + tRPC + Express + MySQL/TiDB + Tailwind CSS 4

**État actuel:**
- ✅ 15 fonctionnalités complètes et déployées
- ✅ 93 tests unitaires passés (100%)
- ❌ Problème critique: Boucle infinie de connexion OAuth
- ❌ Système de gestion des utilisateurs manquant

---

## 🔴 Problème Prioritaire: Boucle Infinie OAuth

### Symptômes
1. L'utilisateur se connecte via Manus OAuth
2. Après connexion, redirection vers la page d'accueil
3. Tentative d'accès au Dashboard → redirection vers login
4. **Boucle infinie**: login → accueil → dashboard → login

### Cause
Configuration des cookies OAuth inadaptée au domaine `monopco.fr`. Le fichier `server/_core/cookies.ts` est configuré pour `localhost` mais ne fonctionne pas en production.

### Solution à Implémenter

**Fichier à modifier:** `server/_core/cookies.ts`

**Code actuel (problématique):**
```typescript
export function getSessionCookieOptions(req: Request) {
  return {
    httpOnly: true,
    secure: req.protocol === "https",
    sameSite: "none" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}
```

**Code corrigé à appliquer:**
```typescript
import type { Request } from "express";

export function getSessionCookieOptions(req: Request) {
  const isProduction = process.env.NODE_ENV === "production";
  const isHttps = req.protocol === "https";
  
  const options: any = {
    httpOnly: true,
    secure: isHttps,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  };
  
  if (isProduction) {
    options.domain = ".monopco.fr"; // Permet www.monopco.fr et monopco.fr
    options.sameSite = "none"; // Requis pour OAuth cross-site
  } else {
    options.sameSite = "lax"; // Plus sécurisé pour le développement local
  }
  
  return options;
}
```

### Tests à Créer

Créer le fichier `server/cookies.test.ts`:

```typescript
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
});
```

---

## 👥 Fonctionnalité à Ajouter: Gestion des Utilisateurs

### Objectif
Permettre aux employés de Netz Informatique de créer des comptes et d'accéder à la plateforme sans utiliser Manus OAuth.

### Modifications du Schéma DB

**Fichier:** `drizzle/schema.ts`

Modifier la table `users` pour ajouter:

```typescript
import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(), // Garder pour OAuth
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(), // NOUVEAU: pour login email
  loginMethod: varchar("loginMethod", { length: 64 }),
  
  // NOUVEAUX CHAMPS pour auth email/password
  passwordHash: text("passwordHash"), // bcrypt hash
  emailVerified: boolean("emailVerified").default(false),
  
  // Rôles étendus
  role: mysqlEnum("role", ["admin", "manager", "consultant", "assistant"])
    .default("consultant")
    .notNull(),
    
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
```

Appliquer la migration:
```bash
pnpm db:push
```

### Fonctions DB à Créer

**Fichier:** `server/db.ts`

Ajouter ces fonctions:

```typescript
import bcrypt from "bcrypt";

export async function createUserWithPassword(data: {
  email: string;
  password: string;
  name: string;
  role?: "admin" | "manager" | "consultant" | "assistant";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Vérifier si l'email existe déjà
  const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existing.length > 0) {
    throw new Error("Email already exists");
  }
  
  // Hasher le mot de passe
  const passwordHash = await bcrypt.hash(data.password, 10);
  
  // Créer l'utilisateur
  const [result] = await db.insert(users).values({
    email: data.email,
    passwordHash,
    name: data.name,
    role: data.role || "consultant",
    loginMethod: "email",
    emailVerified: false,
  });
  
  return { id: Number(result.insertId), email: data.email, name: data.name };
}

export async function verifyUserPassword(email: string, password: string) {
  const db = await getDb();
  if (!db) return null;
  
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !user.passwordHash) return null;
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;
  
  // Mettre à jour lastSignedIn
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
  
  return user;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    loginMethod: users.loginMethod,
    emailVerified: users.emailVerified,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users).orderBy(users.createdAt);
}
```

### Procédures tRPC à Créer

**Fichier:** `server/routers.ts`

Ajouter ces procédures dans le router `auth`:

```typescript
import * as db from "./db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import jwt from "jsonwebtoken";
import { ENV } from "./_core/env";

export const appRouter = router({
  auth: router({
    // ... procédures existantes (me, logout)
    
    // NOUVEAU: Inscription avec email/password
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
        name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const user = await db.createUserWithPassword(input);
          
          // Créer un token JWT pour la session
          const token = jwt.sign(
            { userId: user.id, email: user.email },
            ENV.jwtSecret,
            { expiresIn: "7d" }
          );
          
          // Set cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
          
          return { success: true, user };
        } catch (error: any) {
          if (error.message === "Email already exists") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Cet email est déjà utilisé",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de la création du compte",
          });
        }
      }),
    
    // NOUVEAU: Connexion avec email/password
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.verifyUserPassword(input.email, input.password);
        
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou mot de passe incorrect",
          });
        }
        
        // Créer un token JWT pour la session
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          ENV.jwtSecret,
          { expiresIn: "7d" }
        );
        
        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
        
        return { success: true, user };
      }),
  }),
  
  // NOUVEAU: Router pour la gestion des utilisateurs (admin seulement)
  users: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        // Vérifier que l'utilisateur est admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Accès réservé aux administrateurs",
          });
        }
        
        return db.getAllUsers();
      }),
    
    updateRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["admin", "manager", "consultant", "assistant"]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Vérifier que l'utilisateur est admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Accès réservé aux administrateurs",
          });
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
        
        return { success: true };
      }),
  }),
});
```

### Pages Frontend à Créer

#### 1. Page de Connexion

**Fichier:** `client/src/pages/Login.tsx`

```typescript
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Connexion réussie!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={APP_LOGO} alt={APP_TITLE} className="h-16 mx-auto mb-4" />
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Connectez-vous à votre compte {APP_TITLE}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isLoading}
            >
              {loginMutation.isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            Pas encore de compte?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Créer un compte
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 2. Page d'Inscription

**Fichier:** `client/src/pages/Register.tsx`

```typescript
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function Register() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Compte créé avec succès!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    registerMutation.mutate({ name, email, password });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={APP_LOGO} alt={APP_TITLE} className="h-16 mx-auto mb-4" />
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>Rejoignez {APP_TITLE}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isLoading}
            >
              {registerMutation.isLoading ? "Création..." : "Créer mon compte"}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            Déjà un compte?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Se connecter
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 3. Page d'Administration des Utilisateurs

**Fichier:** `client/src/pages/admin/Users.tsx`

```typescript
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function AdminUsers() {
  const { data: users, isLoading } = trpc.users.list.useQuery();
  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Rôle mis à jour");
      trpc.useUtils().users.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleRoleChange = (userId: number, role: string) => {
    updateRoleMutation.mutate({
      userId,
      role: role as "admin" | "manager" | "consultant" | "assistant",
    });
  };
  
  if (isLoading) {
    return <div className="p-8">Chargement...</div>;
  }
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Gestion des Utilisateurs</h1>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Méthode de connexion</TableHead>
            <TableHead>Dernière connexion</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(value) => handleRoleChange(user.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{user.loginMethod}</TableCell>
              <TableCell>
                {new Date(user.lastSignedIn).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  Détails
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Routes à Ajouter

**Fichier:** `client/src/App.tsx`

Ajouter ces routes:

```typescript
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminUsers from "./pages/admin/Users";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin/users" component={AdminUsers} />
      {/* ... autres routes existantes */}
    </Switch>
  );
}
```

### Dépendances à Installer

```bash
pnpm add bcrypt jsonwebtoken
pnpm add -D @types/bcrypt @types/jsonwebtoken
```

---

## ✅ Checklist de Validation

Après avoir implémenté les changements, vérifier:

### OAuth Fix
- [ ] `server/_core/cookies.ts` modifié avec la nouvelle configuration
- [ ] Tests unitaires créés dans `server/cookies.test.ts`
- [ ] Tests passent: `pnpm test server/cookies.test.ts`
- [ ] Connexion fonctionne sur monopco.fr (après déploiement)
- [ ] Cookie visible dans DevTools avec les bons attributs

### Gestion des Utilisateurs
- [ ] Schéma DB modifié dans `drizzle/schema.ts`
- [ ] Migration appliquée: `pnpm db:push`
- [ ] Fonctions DB créées dans `server/db.ts`
- [ ] Procédures tRPC créées dans `server/routers.ts`
- [ ] Pages Login, Register, AdminUsers créées
- [ ] Routes ajoutées dans `App.tsx`
- [ ] Dépendances installées (bcrypt, jsonwebtoken)
- [ ] Tests passent: `pnpm test`
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Gestion des rôles fonctionne (admin seulement)

---

## 📚 Documentation de Référence

**Fichiers à consulter:**
- `RAPPORT_ETAT_PROJET.md` - État complet du projet
- `PROBLEME_OAUTH_SOLUTION.md` - Guide détaillé du problème OAuth
- `README.md` - Documentation générale du projet

**Tests existants:**
- `server/*.test.ts` - 10 fichiers de tests (93 tests au total)

**Structure du projet:**
```
monopco.fr/
├── client/src/
│   ├── pages/          # Pages React
│   ├── components/     # Composants réutilisables
│   └── lib/trpc.ts     # Client tRPC
├── server/
│   ├── _core/          # Infrastructure (auth, cookies, email)
│   ├── db.ts           # Fonctions DB
│   ├── routers.ts      # Procédures tRPC
│   └── *.test.ts       # Tests unitaires
└── drizzle/
    └── schema.ts       # Schéma DB
```

---

## 🎯 Résultat Attendu

Après avoir appliqué ces changements:

1. ✅ Les utilisateurs peuvent se connecter via Manus OAuth sans boucle infinie
2. ✅ Les employés peuvent créer des comptes avec email/password
3. ✅ Les employés peuvent se connecter avec email/password
4. ✅ Les administrateurs peuvent gérer les utilisateurs et leurs rôles
5. ✅ Tous les tests passent (93 + nouveaux tests)
6. ✅ Le système est prêt pour le déploiement

---

**Bon courage! 🚀**

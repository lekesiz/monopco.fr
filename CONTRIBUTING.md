# Guide de Contribution - MonOPCO

Merci de votre intérêt pour contribuer à **MonOPCO** ! Ce document explique comment participer au développement du projet.

---

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Workflow de Développement](#workflow-de-développement)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Documentation](#documentation)
- [Pull Requests](#pull-requests)

---

## Code de Conduite

En participant à ce projet, vous acceptez de respecter notre Code de Conduite :

- Soyez respectueux et professionnel
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est le mieux pour la communauté
- Faites preuve d'empathie envers les autres membres

---

## Comment Contribuer

### Signaler un Bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/lekesiz/monopco.fr/issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Décrivez le problème de manière détaillée :
   - Étapes pour reproduire
   - Comportement attendu vs observé
   - Captures d'écran si applicable
   - Environnement (OS, navigateur, version Node.js)

### Proposer une Fonctionnalité

1. Créez une issue avec le template "Feature Request"
2. Expliquez :
   - Le problème que cela résout
   - Comment cela devrait fonctionner
   - Pourquoi c'est important pour MonOPCO

### Contribuer au Code

1. Fork le projet
2. Créez une branche depuis `main`
3. Développez votre fonctionnalité ou correction
4. Testez votre code
5. Soumettez une Pull Request

---

## Workflow de Développement

### 1. Setup Initial

```bash
# Fork et clone
git clone https://github.com/VOTRE_USERNAME/monopco.fr.git
cd monopco.fr

# Ajouter le remote upstream
git remote add upstream https://github.com/lekesiz/monopco.fr.git

# Installer les dépendances
pnpm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés API

# Pousser le schéma DB
pnpm db:push

# Lancer le serveur de dev
pnpm dev
```

### 2. Créer une Branche

```bash
# Mettre à jour main
git checkout main
git pull upstream main

# Créer une branche de feature
git checkout -b feature/nom-de-la-feature

# OU pour un bugfix
git checkout -b fix/description-du-bug
```

### 3. Développer

```bash
# Faire vos modifications
# ...

# Vérifier le code
pnpm lint
pnpm type-check

# Lancer les tests
pnpm test

# Commit (voir Conventional Commits ci-dessous)
git add .
git commit -m "feat: ajouter génération facture PDF"
```

### 4. Soumettre

```bash
# Push vers votre fork
git push origin feature/nom-de-la-feature

# Créer une Pull Request sur GitHub
```

---

## Standards de Code

### TypeScript

- **Mode strict** activé
- Pas de `any` (sauf exception justifiée)
- Types explicites pour les fonctions publiques
- Interfaces pour les objets complexes

**Exemple:**
```typescript
// ✅ Bon
interface DossierData {
  beneficiaireNom: string;
  beneficiairePrenom: string;
  entrepriseId: number;
}

export async function createDossier(data: DossierData): Promise<number> {
  // ...
}

// ❌ Mauvais
export async function createDossier(data: any) {
  // ...
}
```

### React

- **Functional Components** uniquement
- **Hooks** pour la logique
- **Props destructuring**
- **TypeScript** pour les props

**Exemple:**
```typescript
// ✅ Bon
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ label, onClick, variant = "primary" }: ButtonProps) {
  return <button onClick={onClick} className={variant}>{label}</button>;
}

// ❌ Mauvais
export function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### tRPC

- **Procédures** bien nommées (verbes d'action)
- **Input validation** avec Zod
- **Gestion d'erreurs** avec TRPCError

**Exemple:**
```typescript
// ✅ Bon
creerDossier: protectedProcedure
  .input(
    z.object({
      beneficiaireNom: z.string().min(1),
      beneficiaireEmail: z.string().email(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    // ...
  }),

// ❌ Mauvais
create: publicProcedure
  .input(z.any())
  .mutation(async ({ input }) => {
    // ...
  }),
```

### Tailwind CSS

- **Utility-first** approach
- **Responsive** design (mobile-first)
- **Semantic classes** via `@apply` si nécessaire

**Exemple:**
```tsx
// ✅ Bon
<div className="flex flex-col gap-4 md:flex-row md:gap-6">
  <Card className="w-full md:w-1/2" />
</div>

// ❌ Mauvais (inline styles)
<div style={{ display: "flex", gap: "16px" }}>
  <Card style={{ width: "50%" }} />
</div>
```

### Naming Conventions

- **Variables/Functions**: `camelCase`
- **Components**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case.ts` ou `PascalCase.tsx` (composants)

---

## Tests

### Vitest

Tous les changements doivent inclure des tests.

**Exemple de test tRPC:**
```typescript
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("dossiers.creer", () => {
  it("crée un dossier avec succès", async () => {
    const caller = appRouter.createCaller(mockContext);
    
    const result = await caller.dossiers.creer({
      beneficiaireNom: "Dupont",
      beneficiairePrenom: "Jean",
      beneficiaireEmail: "jean.dupont@example.com",
      // ...
    });

    expect(result.success).toBe(true);
    expect(result.dossierId).toBeGreaterThan(0);
  });
});
```

**Lancer les tests:**
```bash
# Tous les tests
pnpm test

# Mode watch
pnpm test:watch

# Coverage
pnpm test:coverage
```

---

## Documentation

### Code Comments

- **JSDoc** pour les fonctions publiques
- **Inline comments** pour la logique complexe
- **TODO** pour les tâches futures

**Exemple:**
```typescript
/**
 * Génère une Convention Tripartite pour Bilan de Compétences
 * 
 * @param entreprise - Informations de l'entreprise
 * @param beneficiaire - Informations du bénéficiaire
 * @param dossier - Informations du dossier
 * @returns Buffer PDF de la convention
 */
export async function genererConventionTripartite(
  entreprise: EntrepriseInfo,
  beneficiaire: BeneficiaireInfo,
  dossier: DossierInfo
): Promise<Buffer> {
  // ...
}
```

### README Updates

Si vous ajoutez une fonctionnalité majeure, mettez à jour :
- `README_GITHUB.md` (section Fonctionnalités)
- `CHANGELOG.md` (nouvelle version)

---

## Pull Requests

### Checklist

Avant de soumettre une PR, vérifiez que :

- [ ] Le code compile sans erreur (`pnpm build`)
- [ ] Les tests passent (`pnpm test`)
- [ ] Le linting passe (`pnpm lint`)
- [ ] La documentation est à jour
- [ ] Les commits suivent Conventional Commits
- [ ] La PR a une description claire

### Template de PR

```markdown
## Description
[Décrivez ce que fait cette PR]

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Tests
[Décrivez les tests ajoutés/modifiés]

## Screenshots (si applicable)
[Ajoutez des captures d'écran]

## Checklist
- [ ] Code compilé
- [ ] Tests passent
- [ ] Linting OK
- [ ] Documentation à jour
```

### Conventional Commits

Format : `<type>(<scope>): <description>`

**Types:**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (pas de changement de code)
- `refactor`: Refactoring
- `test`: Ajout/modification de tests
- `chore`: Maintenance

**Exemples:**
```bash
feat(dashboard): ajouter filtre par OPCO
fix(pdf): corriger génération certificat
docs(readme): mettre à jour installation
refactor(db): optimiser requête dossiers
test(email): ajouter tests service Resend
```

---

## Processus de Review

1. **Soumission** : Vous créez une PR
2. **Review** : Un mainteneur examine le code
3. **Feedback** : Commentaires et suggestions
4. **Corrections** : Vous apportez les modifications
5. **Approbation** : La PR est approuvée
6. **Merge** : La PR est fusionnée dans `main`

### Critères d'Approbation

- Code de qualité (lisible, maintenable)
- Tests couvrant les cas principaux
- Pas de régression
- Documentation claire
- Respect des standards du projet

---

## Questions ?

- **Issues** : [github.com/lekesiz/monopco.fr/issues](https://github.com/lekesiz/monopco.fr/issues)
- **Email** : contact@netzinformatique.fr
- **Discussions** : [github.com/lekesiz/monopco.fr/discussions](https://github.com/lekesiz/monopco.fr/discussions)

---

**Merci de contribuer à MonOPCO ! 🎉**

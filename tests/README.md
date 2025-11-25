# Tests Automatisés - MonOPCO.fr

Ce dossier contient les tests automatisés du projet MonOPCO.fr.

## Configuration

Les tests utilisent **Vitest** comme framework de test, avec **React Testing Library** pour les tests de composants.

## Structure

```
tests/
├── setup.ts           # Configuration globale des tests
├── auth.test.ts       # Tests d'authentification
└── README.md          # Ce fichier
```

## Commandes

### Exécuter tous les tests
```bash
pnpm test
```

### Exécuter les tests en mode watch
```bash
pnpm test --watch
```

### Exécuter les tests avec l'interface UI
```bash
pnpm test:ui
```

### Générer le rapport de couverture
```bash
pnpm test:coverage
```

## Écrire des Tests

### Test d'une fonction utilitaire

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../path/to/function';

describe('MyFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Test d'un composant React

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Tests Existants

### auth.test.ts
Tests du service d'authentification :
- Hashing des mots de passe avec bcrypt
- Vérification des mots de passe
- Génération de tokens JWT
- Vérification de tokens JWT

## Couverture de Code

L'objectif est d'atteindre au moins **80% de couverture** pour :
- Les fonctions utilitaires
- Les services API
- Les composants critiques

## Bonnes Pratiques

1. **Un test = une fonctionnalité** : Chaque test doit tester une seule chose
2. **Noms descriptifs** : Les noms de tests doivent décrire clairement ce qui est testé
3. **AAA Pattern** : Arrange (préparer), Act (agir), Assert (vérifier)
4. **Isolation** : Chaque test doit être indépendant
5. **Mocks** : Utiliser des mocks pour les dépendances externes (API, base de données)

## Prochains Tests à Implémenter

- [ ] Tests des APIs de dossiers
- [ ] Tests des APIs de documents
- [ ] Tests des composants React
- [ ] Tests d'intégration end-to-end
- [ ] Tests de performance

## Ressources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

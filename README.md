
# MonOPCO - Gestionnaire OPCO Automatisé

**Dernière mise à jour:** 25 novembre 2025

![MonOPCO Logo](public/logo-monopco.png)

**MonOPCO** est une plateforme automatisée de gestion des dossiers OPCO, spécialisée dans les **Bilans de Compétences** et les formations professionnelles en France.

Développé par **Netz Informatique** pour simplifier et accélérer le processus de financement OPCO.

---

## 📊 État du Projet

- **Progression :** 40% complété
- **Tests A-Z :** 93% de réussite (14/15)
- **Prochaines étapes :** Voir le [Suivi de Travail](./WORK-TRACKING.md)

---

## ✨ Fonctionnalités Principales

- **Détection Automatique Entreprise** via SIRET (API Pappers.fr)
- **Gestion des Dossiers** (Bilan de Compétences, Formation)
- **Dashboard Administrateur** avec vue Kanban et statistiques
- **Amélioration IA** des textes via Gemini API
- **Authentification** (système de démo actuellement)

---

## 🏗️ Architecture Technique

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** Vercel Serverless Functions (Node.js)
- **Base de données:** PostgreSQL (Neon)
- **APIs Externes:** Pappers.fr, Gemini, Resend

---

## 🚀 Installation et Démarrage

```bash
# Cloner le projet
git clone <repository-url>
cd monopco

# Installer les dépendances
pnpm install

# Démarrer le serveur de développement
pnpm dev
```

Le serveur démarre sur `http://localhost:3000`

---

## 📖 Documentation du Projet

- **[Suivi de Travail](./WORK-TRACKING.md)** - Progression, tâches terminées et à venir.
- **[TODO Exhaustif](./TODO.md)** - Liste complète de toutes les tâches.
- **[Rapports d'Analyse](./docs/)** - Rapports détaillés des tests et de l'analyse.

---

## 📞 Support

**Netz Informatique**
- 📍 67500 Haguenau, France
- 📞 03 67 31 02 01
- 🌐 [netzinformatique.fr](https://netzinformatique.fr)
- 📧 contact@netzinformatique.fr

---

## 📝 Licence

© 2025 MonOPCO - Netz Informatique. Tous droits réservés.

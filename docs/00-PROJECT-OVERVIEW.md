# MonOPCO.fr - Documentation Complète du Projet

## Vue d'Ensemble

**MonOPCO.fr** est une plateforme SaaS de gestion automatisée des dossiers de financement OPCO pour les entreprises françaises, avec un focus sur le **Bilan de Compétences** et les **Formations Professionnelles**.

## Contexte du Projet

### Problème Identifié

Les entreprises françaises font face à plusieurs obstacles pour accéder au financement OPCO:

1. **Méconnaissance** - Beaucoup d'entreprises ignorent qu'elles cotisent déjà aux OPCO
2. **Complexité** - 11 OPCO différents avec des pratiques hétérogènes
3. **Paperasse** - Dossiers complexes avec 10+ documents requis
4. **Manque de temps** - RH débordés qui n'ont pas le temps de gérer l'administratif
5. **Opacité** - Difficile de savoir combien on peut obtenir et quels sont les délais

### Marché

**Chiffres clés:**
- **12,2 Md€** gérés par les OPCO
- **~900 000** contrats d'apprentissage/an
- **Plusieurs millions** de dossiers de formation/an
- **~784 600+** entreprises adhérentes (OPCO EP + AKTO seuls)
- **~10,4+ millions** de salariés concernés

**Coûts actuels:**
- **720 M€/an** de frais de gestion OPCO
- **Coût moyen:** 200€ par contrat d'apprentissage
- **Coût moyen:** 409€ par TPME adhérente

### Opportunité

**Rapport IGAS 2025** identifie:
- Coûts de gestion trop élevés
- Besoin d'harmonisation et de mutualisation
- Nécessité d'outils numériques mutualisés
- Pression gouvernementale pour réduire les frais de fonctionnement

## Architecture des Deux Sites

### 1. MonOPCO.fr (Site Principal)

**Rôle:** Plateforme de gestion administrative des dossiers OPCO

**Fonctionnalités:**
- ✅ Collecte SIRET + infos entreprise (API Pappers)
- ✅ Détection automatique de l'OPCO (via code NAF)
- ✅ Estimation de l'aide OPCO
- ✅ Collecte infos bénéficiaires
- ✅ Génération automatique des documents
- ✅ Suivi des dossiers en temps réel
- ✅ Gestion des documents OPCO
- ✅ Dashboard entreprises et admin
- ✅ Amélioration AI des justifications (Gemini)

**Technologies:**
- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + API Routes (Vercel Serverless)
- **Database:** PostgreSQL (Neon)
- **Hosting:** Vercel
- **AI:** Google Gemini API

### 2. BilanCompetence.ai (Site Partenaire)

**Rôle:** Site informatif sur les Bilans de Compétences

**Fonctionnalités:**
- ℹ️ Informations détaillées sur le Bilan de Compétences
- ℹ️ Processus, durée, contenu
- ℹ️ Avantages, témoignages
- ℹ️ FAQ, guides
- 🔗 Lien vers MonOPCO.fr pour créer un dossier

**Stratégie:**
- BilanCompetence.ai = **Contenu & Information**
- MonOPCO.fr = **Action & Gestion**

## User Journey

### Pour une Entreprise

**Étape 1: Découverte**
1. User arrive sur MonOPCO.fr
2. Voit le focus sur Bilan de Compétences
3. Peut cliquer "Découvrir le Bilan" → BilanCompetence.ai (info)

**Étape 2: Choix du Type de Projet**
1. Retour sur MonOPCO.fr pour créer un dossier
2. **Step 0:** Choix "Bilan de Compétences" ou "Formation Professionnelle"
3. Lien optionnel vers BilanCompetence.ai pour plus d'infos

**Étape 3: Collecte des Informations**
1. **Step 1:** SIRET de l'entreprise
   - Lookup automatique via API Pappers
   - Détection automatique de l'OPCO (via code NAF)
   - Pré-remplissage des infos entreprise

2. **Step 2:** Effectif de l'entreprise
   - Calcul de l'estimation de l'aide OPCO

3. **Step 3:** Informations du bénéficiaire
   - Nom, prénom, email, téléphone
   - Poste, ancienneté
   - Objectifs de la formation/bilan

4. **Step 4:** Détails du projet
   - Titre de la formation/bilan
   - Organisme de formation
   - Dates, durée, coût
   - Justification (amélioration AI disponible)

**Étape 4: Génération et Soumission**
1. Génération automatique de tous les documents requis
2. Vérification de complétude du dossier
3. Signature électronique
4. Soumission automatique à l'OPCO

**Étape 5: Suivi**
1. Dashboard en temps réel
2. Notifications à chaque étape
3. Demandes de compléments gérées
4. Accord de prise en charge reçu

**Étape 6: Post-Formation**
1. Rappel des justificatifs à fournir
2. Upload des documents post-formation
3. Suivi du remboursement

### Pour un Admin (Netz Informatique)

**Dashboard Admin:**
1. Vue d'ensemble de tous les dossiers
2. Statistiques et KPIs
3. Gestion des utilisateurs
4. Validation des dossiers
5. Communication avec les entreprises
6. Rapports et exports

## Proposition de Valeur

### Pour les Entreprises

**Promesse:**
*"Formez vos salariés sans paperasse, sans avancer les frais, et sans stress. On s'occupe de tout."*

**Bénéfices:**
1. ✅ **Budget découvert** - Révéler les cotisations déjà payées
2. ✅ **Zéro paperasse** - Automatisation complète
3. ✅ **Zéro avance de frais** - Paiement direct OPCO (si possible)
4. ✅ **Formations adaptées** - Catalogue sectoriel
5. ✅ **Suivi transparent** - Dashboard en temps réel
6. ✅ **Gain de temps** - 80% de temps gagné vs processus manuel
7. ✅ **Accompagnement** - Support à chaque étape

### Pour Netz Informatique (Admin)

**Promesse:**
*"Gérez tous vos dossiers OPCO depuis une plateforme unique et automatisée."*

**Bénéfices:**
1. ✅ **Centralisation** - Tous les dossiers au même endroit
2. ✅ **Automatisation** - Génération automatique des documents
3. ✅ **Visibilité** - Dashboard avec statistiques en temps réel
4. ✅ **Efficacité** - Traitement rapide des dossiers
5. ✅ **Qualité** - Vérifications automatiques de complétude
6. ✅ **Reporting** - Rapports et exports pour analyse
7. ✅ **Scalabilité** - Gérer des centaines de dossiers facilement

## Différenciation

### vs Processus Manuel

**Processus Manuel:**
- ❌ 10+ documents à créer manuellement
- ❌ Risque d'oubli de documents
- ❌ Délais de traitement longs
- ❌ Pas de visibilité sur l'avancement
- ❌ Erreurs fréquentes
- ❌ Temps RH important

**MonOPCO.fr:**
- ✅ Génération automatique de tous les documents
- ✅ Checklist automatique
- ✅ Délais réduits (pré-remplissage)
- ✅ Dashboard en temps réel
- ✅ Vérifications automatiques
- ✅ Temps RH minimal

### vs Organismes de Formation Classiques

**Organismes Classiques:**
- ✅ Gèrent la paperasse
- ❌ Coût élevé (commission)
- ❌ Pas de transparence
- ❌ Limité à leurs formations
- ❌ Pas de dashboard

**MonOPCO.fr:**
- ✅ Automatisation complète
- ✅ Coût réduit (SaaS)
- ✅ Transparence totale
- ✅ Tous organismes de formation
- ✅ Dashboard complet

### vs Plateformes OPCO Existantes

**Plateformes OPCO:**
- ✅ Officielles
- ❌ 11 plateformes différentes
- ❌ Hétérogénéité des interfaces
- ❌ Complexité
- ❌ Pas d'automatisation

**MonOPCO.fr:**
- ✅ Plateforme unique
- ✅ Interface harmonisée
- ✅ Simplicité
- ✅ Automatisation complète
- ✅ Détection automatique de l'OPCO

## Modèle Économique

### Phase 1: Freemium (Actuel)

**Gratuit:**
- Création de dossiers
- Génération de documents
- Suivi basique

**Premium (Futur):**
- Dossiers illimités
- Support prioritaire
- Rapports avancés
- API access

### Phase 2: SaaS B2B

**Abonnement mensuel/annuel:**
- Par entreprise
- Par nombre de dossiers
- Par nombre d'utilisateurs

**Pricing (à définir):**
- Starter: 49€/mois (5 dossiers/mois)
- Business: 149€/mois (20 dossiers/mois)
- Enterprise: Sur devis (illimité)

### Phase 3: Marketplace

**Commission sur formations:**
- Partenariats avec organismes de formation
- Commission sur les dossiers financés
- Catalogue de formations recommandées

## Roadmap

### Phase 1: MVP ✅ (Actuel)

**Fonctionnalités:**
- [x] Page d'accueil avec focus Bilan de Compétences
- [x] Formulaire de demande (4 steps)
- [x] Détection automatique OPCO (via NAF)
- [x] Lookup SIRET (API Pappers)
- [x] Dashboard utilisateur
- [x] Dashboard admin
- [x] Amélioration AI (Gemini)
- [x] Pages légales

**Statut:** Déployé sur Vercel

### Phase 2: Automatisation Complète 🚧 (En cours)

**Fonctionnalités à développer:**
- [ ] Génération automatique de tous les documents OPCO
- [ ] Signature électronique
- [ ] Soumission automatique à l'OPCO
- [ ] Notifications email automatiques
- [ ] Suivi en temps réel des dossiers
- [ ] Upload de documents post-formation
- [ ] Calcul automatique de l'estimation OPCO
- [ ] Intégration avec les APIs OPCO (si disponibles)

### Phase 3: Optimisation et Scaling 📅 (À venir)

**Fonctionnalités:**
- [ ] Rapports et statistiques avancés
- [ ] Export des données (Excel, PDF)
- [ ] Gestion multi-utilisateurs
- [ ] Rôles et permissions
- [ ] API publique pour intégrations
- [ ] Mobile app (React Native)
- [ ] Intégration avec outils RH (Payfit, etc.)

### Phase 4: Marketplace et Écosystème 📅 (Futur)

**Fonctionnalités:**
- [ ] Catalogue de formations recommandées
- [ ] Partenariats avec organismes de formation
- [ ] Système de notation et avis
- [ ] Comparateur de formations
- [ ] Recommandations AI personnalisées

## Métriques de Succès

### KPIs Utilisateur

**Acquisition:**
- Nombre de visiteurs uniques/mois
- Taux de conversion visiteur → inscription
- Coût d'acquisition client (CAC)

**Activation:**
- Nombre de dossiers créés/mois
- Taux de complétion des dossiers
- Temps moyen de création d'un dossier

**Rétention:**
- Taux de retour (entreprises créant plusieurs dossiers)
- Taux de satisfaction (NPS)
- Taux de recommandation

**Revenus (Futur):**
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- LTV (Lifetime Value)

### KPIs Opérationnels

**Performance:**
- Temps de réponse API (<500ms)
- Uptime (>99.9%)
- Taux d'erreur (<0.1%)

**Qualité:**
- Taux de dossiers complets du premier coup
- Taux d'acceptation OPCO
- Temps moyen de traitement OPCO

**Efficacité:**
- Temps gagné vs processus manuel (objectif: 80%)
- Coût de traitement par dossier
- Taux d'automatisation (objectif: 95%)

## Équipe et Organisation

### Netz Informatique

**Rôle:** Propriétaire et développeur du projet

**Responsabilités:**
- Développement de la plateforme
- Maintenance et support
- Évolution du produit
- Relation avec les clients

### Partenaires

**BilanCompetence.ai:**
- Site informatif partenaire
- Génération de trafic qualifié
- Contenu éducatif

**OPCO:**
- Financeurs finaux
- Partenaires institutionnels
- Sources de données (APIs)

**Organismes de Formation:**
- Partenaires potentiels (Phase 4)
- Catalogue de formations
- Commission sur dossiers

## Risques et Mitigation

### Risques Identifiés

**1. Dépendance aux APIs Externes**
- **Risque:** Pappers API, OPCO APIs peuvent changer ou devenir payantes
- **Mitigation:** Caching, fallback manuel, diversification des sources

**2. Changements Réglementaires**
- **Risque:** Réforme des OPCO, changement des règles de financement
- **Mitigation:** Veille réglementaire, flexibilité de la plateforme

**3. Concurrence**
- **Risque:** Autres plateformes similaires, OPCO développant leurs propres outils
- **Mitigation:** Innovation continue, focus sur l'UX, partenariats

**4. Adoption Lente**
- **Risque:** Entreprises réticentes à changer leurs habitudes
- **Mitigation:** Freemium, témoignages, support proactif

**5. Complexité Technique**
- **Risque:** Intégration avec 11 OPCO différents
- **Mitigation:** Approche progressive, automatisation partielle au début

### Plan de Contingence

**Si APIs OPCO indisponibles:**
- Génération de documents PDF à envoyer manuellement
- Suivi manuel du statut
- Support humain renforcé

**Si changement réglementaire majeur:**
- Mise à jour rapide de la plateforme
- Communication proactive aux utilisateurs
- Webinaires explicatifs

## Prochaines Étapes Immédiates

### Développement (Priorité 1)

1. **Génération Automatique de Documents**
   - Formulaire de demande de prise en charge
   - Convention de formation
   - Devis détaillé
   - Calendrier prévisionnel
   - Lettre d'engagement

2. **Calcul Automatique de l'Estimation**
   - Règles par OPCO
   - Règles par taille d'entreprise
   - Règles par type de formation

3. **Notifications Email**
   - Confirmation de création de dossier
   - Rappels de documents manquants
   - Notifications de changement de statut
   - Rappels post-formation

### Tests (Priorité 2)

1. **Tests A-Z Utilisateur Final**
   - Parcours complet de création de dossier
   - Tous les types de formations
   - Tous les OPCO

2. **Tests A-Z Admin**
   - Gestion des dossiers
   - Validation
   - Rapports

### Documentation (Priorité 3)

1. **Documentation Utilisateur**
   - Guide de démarrage
   - FAQ
   - Tutoriels vidéo

2. **Documentation Technique**
   - Architecture
   - APIs
   - Déploiement

## Conclusion

MonOPCO.fr est une plateforme stratégique qui répond à un besoin réel du marché français de la formation professionnelle. Avec **12,2 Md€** en jeu et **720 M€** de frais de gestion à optimiser, l'opportunité est significative.

La plateforme combine:
- **Simplicité** pour les entreprises
- **Automatisation** pour l'efficacité
- **Transparence** pour la confiance
- **Scalabilité** pour la croissance

Le focus sur le **Bilan de Compétences** en partenariat avec **BilanCompetence.ai** offre une différenciation claire et un positionnement premium sur un segment en forte croissance.

---

**Dernière mise à jour:** 25 novembre 2025
**Version:** 1.0
**Auteur:** Netz Informatique

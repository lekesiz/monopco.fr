# Notes de Test Client - MonOPCO.fr

**Date :** 25 novembre 2025
**Scénario :** Entreprise "Test Corp" souhaite créer un dossier OPCO

## Phase 1 : Visite du site

### ✅ Points Positifs
- Page d'accueil claire et professionnelle
- Explication du service (OPCO, Bilan de Compétences)
- CTA clairs ("Démarrer", "Commencer Maintenant")

### ⚠️ Problèmes Identifiés
- **PROBLÈME 1:** Pas de bouton "Inscription" visible - Seulement "Connexion" et "Démarrer"
- **PROBLÈME 2:** Le bouton "Démarrer" ne précise pas s'il s'agit d'une inscription ou d'une connexion

### 📝 Actions
- Cliquer sur "Démarrer" pour voir où cela mène


## Résultat : Page de Connexion

### ⚠️ **PROBLÈME CRITIQUE 3:** Pas de lien vers l'inscription !
- Le bouton "Démarrer" mène à la page de connexion
- Aucun lien "Créer un compte" ou "S'inscrire" visible
- Un nouveau client ne peut PAS s'inscrire !
- Seulement des comptes démo disponibles

### 🔴 Impact Client
**BLOQUANT:** Une entreprise qui visite le site pour la première fois ne peut pas créer de compte.

### 📝 Solution Nécessaire
- Ajouter un lien "Créer un compte" ou "S'inscrire" sur la page de connexion
- Créer une page d'inscription (/register) avec formulaire complet


### ✅ Vérification : Page /register

**Résultat:** 404 - Page non trouvée

### 🔴 **PROBLÈME CRITIQUE CONFIRMÉ**
La page d'inscription n'existe pas du tout. Les nouveaux clients ne peuvent PAS s'inscrire.

## Workaround pour continuer le test

Je vais utiliser le compte démo "Entreprise (RH)" pour continuer le test du parcours client.


## Phase 2 : Dashboard Entreprise

### ✅ Points Positifs
- Dashboard clair avec statistiques (Total Engagé, Dossiers Déposés, etc.)
- Actions rapides visibles ("Nouveau Dossier", "Valider Factures")
- Graphique d'évolution du budget
- Navigation claire (Tableau de bord, Dossiers, Mon Profil)

### 📝 Test : Création d'un nouveau dossier


### ⚠️ **PROBLÈME 4:** Le bouton "Nouveau Dossier" ne fonctionne pas
- Clic sur le bouton ne redirige pas vers le formulaire de création
- Le graphique s'affiche mais pas de redirection
- L'utilisateur est bloqué et ne peut pas créer de dossier depuis le dashboard

### 📝 Test alternatif
- Essayer via le menu "Dossiers" dans la barre latérale


### ✅ Formulaire de Création de Dossier

**Points Positifs:**
- Formulaire clair et simple
- Champs essentiels présents (Titre, Salarié, Coût, Date, Objectifs)
- Bouton "Améliorer avec IA" pour l'assistance
- Boutons d'action clairs (Annuler, Soumettre)

**Test:** Remplir le formulaire avec des données de test


### ✅ Formulaire Rempli

**Données saisies:**
- Titre: Formation Excel Avancé
- Salarié: Marie Dupont
- Coût: 1200€
- Date: 01.12.2025 (format non accepté - reste "gg.aa.yyyy")
- Objectifs: Texte complet saisi

### ⚠️ **PROBLÈME 5:** Format de date non accepté
- Le champ date ne reconnaît pas le format "01.12.2025"
- Le placeholder indique "gg.aa.yyyy" mais ne valide pas l'entrée
- L'utilisateur ne sait pas quel format utiliser

### 📝 Test : Soumettre le dossier


### ⚠️ **PROBLÈME 6:** Le formulaire ne se soumet pas
- Clic sur "Soumettre le dossier" ne fait rien
- Aucun message d'erreur affiché
- Probablement lié au champ date invalide
- L'utilisateur est bloqué et ne sait pas pourquoi

### 🔴 Impact Client
**BLOQUANT:** L'entreprise ne peut pas créer de dossier car le formulaire ne se soumet pas.

### 📝 Conclusion Phase 2
Le parcours client est **bloqué** à l'étape de création de dossier. Impossible de continuer le test A-Z.

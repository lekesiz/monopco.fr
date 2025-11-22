# 📄 Guide de Test - Génération PDF MonOPCO

Ce guide vous explique comment tester la génération automatique des 5 documents PDF OPCO.

---

## 🎯 Objectif

Vérifier que tous les documents PDF se génèrent correctement avec les bonnes données :
1. **Convention Tripartite** (Bilan de Compétences)
2. **Certificat de Réalisation** (Ministère du Travail)
3. **Feuille d'Émargement** (par séance)
4. **Demande de Prise en Charge OPCO**
5. **Document de Synthèse du Bilan**

---

## 📋 Prérequis

✅ Le serveur de développement est lancé : https://3000-itw1tfo1gd1jnh773i5ss-2be488f6.manusvm.computer  
✅ Les clés API sont configurées (`PAPPERS_API_KEY`, `RESEND_API_KEY`)  
✅ Vous êtes connecté avec un compte admin

---

## 🚀 Étape 1: Créer un Dossier de Test

### 1.1 Aller sur la page d'accueil
- Ouvrez : https://3000-itw1tfo1gd1jnh773i5ss-2be488f6.manusvm.computer
- Cliquez sur **"Créer un Dossier"** (bouton bleu)

### 1.2 Remplir le formulaire

**Informations Entreprise:**
- **SIRET** : `44306184100047` (exemple : Apple France)
  - Le système va automatiquement récupérer :
    - Nom de l'entreprise
    - Adresse
    - Code NAF
    - OPCO de rattachement

**Informations Bénéficiaire:**
- **Nom** : `Dupont`
- **Prénom** : `Jean`
- **Email** : `jean.dupont@example.com` (ou votre email pour recevoir les notifications)
- **Téléphone** : `06 12 34 56 78`

**Détails du Dossier:**
- **Type de service** : Sélectionnez **"Bilan de Compétences"**
- **Date de début** : Choisissez une date (ex: aujourd'hui)
- **Date de fin** : Choisissez une date dans 3 mois

### 1.3 Soumettre
- Cliquez sur **"Créer le dossier"**
- Vous devriez recevoir un email de confirmation (si vous avez mis votre email)
- Notez le **numéro du dossier** (ex: `BC-1`)

---

## 📊 Étape 2: Accéder au Dashboard

### 2.1 Aller au Dashboard
- Cliquez sur **"Tableau de Bord"** dans le menu (en haut à droite)
- Vous verrez votre dossier dans la colonne **"Nouveau"**

### 2.2 Ouvrir le dossier
- Cliquez sur la carte du dossier
- Une modale s'ouvre avec les détails

---

## 📄 Étape 3: Tester la Génération PDF

### 3.1 Convention Tripartite

**Comment générer:**
1. Dans la modale du dossier, section **"Documents"**
2. Cliquez sur **"Générer Convention Tripartite"**
3. Le PDF se télécharge automatiquement : `convention_BC-1.pdf`

**Que vérifier:**
- ✅ Le PDF s'ouvre correctement
- ✅ Le titre : "CONVENTION DE FORMATION - BILAN DE COMPÉTENCES"
- ✅ Référence du dossier : `BC-1-2025`
- ✅ Infos entreprise correctes (nom, SIRET, adresse, NAF, OPCO)
- ✅ Infos bénéficiaire correctes (nom, prénom, email)
- ✅ Infos organisme : "Netz Informatique" avec coordonnées
- ✅ Durée : 24 heures
- ✅ Dates de début et fin
- ✅ Signature zones présentes

---

### 3.2 Certificat de Réalisation

**Comment générer:**
1. Dans la modale du dossier, section **"Documents"**
2. Cliquez sur **"Générer Certificat de Réalisation"**
3. Le PDF se télécharge : `certificat_BC-1.pdf`

**Que vérifier:**
- ✅ Titre : "CERTIFICAT DE RÉALISATION"
- ✅ Mention légale : "Conformément à l'article R. 6332-26 du Code du Travail"
- ✅ Référence du dossier
- ✅ Nature de l'action : "Bilan de Compétences"
- ✅ Bénéficiaire : nom, prénom
- ✅ Entreprise : nom, SIRET
- ✅ Heures réalisées : `24 heures (sur 24 heures prévues)`
- ✅ Dates de début et fin
- ✅ Signature de l'organisme

---

### 3.3 Feuille d'Émargement

**Comment générer:**
1. Dans la modale du dossier, section **"Documents"**
2. Cliquez sur **"Générer Feuille d'Émargement"**
3. **Une modale s'ouvre** pour saisir les infos de la séance :
   - **Date** : Choisissez une date
   - **Heure début** : `09:00`
   - **Heure fin** : `12:00`
   - **Durée** : `3` heures
   - **Thème** : `Analyse de la demande`
   - **Phase** : Sélectionnez `Phase 1`
4. Cliquez sur **"Générer"**
5. Le PDF se télécharge : `emargement_BC-1_2025-11-22.pdf`

**Que vérifier:**
- ✅ Titre : "FEUILLE D'ÉMARGEMENT - BILAN DE COMPÉTENCES"
- ✅ Référence du dossier
- ✅ Date de la séance
- ✅ Horaires : 09:00 - 12:00
- ✅ Durée : 3 heures
- ✅ Phase : Phase 1 - Préliminaire
- ✅ Thème : Analyse de la demande
- ✅ Bénéficiaire : nom, prénom
- ✅ Consultant : Netz Informatique
- ✅ Zones de signature (bénéficiaire + consultant)

---

### 3.4 Demande de Prise en Charge OPCO

**Comment générer:**
1. Dans la modale du dossier, section **"Documents"**
2. Cliquez sur **"Générer Demande Prise en Charge"**
3. Le PDF se télécharge : `demande_BC-1.pdf`

**Que vérifier:**
- ✅ Titre : "DEMANDE DE PRISE EN CHARGE"
- ✅ Sous-titre : "OPCO - Bilan de Compétences"
- ✅ OPCO destinataire (ex: "OPCO 2i")
- ✅ Référence du dossier
- ✅ **Section 1 - Entreprise** : nom, SIRET, NAF, adresse, OPCO
- ✅ **Section 2 - Bénéficiaire** : nom, prénom, email, téléphone
- ✅ **Section 3 - Programme** : 
  - Nature : Bilan de Compétences
  - Durée : 24 heures
  - Dates
  - Phases (1, 2, 3)
- ✅ **Section 4 - Devis** : Montant estimé
- ✅ **Section 5 - Pièces jointes** : Liste des documents
- ✅ Signature organisme

---

### 3.5 Document de Synthèse du Bilan

**Comment générer:**
1. Dans la modale du dossier, section **"Documents"**
2. Cliquez sur **"Générer Document de Synthèse"**
3. Le PDF se télécharge : `synthese_BC-1.pdf`

**Que vérifier:**
- ✅ Titre : "DOCUMENT DE SYNTHÈSE - BILAN DE COMPÉTENCES"
- ✅ Mention : "DOCUMENT CONFIDENTIEL"
- ✅ Référence du dossier
- ✅ Bénéficiaire : nom, prénom
- ✅ Période du bilan
- ✅ **Section 1 - Compétences Identifiées** : Liste
- ✅ **Section 2 - Aptitudes et Motivations** : Description
- ✅ **Section 3 - Projet Professionnel** : Objectifs
- ✅ **Section 4 - Plan d'Action** : Étapes concrètes
- ✅ **Section 5 - Recommandations** : Formations suggérées
- ✅ Signatures (bénéficiaire + consultant)

---

## 🧪 Étape 4: Tests Avancés

### 4.1 Tester avec des données manquantes

Créez un nouveau dossier **sans** dates de début/fin :
- Les PDF doivent afficher `"Non définie"` au lieu de planter

### 4.2 Tester avec une entreprise sans OPCO

Créez un dossier avec un SIRET fictif :
- Les champs manquants doivent afficher `"Non renseigné"`

### 4.3 Tester plusieurs séances

Générez 3 feuilles d'émargement pour le même dossier :
- Phase 1 : 3 heures
- Phase 2 : 12 heures
- Phase 3 : 6 heures
- Vérifiez que chaque PDF est unique (date différente dans le nom de fichier)

---

## ✅ Checklist Finale

Avant de valider, vérifiez que :

- [ ] **Convention Tripartite** : PDF généré et conforme
- [ ] **Certificat de Réalisation** : PDF généré et conforme
- [ ] **Feuille d'Émargement** : PDF généré et conforme
- [ ] **Demande Prise en Charge** : PDF généré et conforme
- [ ] **Document de Synthèse** : PDF généré et conforme
- [ ] Les emails de notification sont reçus
- [ ] Les données entreprise (SIRET) sont récupérées automatiquement
- [ ] L'OPCO est détecté automatiquement
- [ ] Les champs manquants affichent "Non renseigné" (pas d'erreur)
- [ ] Les dates nulles affichent "Non définie" (pas d'erreur)
- [ ] Les noms de fichiers sont corrects (ex: `convention_BC-1.pdf`)

---

## 🐛 Problèmes Courants

### ❌ "Erreur lors de la génération du PDF"
**Solution :**
- Vérifiez que le dossier a bien un ID
- Vérifiez que l'entreprise existe dans la base de données
- Regardez les logs du serveur dans la console

### ❌ Le PDF est vide ou mal formaté
**Solution :**
- Vérifiez que `pdfkit` est bien installé : `pnpm list pdfkit`
- Redémarrez le serveur : `pnpm dev`

### ❌ Les données entreprise ne se remplissent pas
**Solution :**
- Vérifiez que `PAPPERS_API_KEY` est bien configurée
- Testez l'API Pappers manuellement : `curl "https://api.pappers.fr/v2/entreprise?siret=44306184100047&api_token=VOTRE_CLE"`

### ❌ Les emails ne sont pas envoyés
**Solution :**
- Vérifiez que `RESEND_API_KEY` est bien configurée
- Vérifiez que le domaine `monopco.fr` est vérifié dans Resend
- Regardez les logs Resend : [resend.com/emails](https://resend.com/emails)

---

## 📞 Support

Si vous rencontrez un problème :
1. Vérifiez les logs du serveur (terminal)
2. Vérifiez la console du navigateur (F12)
3. Contactez : contact@netzinformatique.fr

---

**Bonne chance pour les tests ! 🚀**

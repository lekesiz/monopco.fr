# Signature Électronique - MonOPCO

Ce document explique comment intégrer la signature électronique dans MonOPCO pour permettre aux bénéficiaires de signer numériquement la Convention Tripartite.

---

## 🎯 Objectif

Permettre la signature électronique de la **Convention Tripartite** (Employeur-Salarié-Organisme) directement depuis l'email de confirmation ou la page détail dossier.

---

## 📋 Solutions Disponibles

### Option 1: DocuSign (Recommandé pour Entreprises)

**Avantages:**
- ✅ Leader mondial de la signature électronique
- ✅ Conforme eIDAS (Europe) et ESIGN Act (USA)
- ✅ API complète et bien documentée
- ✅ Suivi en temps réel des signatures
- ✅ Stockage sécurisé des documents signés

**Inconvénients:**
- ❌ Coût élevé : à partir de 25€/mois/utilisateur
- ❌ Complexité d'intégration (OAuth 2.0, JWT)

**Prix:**
- Plan Standard : 25€/mois (5 enveloppes/mois)
- Plan Business Pro : 40€/mois (20 enveloppes/mois)
- Plan Enterprise : Sur devis (illimité)

**Documentation:**
- API: https://developers.docusign.com/
- SDK Node.js: https://github.com/docusign/docusign-esign-node-client

---

### Option 2: HelloSign (Dropbox Sign)

**Avantages:**
- ✅ Interface simple et intuitive
- ✅ API facile à intégrer
- ✅ Prix plus abordable que DocuSign
- ✅ Conforme eIDAS

**Inconvénients:**
- ❌ Moins de fonctionnalités avancées
- ❌ Racheté par Dropbox (incertitude future)

**Prix:**
- Plan Essentials : 15€/mois (5 documents/mois)
- Plan Standard : 25€/mois (15 documents/mois)
- Plan Premium : 40€/mois (illimité)

**Documentation:**
- API: https://developers.hellosign.com/
- SDK Node.js: https://github.com/hellosign/hellosign-nodejs-sdk

---

### Option 3: Yousign (Solution Française)

**Avantages:**
- ✅ Solution 100% française
- ✅ Conforme eIDAS et RGPD
- ✅ Support en français
- ✅ Prix compétitifs
- ✅ API moderne (REST)

**Inconvénients:**
- ❌ Moins connu internationalement
- ❌ Moins de ressources communautaires

**Prix:**
- Plan Starter : 10€/mois (10 signatures/mois)
- Plan Business : 30€/mois (50 signatures/mois)
- Plan Enterprise : Sur devis (illimité)

**Documentation:**
- API: https://developers.yousign.com/
- SDK Node.js: Pas de SDK officiel (utiliser fetch/axios)

---

### Option 4: Universign (Solution Française)

**Avantages:**
- ✅ Solution française certifiée ANSSI
- ✅ Signature électronique qualifiée (niveau eIDAS le plus élevé)
- ✅ Conforme RGPD
- ✅ Utilisé par l'administration française

**Inconvénients:**
- ❌ Plus cher que Yousign
- ❌ API moins moderne

**Prix:**
- À partir de 0,50€ par signature
- Abonnement mensuel : Sur devis

**Documentation:**
- API: https://www.universign.com/fr/api/
- SDK: Pas de SDK officiel

---

## 🏆 Recommandation

Pour MonOPCO, je recommande **Yousign** pour les raisons suivantes :

1. **Prix abordable** : 10€/mois pour 10 signatures (suffisant pour démarrer)
2. **Solution française** : Conforme RGPD, support en français
3. **API moderne** : REST API simple à intégrer
4. **Conforme eIDAS** : Valeur légale en Europe
5. **Scalabilité** : Facile de passer à un plan supérieur

---

## 🔧 Intégration Yousign dans MonOPCO

### Étape 1: Créer un Compte Yousign

1. Aller sur [yousign.com](https://yousign.com)
2. S'inscrire (essai gratuit 14 jours)
3. Récupérer la clé API dans Settings → API Keys

### Étape 2: Installer le Package

```bash
cd /home/ubuntu/monopco
pnpm add axios
```

### Étape 3: Ajouter la Clé API dans les Secrets

Dans Manus Dashboard → Settings → Secrets :
- **Name:** `YOUSIGN_API_KEY`
- **Value:** Votre clé API Yousign

### Étape 4: Créer le Service Yousign

Créer `server/yousignService.ts` :

```typescript
import axios from "axios";

const YOUSIGN_API_URL = "https://api.yousign.com";
const YOUSIGN_API_KEY = process.env.YOUSIGN_API_KEY!;

/**
 * Créer une demande de signature pour la Convention Tripartite
 */
export async function creerDemandeSignature(params: {
  dossierId: number;
  pdfUrl: string; // URL du PDF généré (Convention Tripartite)
  signataires: Array<{
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
  }>;
}) {
  try {
    // 1. Créer une signature request
    const signatureRequest = await axios.post(
      `${YOUSIGN_API_URL}/signature_requests`,
      {
        name: `Convention Tripartite - Dossier #${params.dossierId}`,
        delivery_mode: "email",
        timezone: "Europe/Paris",
      },
      {
        headers: {
          Authorization: `Bearer ${YOUSIGN_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const signatureRequestId = signatureRequest.data.id;

    // 2. Ajouter le document PDF
    await axios.post(
      `${YOUSIGN_API_URL}/signature_requests/${signatureRequestId}/documents`,
      {
        nature: "signable_document",
        parse_anchors: true, // Détection automatique des champs de signature
        file: params.pdfUrl, // URL publique du PDF
      },
      {
        headers: {
          Authorization: `Bearer ${YOUSIGN_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 3. Ajouter les signataires
    for (const signataire of params.signataires) {
      await axios.post(
        `${YOUSIGN_API_URL}/signature_requests/${signatureRequestId}/signers`,
        {
          info: {
            first_name: signataire.prenom,
            last_name: signataire.nom,
            email: signataire.email,
            phone_number: signataire.telephone,
            locale: "fr",
          },
          signature_level: "electronic_signature", // ou "advanced_electronic_signature"
          signature_authentication_mode: "otp_email", // OTP par email
        },
        {
          headers: {
            Authorization: `Bearer ${YOUSIGN_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 4. Activer la demande de signature
    await axios.post(
      `${YOUSIGN_API_URL}/signature_requests/${signatureRequestId}/activate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${YOUSIGN_API_KEY}`,
        },
      }
    );

    return {
      success: true,
      signatureRequestId,
      message: "Demande de signature créée et envoyée par email",
    };
  } catch (error: any) {
    console.error("[Yousign] Error:", error.response?.data || error.message);
    throw new Error(`Erreur Yousign: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Récupérer le statut d'une demande de signature
 */
export async function getSignatureStatus(signatureRequestId: string) {
  try {
    const response = await axios.get(
      `${YOUSIGN_API_URL}/signature_requests/${signatureRequestId}`,
      {
        headers: {
          Authorization: `Bearer ${YOUSIGN_API_KEY}`,
        },
      }
    );

    return {
      status: response.data.status, // "draft", "ongoing", "done", "expired", "canceled"
      signers: response.data.signers,
      documents: response.data.documents,
    };
  } catch (error: any) {
    console.error("[Yousign] Error:", error.response?.data || error.message);
    throw new Error(`Erreur Yousign: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Télécharger le document signé
 */
export async function telechargerDocumentSigne(signatureRequestId: string) {
  try {
    const response = await axios.get(
      `${YOUSIGN_API_URL}/signature_requests/${signatureRequestId}/documents/download`,
      {
        headers: {
          Authorization: `Bearer ${YOUSIGN_API_KEY}`,
        },
        responseType: "arraybuffer",
      }
    );

    return Buffer.from(response.data);
  } catch (error: any) {
    console.error("[Yousign] Error:", error.response?.data || error.message);
    throw new Error(`Erreur Yousign: ${error.response?.data?.message || error.message}`);
  }
}
```

### Étape 5: Ajouter les Procédures tRPC

Dans `server/routers.ts`, ajouter :

```typescript
import { creerDemandeSignature, getSignatureStatus } from "./yousignService";

// Dans le router dossier
signature: router({
  creer: protectedProcedure
    .input(z.object({
      dossierId: z.number(),
      pdfUrl: z.string(),
      signataires: z.array(z.object({
        nom: z.string(),
        prenom: z.string(),
        email: z.string().email(),
        telephone: z.string().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      return await creerDemandeSignature(input);
    }),

  status: protectedProcedure
    .input(z.object({
      signatureRequestId: z.string(),
    }))
    .query(async ({ input }) => {
      return await getSignatureStatus(input.signatureRequestId);
    }),
}),
```

### Étape 6: Ajouter le Champ `signatureRequestId` dans le Schéma

Dans `drizzle/schema.ts` :

```typescript
export const dossiers = mysqlTable("dossiers", {
  // ... autres champs
  signatureRequestId: varchar("signature_request_id", { length: 255 }),
  signatureStatus: mysqlEnum("signature_status", [
    "pending",
    "signed",
    "expired",
    "canceled"
  ]).default("pending"),
});
```

Puis :

```bash
cd /home/ubuntu/monopco
pnpm db:push
```

### Étape 7: Ajouter le Bouton "Envoyer pour Signature" dans le Dashboard

Dans `client/src/pages/DetailDossier.tsx` :

```tsx
const envoyerSignatureMutation = trpc.dossier.signature.creer.useMutation({
  onSuccess: () => {
    toast.success("Demande de signature envoyée par email");
    refetch();
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

// Dans le JSX
<Button
  onClick={() => {
    envoyerSignatureMutation.mutate({
      dossierId: dossier.id,
      pdfUrl: "https://monopco.fr/api/documents/convention/123.pdf",
      signataires: [
        {
          nom: dossier.beneficiaireNom,
          prenom: dossier.beneficiairePrenom,
          email: dossier.beneficiaireEmail,
        },
        {
          nom: "Netz",
          prenom: "Informatique",
          email: "netz@netz.fr",
        },
      ],
    });
  }}
>
  <FileSignature className="mr-2 h-4 w-4" />
  Envoyer pour Signature
</Button>
```

---

## 🔔 Webhooks Yousign

Pour recevoir des notifications en temps réel lorsque les documents sont signés :

### 1. Configurer le Webhook dans Yousign

1. Aller sur Yousign Dashboard → Settings → Webhooks
2. Ajouter une nouvelle URL : `https://monopco.fr/api/webhooks/yousign`
3. Sélectionner les événements :
   - `signature_request.done` (tous les signataires ont signé)
   - `signature_request.expired` (demande expirée)
   - `signer.signed` (un signataire a signé)

### 2. Créer l'Endpoint Webhook

Dans `server/_core/webhooks.ts` :

```typescript
import { Router } from "express";
import { updateDossierSignatureStatus } from "../db";

export const webhooksRouter = Router();

webhooksRouter.post("/yousign", async (req, res) => {
  try {
    const event = req.body;

    console.log("[Yousign Webhook]", event.event_name, event.data);

    if (event.event_name === "signature_request.done") {
      // Tous les signataires ont signé
      const signatureRequestId = event.data.signature_request.id;
      
      // Mettre à jour le dossier
      await updateDossierSignatureStatus(signatureRequestId, "signed");
      
      // Envoyer une notification email
      // ...
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("[Yousign Webhook] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});
```

Enregistrer dans `server/_core/index.ts` :

```typescript
import { webhooksRouter } from "./webhooks";

app.use("/api/webhooks", webhooksRouter);
```

---

## 📊 Suivi des Signatures

Dans le Dashboard, afficher le statut de signature :

```tsx
{dossier.signatureStatus === "pending" && (
  <Badge variant="outline" className="bg-yellow-100">
    ⏳ En attente de signature
  </Badge>
)}

{dossier.signatureStatus === "signed" && (
  <Badge variant="outline" className="bg-green-100">
    ✅ Signé
  </Badge>
)}
```

---

## 🔒 Sécurité

1. ✅ **Toujours vérifier le webhook** avec la signature Yousign
2. ✅ **Ne jamais exposer la clé API** dans le code client
3. ✅ **Stocker les documents signés** dans S3 (pas en base de données)
4. ✅ **Logger toutes les actions** de signature pour l'audit
5. ✅ **Limiter l'accès** aux documents signés (authentification requise)

---

## 💰 Coût Estimé

Pour **10 dossiers/mois** (Convention Tripartite) :
- **Yousign Starter** : 10€/mois (10 signatures incluses)
- **Total** : 10€/mois

Pour **50 dossiers/mois** :
- **Yousign Business** : 30€/mois (50 signatures incluses)
- **Total** : 30€/mois

---

## 📝 Résumé

| Étape | Action | Statut |
|-------|--------|--------|
| 1 | Créer compte Yousign | ⏳ À faire |
| 2 | Ajouter `YOUSIGN_API_KEY` dans Secrets | ⏳ À faire |
| 3 | Créer `yousignService.ts` | ⏳ À faire |
| 4 | Ajouter procédures tRPC | ⏳ À faire |
| 5 | Mettre à jour schéma DB | ⏳ À faire |
| 6 | Ajouter bouton UI | ⏳ À faire |
| 7 | Configurer webhooks | ⏳ À faire |
| 8 | Tester en production | ⏳ À faire |

---

## 🆘 Support

En cas de problème :
1. Consulter la documentation Yousign : https://developers.yousign.com/
2. Contacter le support Yousign : support@yousign.com
3. Contacter Netz Informatique : netz@netz.fr

import { sendEmail } from "./emailService";
import * as db from "./db";

/**
 * Service de rappels automatiques pour les dossiers
 * Vérifie quotidiennement les dossiers et envoie des rappels 7 jours avant la fin
 */

export interface ReminderCheck {
  dossierId: number;
  daysRemaining: number;
  shouldSendReminder: boolean;
}

/**
 * Vérifie tous les dossiers et identifie ceux nécessitant un rappel
 */
export async function checkDossiersForReminders(): Promise<ReminderCheck[]> {
  const allDossiers = await db.getAllDossiers();
  const today = new Date();
  const results: ReminderCheck[] = [];

  for (const dossier of allDossiers) {
    // Ignorer les dossiers déjà facturés
    if (dossier.statut === "facture") {
      continue;
    }

    // Vérifier si le dossier a une date de fin
    if (!dossier.dateFin) {
      continue;
    }

    const dateFin = new Date(dossier.dateFin);
    const diffTime = dateFin.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Envoyer un rappel 7 jours avant la fin
    const shouldSendReminder = daysRemaining === 7 && daysRemaining > 0;

    results.push({
      dossierId: dossier.id,
      daysRemaining,
      shouldSendReminder
    });

    if (shouldSendReminder) {
      await sendReminderEmail(dossier.id);
    }
  }

  return results;
}

/**
 * Envoie un email de rappel pour un dossier spécifique
 */
export async function sendReminderEmail(dossierId: number): Promise<boolean> {
  try {
    const dossier = await db.getDossierById(dossierId);
    if (!dossier) {
      console.error(`[Reminder] Dossier ${dossierId} not found`);
      return false;
    }

    const entreprise = await db.getEntrepriseById(dossier.entrepriseId);
    if (!entreprise) {
      console.error(`[Reminder] Entreprise ${dossier.entrepriseId} not found`);
      return false;
    }

    const reference = dossier.reference || `BC-${dossier.id}`;
    const dateFin = dossier.dateFin ? new Date(dossier.dateFin).toLocaleDateString("fr-FR") : "Non définie";
    const heuresRestantes = (dossier.heuresTotal || 24) - (dossier.heuresRealisees || 0);

    // Email au bénéficiaire
    await sendEmail({
      to: [dossier.beneficiaireEmail],
      subject: `Rappel : Fin de votre Bilan de Compétences dans 7 jours`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Rappel : Fin de votre Bilan de Compétences</h2>
          
          <p>Bonjour ${dossier.beneficiairePrenom} ${dossier.beneficiaireNom},</p>
          
          <p>Nous vous rappelons que votre <strong>Bilan de Compétences</strong> (Réf: ${reference}) arrive à échéance dans <strong>7 jours</strong>.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Informations du dossier</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Date de fin prévue :</strong> ${dateFin}</li>
              <li><strong>Heures restantes :</strong> ${heuresRestantes}h / ${dossier.heuresTotal || 24}h</li>
              <li><strong>Statut actuel :</strong> ${dossier.statut}</li>
            </ul>
          </div>
          
          <p>Merci de planifier vos dernières séances avec votre conseiller pour finaliser votre bilan dans les délais.</p>
          
          <p>Pour toute question, n'hésitez pas à nous contacter.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          
          <p style="color: #6b7280; font-size: 12px;">
            <strong>Netz Informatique</strong><br />
            67200 Haguenau, France<br />
            Tél : 03 87 21 01 01<br />
            Email : netz@netz.fr
          </p>
        </div>
      `
    });

    // Email à Netz Informatique (notification interne)
    await sendEmail({
      to: ["netz@netz.fr"],
      subject: `[MonOPCO] Rappel automatique envoyé - ${reference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Rappel automatique envoyé</h2>
          
          <p>Un email de rappel a été envoyé automatiquement pour le dossier suivant :</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <ul style="list-style: none; padding: 0;">
              <li><strong>Référence :</strong> ${reference}</li>
              <li><strong>Bénéficiaire :</strong> ${dossier.beneficiairePrenom} ${dossier.beneficiaireNom}</li>
              <li><strong>Email :</strong> ${dossier.beneficiaireEmail}</li>
              <li><strong>Entreprise :</strong> ${entreprise.nom}</li>
              <li><strong>Date de fin :</strong> ${dateFin}</li>
              <li><strong>Heures restantes :</strong> ${heuresRestantes}h / ${dossier.heuresTotal || 24}h</li>
            </ul>
          </div>
          
          <p>Le bénéficiaire a été informé de la fin prochaine de son bilan.</p>
        </div>
      `
    });

    // Ajouter une entrée dans l'historique
    await db.addHistorique({
      dossierId: dossier.id,
      userId: null,
      action: "rappel_automatique",
      nouvelleValeur: "Rappel envoyé (7 jours avant fin)",
      commentaire: `Email de rappel automatique envoyé à ${dossier.beneficiaireEmail}`
    });

    console.log(`[Reminder] Email sent for dossier ${dossierId}`);
    return true;
  } catch (error: any) {
    console.error(`[Reminder] Error sending reminder for dossier ${dossierId}:`, error.message);
    return false;
  }
}

/**
 * Fonction à exécuter quotidiennement (via cron ou scheduler)
 * Exemple d'utilisation avec node-cron:
 * 
 * import cron from 'node-cron';
 * cron.schedule('0 9 * * *', async () => {
 *   console.log('[Reminder] Running daily reminder check...');
 *   await checkDossiersForReminders();
 * });
 */
export async function runDailyReminderCheck(): Promise<void> {
  console.log("[Reminder] Starting daily reminder check...");
  const results = await checkDossiersForReminders();
  const sentCount = results.filter(r => r.shouldSendReminder).length;
  console.log(`[Reminder] Daily check complete. ${sentCount} reminders sent.`);
}

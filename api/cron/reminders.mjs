import { query } from '../_lib/db.mjs';

export default async function handler(req, res) {
  // Verify cron secret for security
  const cronSecret = req.headers['x-vercel-cron-secret'];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Find dossiers that need reminders
    // 1. Dossiers in progress without recent activity (7 days)
    const inactiveDossiers = await query(`
      SELECT d.*, e.nom as entreprise_nom, e.contact_email
      FROM dossiers d
      LEFT JOIN entreprises e ON d.entreprise_id = e.id
      WHERE d.statut IN ('phase1', 'phase2', 'phase3')
        AND d.updated_at < NOW() - INTERVAL '7 days'
        AND (d.last_reminder_sent IS NULL OR d.last_reminder_sent < NOW() - INTERVAL '7 days')
      LIMIT 50
    `);

    // 2. Dossiers approaching deadline (3 days before date_fin)
    const approachingDeadline = await query(`
      SELECT d.*, e.nom as entreprise_nom, e.contact_email
      FROM dossiers d
      LEFT JOIN entreprises e ON d.entreprise_id = e.id
      WHERE d.date_fin IS NOT NULL
        AND d.date_fin BETWEEN NOW() AND NOW() + INTERVAL '3 days'
        AND d.statut NOT IN ('termine', 'facture')
        AND (d.last_reminder_sent IS NULL OR d.last_reminder_sent < NOW() - INTERVAL '1 day')
      LIMIT 50
    `);

    const reminders = [];

    // Send reminders for inactive dossiers
    for (const dossier of inactiveDossiers.rows) {
      try {
        // Send email via Resend API
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'MonOPCO <noreply@monopco.fr>',
            to: [dossier.beneficiaire_email],
            subject: 'Rappel - Votre dossier de bilan de compétences',
            html: `
              <h2>Bonjour ${dossier.beneficiaire_prenom} ${dossier.beneficiaire_nom},</h2>
              <p>Nous n'avons pas eu de nouvelles de votre dossier de bilan de compétences depuis 7 jours.</p>
              <p><strong>Référence du dossier:</strong> #${dossier.id}</p>
              <p><strong>Statut actuel:</strong> ${dossier.statut}</p>
              <p>N'hésitez pas à nous contacter si vous avez besoin d'assistance.</p>
              <p>Cordialement,<br>L'équipe MonOPCO</p>
            `
          })
        });

        if (emailResponse.ok) {
          // Update last_reminder_sent
          await query(
            'UPDATE dossiers SET last_reminder_sent = NOW() WHERE id = $1',
            [dossier.id]
          );
          reminders.push({ dossierId: dossier.id, type: 'inactive', status: 'sent' });
        }
      } catch (error) {
        console.error(`Failed to send reminder for dossier ${dossier.id}:`, error);
        reminders.push({ dossierId: dossier.id, type: 'inactive', status: 'failed', error: error.message });
      }
    }

    // Send reminders for approaching deadlines
    for (const dossier of approachingDeadline.rows) {
      try {
        const daysLeft = Math.ceil((new Date(dossier.date_fin) - new Date()) / (1000 * 60 * 60 * 24));

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'MonOPCO <noreply@monopco.fr>',
            to: [dossier.beneficiaire_email],
            subject: 'Rappel - Échéance proche de votre dossier',
            html: `
              <h2>Bonjour ${dossier.beneficiaire_prenom} ${dossier.beneficiaire_nom},</h2>
              <p>Votre dossier de bilan de compétences arrive à échéance dans <strong>${daysLeft} jour(s)</strong>.</p>
              <p><strong>Référence du dossier:</strong> #${dossier.id}</p>
              <p><strong>Date de fin:</strong> ${new Date(dossier.date_fin).toLocaleDateString('fr-FR')}</p>
              <p>Merci de finaliser les dernières étapes au plus vite.</p>
              <p>Cordialement,<br>L'équipe MonOPCO</p>
            `
          })
        });

        if (emailResponse.ok) {
          await query(
            'UPDATE dossiers SET last_reminder_sent = NOW() WHERE id = $1',
            [dossier.id]
          );
          reminders.push({ dossierId: dossier.id, type: 'deadline', status: 'sent', daysLeft });
        }
      } catch (error) {
        console.error(`Failed to send deadline reminder for dossier ${dossier.id}:`, error);
        reminders.push({ dossierId: dossier.id, type: 'deadline', status: 'failed', error: error.message });
      }
    }

    return res.status(200).json({
      success: true,
      reminders,
      summary: {
        total: reminders.length,
        sent: reminders.filter(r => r.status === 'sent').length,
        failed: reminders.filter(r => r.status === 'failed').length
      }
    });

  } catch (error) {
    console.error('CRON reminders error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

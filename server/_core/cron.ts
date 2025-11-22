import { Router } from "express";
import { runDailyReminderCheck } from "../reminderService";

export const cronRouter = Router();

/**
 * Endpoint CRON pour les rappels quotidiens
 * Protégé par CRON_SECRET (Vercel Cron ou GitHub Actions)
 * 
 * Appelé automatiquement tous les jours à 9h00 via vercel.json
 */
cronRouter.get("/daily-reminders", async (req, res) => {
  try {
    // Vérifier le secret Vercel Cron
    const authHeader = req.headers.authorization;
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (authHeader !== expectedAuth) {
      console.warn("[CRON] Unauthorized access attempt");
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("[CRON] Starting daily reminders check...");
    await runDailyReminderCheck();
    
    res.status(200).json({ 
      success: true, 
      message: "Daily reminders sent",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[CRON] Error:", error.message);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Endpoint de test manuel (admin uniquement)
 * Permet de tester les rappels sans attendre le CRON
 */
cronRouter.post("/test-reminders", async (req, res) => {
  try {
    console.log("[CRON] Manual test triggered");
    await runDailyReminderCheck();
    
    res.status(200).json({ 
      success: true, 
      message: "Test reminders sent",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[CRON] Test error:", error.message);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

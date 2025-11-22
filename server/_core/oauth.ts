import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { authService } from "./sdk";

export function registerAuthRoutes(app: Express) {
  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email et mot de passe requis" });
      return;
    }

    try {
      const user = await db.getUserByEmail(email);

      if (!user) {
        res.status(401).json({ error: "Email ou mot de passe incorrect" });
        return;
      }

      // Verify password
      const isValid = await db.verifyPassword(user.id, password);
      if (!isValid) {
        res.status(401).json({ error: "Email ou mot de passe incorrect" });
        return;
      }

      // Create session token
      const sessionToken = await authService.createSessionToken(user, {
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Erreur de connexion" });
    }
  });

  // Register endpoint
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, mot de passe et nom requis" });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Format d'email invalide" });
      return;
    }

    // Validate password length
    if (password.length < 8) {
      res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères" });
      return;
    }

    try {
      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: "Cet email est déjà utilisé" });
        return;
      }

      // Create new user
      const user = await db.createUser({
        email,
        password,
        name,
      });

      // Create session token
      const sessionToken = await authService.createSessionToken(user, {
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Registration failed", error);
      res.status(500).json({ error: "Erreur lors de l'inscription" });
    }
  });

  // Logout endpoint (also available via tRPC but adding REST for convenience)
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });
}

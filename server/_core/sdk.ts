import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  id: number;
  email: string;
  name: string;
};

class AuthService {
  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    const secret = ENV.jwtSecret;
    if (!secret) {
      console.error("[Auth] JWT_SECRET is not configured!");
    }
    return new TextEncoder().encode(secret);
  }

  /**
   * Create a session token for a user
   */
  async createSessionToken(
    user: { id: number; email: string; name: string | null },
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    return this.signSession(
      {
        id: user.id,
        email: user.email,
        name: user.name || "",
      },
      options
    );
  }

  async signSession(
    payload: SessionPayload,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      id: payload.id,
      email: payload.email,
      name: payload.name,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<SessionPayload | null> {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { id, email, name } = payload as Record<string, unknown>;

      if (
        typeof id !== "number" ||
        !isNonEmptyString(email) ||
        typeof name !== "string"
      ) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }

      return {
        id,
        email,
        name,
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const user = await db.getUserById(session.id);

    if (!user) {
      throw ForbiddenError("User not found");
    }

    // Update last signed in time
    await db.updateUserLastSignedIn(user.id);

    return user;
  }
}

export const authService = new AuthService();

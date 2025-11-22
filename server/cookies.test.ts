import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getSessionCookieOptions } from "./_core/cookies";
import type { Request } from "express";

describe("getSessionCookieOptions", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("devrait utiliser sameSite=lax en développement", () => {
    process.env.NODE_ENV = "development";

    const req = {
      protocol: "http",
      headers: {},
    } as unknown as Request;

    const options = getSessionCookieOptions(req);

    expect(options.sameSite).toBe("lax");
    expect(options.domain).toBeUndefined();
    expect(options.secure).toBe(false);
    expect(options.httpOnly).toBe(true);
    expect(options.path).toBe("/");
    expect(options.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("devrait utiliser sameSite=none et domain en production", () => {
    process.env.NODE_ENV = "production";

    const req = {
      protocol: "https",
      headers: {},
    } as unknown as Request;

    const options = getSessionCookieOptions(req);

    expect(options.sameSite).toBe("none");
    expect(options.domain).toBe(".monopco.fr");
    expect(options.secure).toBe(true);
    expect(options.httpOnly).toBe(true);
    expect(options.path).toBe("/");
  });

  it("devrait détecter HTTPS via x-forwarded-proto header", () => {
    process.env.NODE_ENV = "production";

    const req = {
      protocol: "http",
      headers: {
        "x-forwarded-proto": "https",
      },
    } as unknown as Request;

    const options = getSessionCookieOptions(req);

    expect(options.secure).toBe(true);
  });

  it("devrait gérer les headers x-forwarded-proto multiples", () => {
    process.env.NODE_ENV = "production";

    const req = {
      protocol: "http",
      headers: {
        "x-forwarded-proto": "https, http",
      },
    } as unknown as Request;

    const options = getSessionCookieOptions(req);

    expect(options.secure).toBe(true);
  });

  it("devrait retourner secure=false en développement HTTP", () => {
    process.env.NODE_ENV = "development";

    const req = {
      protocol: "http",
      headers: {},
    } as unknown as Request;

    const options = getSessionCookieOptions(req);

    expect(options.secure).toBe(false);
    expect(options.sameSite).toBe("lax");
  });
});

import type { CookieOptions, Request } from "express";

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure" | "maxAge"> {
  const isProduction = process.env.NODE_ENV === "production";
  const isHttps = isSecureRequest(req);

  const options: Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure" | "maxAge"> = {
    httpOnly: true,
    secure: isHttps,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  };

  if (isProduction) {
    options.domain = ".monopco.fr"; // Permet www.monopco.fr et monopco.fr
    options.sameSite = "none"; // Requis pour OAuth cross-site
  } else {
    options.sameSite = "lax"; // Plus sécurisé pour le développement local
  }

  return options;
}

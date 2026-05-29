// Centralized cookie configuration so auth/session cookies behave correctly
// in BOTH local development (http://localhost) and production (https).
//
// The previous implementation set `secure` from `NODE_ENV` and hardcoded a
// `domain`/`SameSite=None`. That silently dropped the cookie in production
// (domain mismatch) and over http in dev (secure flag). Instead we derive
// `secure` from the actual request scheme and never pin a domain, so the
// cookie is scoped to whatever host is serving the app.

export const SEVEN_DAYS = 60 * 60 * 24 * 7;

/**
 * Determine whether the incoming request reached us over HTTPS.
 * Honors `x-forwarded-proto` first so it works behind TLS-terminating
 * proxies / load balancers (Vercel, nginx, Render, etc.), then falls back
 * to the request URL's protocol.
 */
export function isSecureRequest(request) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0].trim() === "https";
  }
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

/** Options for the httpOnly auth (JWT) cookie — the source of truth for auth. */
export function authCookieOptions(request, maxAge = SEVEN_DAYS) {
  return {
    httpOnly: true,
    secure: isSecureRequest(request),
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

/**
 * Options for the non-httpOnly `user_data` cookie. This holds ONLY
 * non-sensitive profile fields for client-side display. It is never trusted
 * for authorization on the server.
 */
export function displayCookieOptions(request, maxAge = SEVEN_DAYS) {
  return {
    httpOnly: false,
    secure: isSecureRequest(request),
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

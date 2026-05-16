const CONSULTANT_PATH_PREFIXES = ["/post-property", "/my-properties"] as const;

function normalizeNextPath(decoded: string): string | null {
  const pathOnly = decoded.split("?")[0]?.split("#")[0] ?? "";
  if (!pathOnly.startsWith("/") || pathOnly.startsWith("//")) return null;
  if (/[\s\\]/.test(pathOnly)) return null;
  if (pathOnly.includes(":")) return null;
  return pathOnly;
}

/** Safe in-app pathname for redirects (blocks open redirects). */
export function parseSafeNextPath(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== "string") return null;
  try {
    const t = decodeURIComponent(raw.trim());
    return normalizeNextPath(t);
  } catch {
    return null;
  }
}

/** Consultant login destination: prefers `next` when it targets consultant flows. */
export function consultantRedirectAfterLogin(nextParam: string | null): string {
  const next = parseSafeNextPath(nextParam);
  if (
    next &&
    CONSULTANT_PATH_PREFIXES.some(
      (p) => next === p || next.startsWith(`${p}/`),
    )
  ) {
    return next;
  }
  return "/post-property";
}

const OAUTH_ERROR_RETURN_PATHS = ["/login", "/register/member"] as const;

/** Where to send the user when OAuth fails (register/member or login only). */
export function oauthErrorReturnPath(from: string | null | undefined): string {
  const path = parseSafeNextPath(from);
  if (path && OAUTH_ERROR_RETURN_PATHS.includes(path as (typeof OAUTH_ERROR_RETURN_PATHS)[number])) {
    return path;
  }
  return "/login";
}

/** Member login destination. */
export function memberRedirectAfterLogin(nextParam: string | null): string {
  const next = parseSafeNextPath(nextParam);
  if (
    next &&
    !CONSULTANT_PATH_PREFIXES.some(
      (p) => next === p || next.startsWith(`${p}/`),
    )
  ) {
    return next;
  }
  return "/listings/buy";
}

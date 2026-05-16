/**
 * Parse a public origin for metadata and email links.
 * Invalid values are ignored so `layout.tsx` never throws on `new URL(...)`.
 */
function parsePublicOrigin(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  let s = raw.trim().replace(/\/$/, "");
  if (!s.includes("://")) {
    if (/^localhost(:\d+)?$/i.test(s) || /^127\.0\.0\.1(:\d+)?$/i.test(s)) {
      s = `http://${s}`;
    } else {
      s = `https://${s}`;
    }
  }
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

/** Canonical public origin for links in emails (no trailing slash). */
export function getAppBaseUrl(): string {
  const fromExplicit = parsePublicOrigin(process.env.NEXT_PUBLIC_APP_URL);
  if (fromExplicit) return fromExplicit;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const normalized = vercel.includes("://")
      ? vercel
      : `https://${vercel.replace(/^https?:\/\//, "")}`;
    const fromVercel = parsePublicOrigin(normalized);
    if (fromVercel) return fromVercel;
  }

  return "http://localhost:3003";
}

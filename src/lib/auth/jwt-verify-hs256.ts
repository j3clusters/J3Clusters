const textEncoder = new TextEncoder();

function base64UrlToBytes(segment: string): Uint8Array {
  const padLen = (4 - (segment.length % 4)) % 4;
  const base64 = (segment + "=".repeat(padLen))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export type VerifiedJwtAccountRole = "CONSULTANT" | "MEMBER";

/** Verify a compact HS256 JWT and return `sub` + `email` (+ optional community `role`). Edge-safe. */
export async function verifyJwtHs256Claims(
  token: string,
  secretBytes: Uint8Array,
): Promise<{ sub: string; email: string; role?: VerifiedJwtAccountRole } | null> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  let header: { alg?: string };
  try {
    const headerJson = new TextDecoder().decode(base64UrlToBytes(parts[0]));
    header = JSON.parse(headerJson) as { alg?: string };
  } catch {
    return null;
  }
  if (header.alg !== "HS256") {
    return null;
  }

  let payload: Record<string, unknown>;
  try {
    const payloadJson = new TextDecoder().decode(base64UrlToBytes(parts[1]));
    payload = JSON.parse(payloadJson) as Record<string, unknown>;
  } catch {
    return null;
  }

  const exp = payload.exp;
  if (typeof exp === "number" && Math.floor(Date.now() / 1000) >= exp) {
    return null;
  }

  const signingInput = `${parts[0]}.${parts[1]}`;
  let signatureBytes: Uint8Array;
  try {
    signatureBytes = base64UrlToBytes(parts[2]);
  } catch {
    return null;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(signingInput),
  );
  const computed = new Uint8Array(sig);

  if (!timingSafeEqual(computed, signatureBytes)) {
    return null;
  }

  const sub = typeof payload.sub === "string" ? payload.sub : null;
  const email = typeof payload.email === "string" ? payload.email : null;
  if (!sub || !email) {
    return null;
  }

  let role: VerifiedJwtAccountRole | undefined;
  const rawRole = payload.role;
  if (rawRole === "MEMBER" || rawRole === "CONSULTANT") {
    role = rawRole;
  }

  return role === undefined ? { sub, email } : { sub, email, role };
}

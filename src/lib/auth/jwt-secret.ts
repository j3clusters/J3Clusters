/** HS256 signing key for admin session JWT (middleware + API routes). */
export function getAdminJwtSecretBytes(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (secret && secret.length >= 32) {
    return new TextEncoder().encode(secret);
  }

  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode(
      "dev-only-j3clusters-fallback-admin-jwt-secret-32chars",
    );
  }

  throw new Error(
    "ADMIN_JWT_SECRET is missing or shorter than 32 characters. Add it to your .env.local file."
  );
}

/** HS256 signing key for app user session JWT. */
export function getUserJwtSecretBytes(): Uint8Array {
  const userSecret = process.env.USER_JWT_SECRET;
  if (userSecret && userSecret.length >= 32) {
    return new TextEncoder().encode(userSecret);
  }

  const adminSecret = process.env.ADMIN_JWT_SECRET;
  if (adminSecret && adminSecret.length >= 32) {
    return new TextEncoder().encode(adminSecret);
  }

  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode(
      "dev-only-j3clusters-fallback-user-jwt-secret-32chars",
    );
  }

  throw new Error(
    "USER_JWT_SECRET (or ADMIN_JWT_SECRET) is missing or shorter than 32 characters. Add it to your .env.local file."
  );
}

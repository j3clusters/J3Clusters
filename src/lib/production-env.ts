/**
 * Validates env only when running the production Node server (`next start`).
 * Does not run during `next dev`, `next build`, or postinstall — avoids false failures and broken builds.
 */
export function assertProductionEnvironment(): void {
  if (process.env.SKIP_ENV_VALIDATION === "1") return;

  const argv = process.argv;
  if (argv.includes("dev")) return;
  if (argv.includes("build")) return;

  if (process.env.NODE_ENV !== "production") return;

  // Only gate `next start` (and similar production servers).
  if (!argv.includes("start")) return;

  const errors: string[] = [];

  if (!process.env.DATABASE_URL?.trim()) {
    errors.push("DATABASE_URL is required.");
  }

  const adminSecret = process.env.ADMIN_JWT_SECRET?.trim();
  if (!adminSecret || adminSecret.length < 32) {
    errors.push(
      "ADMIN_JWT_SECRET must be set and at least 32 characters (admin sessions and signing keys).",
    );
  }

  const userSecret = process.env.USER_JWT_SECRET?.trim();
  const communityJwtOk =
    (!!userSecret && userSecret.length >= 32) ||
    (!!adminSecret && adminSecret.length >= 32);
  if (!communityJwtOk) {
    errors.push(
      "USER_JWT_SECRET (32+ chars) or ADMIN_JWT_SECRET is required for community member sessions.",
    );
  }

  const publicOrigin =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  if (!publicOrigin) {
    errors.push(
      "Set NEXT_PUBLIC_APP_URL to your public site URL (HTTPS). On Vercel, VERCEL_URL is usually enough once deployed.",
    );
  }

  if (errors.length) {
    const message = `[j3clusters] Production misconfiguration:\n- ${errors.join("\n- ")}`;
    console.error(message);
    throw new Error(message);
  }
}

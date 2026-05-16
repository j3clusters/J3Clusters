#!/usr/bin/env node
/**
 * Smoke-test social OAuth routes against a running dev server.
 * Usage: node scripts/test-oauth-routes.mjs [baseUrl]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

for (const envFile of [".env.local", ".env"]) {
  const envPath = path.join(repoRoot, envFile);
  if (!fs.existsSync(envPath)) continue;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const base = (process.argv[2] ?? "http://localhost:3003").replace(/\/$/, "");

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim(),
);
const facebookConfigured = Boolean(
  process.env.FACEBOOK_APP_ID?.trim() && process.env.FACEBOOK_APP_SECRET?.trim(),
);

async function followRedirect(url, label) {
  const res = await fetch(url, { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  return { label, status: res.status, location };
}

async function fetchPage(path, label) {
  const res = await fetch(`${base}${path}`);
  const html = await res.text();
  return {
    label,
    status: res.status,
    hasGooglePending: /GOOGLE_CLIENT_SECRET|Add client secret/i.test(html),
    hasGoogleButton: /Sign in with Google|Continue with Google/i.test(html),
    hasFacebook: /Facebook/i.test(html),
  };
}

console.log("OAuth env (from .env.local):");
console.log({
  googleConfigured,
  facebookConfigured,
  GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID?.trim()),
  GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim()),
});

console.log(`\nTesting ${base} ...\n`);

try {
  const googleStart = await followRedirect(
    `${base}/api/auth/oauth/google?from=/login`,
    "Google start",
  );
  const facebookStart = await followRedirect(
    `${base}/api/auth/oauth/facebook?from=/login`,
    "Facebook start",
  );
  const loginPage = await fetchPage("/login", "Login page");
  const memberPage = await fetchPage("/register/member", "Member register");

  console.log("Route responses:");
  console.log(googleStart);
  console.log(facebookStart);
  console.log(loginPage);
  console.log(memberPage);

  const googleOk =
    googleConfigured &&
    googleStart.status === 307 &&
    googleStart.location.includes("accounts.google.com");
  const googleBlocked =
    !googleConfigured &&
    googleStart.status === 307 &&
    googleStart.location.includes("oauth_error");
  const facebookBlocked =
    !facebookConfigured &&
    (facebookStart.status === 307 || facebookStart.status === 302) &&
    facebookStart.location.includes("oauth_error");

  console.log("\nVerdict:");
  if (googleOk) {
    console.log("  Google: OK — redirects to Google sign-in");
  } else if (googleBlocked) {
    console.log("  Google: BLOCKED (expected) — missing secret or client id");
  } else {
    console.log("  Google: UNEXPECTED response — check dev server / config");
  }

  if (facebookConfigured) {
    console.log("  Facebook: configured (start URL should redirect to Facebook)");
  } else if (facebookBlocked) {
    console.log("  Facebook: BLOCKED (expected) — not configured");
  } else {
    console.log("  Facebook: UNEXPECTED response");
  }

  if (!googleConfigured) {
    console.log(
      "\nTo complete Google login test: set GOOGLE_CLIENT_SECRET in .env.local, restart dev server, re-run this script.",
    );
  }
} catch (err) {
  console.error("Failed to reach server:", err.message);
  console.error("Start dev server: npm run dev");
  process.exit(1);
}

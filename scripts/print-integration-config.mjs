import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const paths = [".env.local", ".env"]
  .map((p) => path.join(repoRoot, p))
  .filter((p) => {
    try {
      fs.accessSync(p);
      return true;
    } catch {
      return false;
    }
  });

const keys = [
  "BLOB_READ_WRITE_TOKEN",
  "AUTO_POST_WEBHOOK_URL",
  "AUTO_POST_WEBHOOK_SECRET",
  "AUTO_POST_INCLUDE_INTERNAL_METADATA",
  "AUTO_POST_DISCORD_WEBHOOK_URL",
  "AUTO_POST_SLACK_WEBHOOK_URL",
  "AUTO_POST_TELEGRAM_BOT_TOKEN",
  "AUTO_POST_TELEGRAM_CHAT_ID",
  "AUTO_POST_FACEBOOK_PAGE_ID",
  "AUTO_POST_FACEBOOK_PAGE_ACCESS_TOKEN",
  "AUTO_POST_ON_RESTORE",
  "NEXT_PUBLIC_CONTACT_EMAIL",
  "NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL",
  "NEXT_PUBLIC_SOCIAL_FACEBOOK_URL",
  "NEXT_PUBLIC_SOCIAL_TIKTOK_URL",
  "NEXT_PUBLIC_SOCIAL_YOUTUBE_URL",
  "NEXT_PUBLIC_SOCIAL_LINKEDIN_URL",
  "NEXT_PUBLIC_SOCIAL_GOOGLE_REVIEWS_URL",
];

function parseEnv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

let merged = {};
for (const p of paths) {
  merged = { ...merged, ...parseEnv(fs.readFileSync(p, "utf8")) };
}

const configured = Object.fromEntries(
  keys.map((k) => [k, !!(merged[k] && String(merged[k]).trim().length)]),
);

console.log(
  JSON.stringify(
    {
      envFilesRead: paths.map((p) => path.relative(repoRoot, p)),
      configured,
    },
    null,
    2,
  ),
);

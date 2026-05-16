/**
 * Remove local build / tool caches (safe: does not touch node_modules or .env).
 * Usage:
 *   node scripts/clean-caches.mjs           # .next, out, common caches
 *   node scripts/clean-caches.mjs --next  # only .next (fast dev reset)
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const nextOnly = process.argv.includes("--next");

const dirs = nextOnly
  ? [".next"]
  : [".next", "out", ".turbo", "coverage"];

const files = nextOnly ? [] : ["tsconfig.tsbuildinfo", ".eslintcache"];

for (const name of dirs) {
  const p = path.join(root, name);
  try {
    fs.rmSync(p, { recursive: true, force: true });
    process.stdout.write(`removed ${name}\n`);
  } catch (err) {
    process.stderr.write(`skip ${name}: ${err.message}\n`);
  }
}

for (const name of files) {
  const p = path.join(root, name);
  try {
    fs.rmSync(p, { force: true });
    process.stdout.write(`removed ${name}\n`);
  } catch (err) {
    process.stderr.write(`skip ${name}: ${err.message}\n`);
  }
}

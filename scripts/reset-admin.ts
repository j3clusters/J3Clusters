import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

function loadEnvFile(file: string) {
  const full = path.resolve(process.cwd(), file);
  if (!fs.existsSync(full)) return;
  for (const raw of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const plain = process.env.ADMIN_PASSWORD;

  if (!email || !plain) {
    console.error("ADMIN_EMAIL or ADMIN_PASSWORD missing in environment.");
    process.exit(1);
  }

  const passwordHash = bcrypt.hashSync(plain, 10);
  const normalizedEmail = email.trim().toLowerCase();

  const result = await prisma.adminUser.upsert({
    where: { email: normalizedEmail },
    create: { email: normalizedEmail, passwordHash },
    update: { passwordHash },
  });

  console.info(
    `Admin user ready: ${result.email} (id=${result.id}). Password reset to ADMIN_PASSWORD.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

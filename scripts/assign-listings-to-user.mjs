/**
 * Assign all published listings to a consultant by ownerEmail (and sync submissions).
 * Usage:
 *   npx dotenv-cli -e .env.local -- node scripts/assign-listings-to-user.mjs alex.mailme19@gmail.com
 */
import { PrismaClient } from "../src/generated/prisma/index.js";

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!email) {
  console.error("Usage: node scripts/assign-listings-to-user.mjs <email>");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  let user = await prisma.appUser.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });

  if (!user) {
    console.log(`No AppUser for ${email} — creating approved consultant.`);
    user = await prisma.appUser.create({
      data: {
        name: "Alex",
        email,
        phone: "",
        city: "",
        role: "CONSULTANT",
        accountStatus: "APPROVED",
        authProvider: "email",
        approvedAt: new Date(),
        approvedByEmail: "scripts/assign-listings-to-user.mjs",
      },
    });
  } else {
    user = await prisma.appUser.update({
      where: { id: user.id },
      data: {
        role: "CONSULTANT",
        accountStatus: "APPROVED",
        approvedAt: user.approvedAt ?? new Date(),
        approvedByEmail:
          user.approvedByEmail ?? "scripts/assign-listings-to-user.mjs",
      },
    });
    console.log(`Updated user ${user.email} (${user.id}) — consultant, approved.`);
  }

  const ownerPatch = {
    ownerEmail: user.email,
    ownerName: user.name.trim() || "Alex",
    ownerPhone: user.phone.trim() || "",
  };

  const listingResult = await prisma.listing.updateMany({
    data: ownerPatch,
  });

  const submissionResult = await prisma.propertySubmission.updateMany({
    where: { deletedAt: null },
    data: {
      ownerEmail: user.email,
      ownerName: user.name.trim() || "Alex",
      ownerPhone: user.phone.trim() || "",
      appUserId: user.id,
    },
  });

  const publishedCount = await prisma.listing.count({
    where: { status: "PUBLISHED", ownerEmail: { equals: email, mode: "insensitive" } },
  });

  console.log(
    JSON.stringify(
      {
        user: { id: user.id, email: user.email, role: user.role, accountStatus: user.accountStatus },
        listingsUpdated: listingResult.count,
        submissionsUpdated: submissionResult.count,
        publishedListingsOwnedByEmail: publishedCount,
      },
      null,
      2,
    ),
  );
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}

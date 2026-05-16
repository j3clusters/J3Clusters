import { PrismaClient, ListingStatus } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const byStatus = await prisma.listing.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const published = await prisma.listing.count({
    where: { status: ListingStatus.PUBLISHED },
  });
  console.log("DB status counts:", byStatus);
  console.log("Published count:", published);
} catch (err) {
  console.error("DB error:", err.message);
} finally {
  await prisma.$disconnect();
}

import { PrismaClient, ListingStatus, ListingType } from "@prisma/client";
import bcrypt from "bcryptjs";

import { listings as seedListings } from "../src/data/listings";

const prisma = new PrismaClient();

async function main() {
  await prisma.contactLead.deleteMany();
  await prisma.propertySubmission.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.adminUser.deleteMany();

  await prisma.listing.createMany({
    data: seedListings.map((l) => ({
      id: l.id,
      title: l.title,
      type: l.type as ListingType,
      city: l.city,
      beds: l.beds,
      baths: l.baths,
      areaSqft: l.areaSqft,
      price: l.price,
      image: l.image,
      imageUrls: l.imageUrls,
      description: l.description,
      status: ListingStatus.PUBLISHED,
    })),
  });

  const email = process.env.ADMIN_EMAIL;
  const plain = process.env.ADMIN_PASSWORD;

  if (email && plain) {
    const passwordHash = bcrypt.hashSync(plain, 10);
    await prisma.adminUser.create({ data: { email, passwordHash } });
    console.info(`Created admin account for ${email}`);
  } else {
    console.warn(
      "Skipped admin seed (set ADMIN_EMAIL and ADMIN_PASSWORD in .env)."
    );
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

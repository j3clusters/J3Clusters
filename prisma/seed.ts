import {
  PrismaClient,
  ListingStatus,
  ListingType,
  ListingPurpose,
  FurnishingType,
} from "@prisma/client";
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
      purpose: l.purpose as ListingPurpose,
      type: l.type as ListingType,
      city: l.city,
      address: l.address,
      beds: l.beds,
      baths: l.baths,
      balconies: l.balconies,
      parkingSpots: l.parkingSpots,
      furnishing: l.furnishing as FurnishingType,
      propertyAgeYears: l.propertyAgeYears,
      availableFrom: l.availableFrom,
      areaSqft: l.areaSqft,
      price: l.price,
      image: l.image,
      imageUrls: l.imageUrls,
      description: l.description,
      ownerName: l.ownerName,
      ownerEmail: l.ownerEmail,
      ownerPhone: l.ownerPhone,
      ownerPhotoUrl: l.ownerPhotoUrl,
      isFeatured: l.isFeatured,
      status: ListingStatus.PUBLISHED,
    })),
  });

  const email = process.env.ADMIN_EMAIL;
  const plain = process.env.ADMIN_PASSWORD;

  if (email && plain) {
    const passwordHash = bcrypt.hashSync(plain, 10);
    const normalizedEmail = email.trim().toLowerCase();
    await prisma.adminUser.create({
      data: { email: normalizedEmail, passwordHash },
    });
    console.info(`Created admin account for ${normalizedEmail}`);
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

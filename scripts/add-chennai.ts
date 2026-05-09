import fs from "node:fs";
import path from "node:path";
import { PrismaClient, ListingStatus, ListingType } from "@prisma/client";

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

const chennaiListings = [
  {
    id: "j3-chennai-001",
    title: "3 BHK Apartment in OMR",
    type: ListingType.Apartment,
    city: "Chennai",
    beds: 3,
    baths: 3,
    areaSqft: 1620,
    price: 9500000,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    description:
      "Premium gated community on Old Mahabalipuram Road with easy access to IT parks, top schools, and ECR beach drives.",
  },
  {
    id: "j3-chennai-002",
    title: "4 BHK Sea-View Villa in ECR",
    type: ListingType.Villa,
    city: "Chennai",
    beds: 4,
    baths: 4,
    areaSqft: 3100,
    price: 24500000,
    image:
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1200&q=80",
    description:
      "Sea-view villa near East Coast Road with private garden, infinity pool access, and 24x7 gated security.",
  },
  {
    id: "j3-chennai-003",
    title: "Residential Plot in Tambaram",
    type: ListingType.Plot,
    city: "Chennai",
    beds: 0,
    baths: 0,
    areaSqft: 2200,
    price: 6200000,
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    description:
      "CMDA approved plot in fast-developing West Tambaram with upcoming metro connectivity and clear title.",
  },
];

async function main() {
  for (const listing of chennaiListings) {
    const result = await prisma.listing.upsert({
      where: { id: listing.id },
      create: {
        ...listing,
        imageUrls: [listing.image],
        status: ListingStatus.PUBLISHED,
      },
      update: {
        title: listing.title,
        type: listing.type,
        city: listing.city,
        beds: listing.beds,
        baths: listing.baths,
        areaSqft: listing.areaSqft,
        price: listing.price,
        image: listing.image,
        imageUrls: [listing.image],
        description: listing.description,
        status: ListingStatus.PUBLISHED,
      },
    });
    console.info(`Upserted ${result.id} (${result.title}) in ${result.city}`);
  }

  console.info(`\nDone. ${chennaiListings.length} Chennai listings live.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

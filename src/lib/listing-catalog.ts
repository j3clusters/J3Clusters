import { ListingStatus } from "@prisma/client";

import { listings as bundledListings } from "@/data/listings";
import { prismaListingToApp } from "@/lib/listing-map";
import { listingPurposeFor } from "@/lib/listing-purpose";
import { prisma } from "@/lib/prisma";
import type { Listing } from "@/types/listing";

export function sortListingsLikeDb(items: Listing[]): Listing[] {
  return [...items].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });
}

/** Published rows from Postgres, or the bundled StepsStone catalog when the DB has none. */
export async function loadPublishedAppListingsOrdered(): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({
    where: { status: ListingStatus.PUBLISHED },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });
  if (rows.length > 0) {
    return rows.map(prismaListingToApp);
  }
  return sortListingsLikeDb([...bundledListings]);
}

export async function loadPublishedListingById(id: string): Promise<Listing | null> {
  const row = await prisma.listing.findFirst({
    where: { id, status: ListingStatus.PUBLISHED },
  });
  if (row) return prismaListingToApp(row);
  return bundledListings.find((listing) => listing.id === id) ?? null;
}

export function filterListingsByPurposeRouteMode(
  items: Listing[],
  mode: string,
): Listing[] {
  const normalized = mode.trim().toLowerCase();
  if (normalized === "rent") {
    return items.filter((row) => listingPurposeFor(row) === "Rent");
  }
  if (normalized === "buy" || normalized === "sell") {
    return items.filter((row) => listingPurposeFor(row) === "Sale");
  }
  return items;
}

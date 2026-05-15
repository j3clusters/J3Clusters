import { ListingPurpose, ListingStatus } from "@prisma/client";

import { prismaListingToApp } from "@/lib/listing-map";
import { prisma } from "@/lib/prisma";
import type { Listing } from "@/types/listing";

export async function fetchSimilarListings(
  listingId: string,
  city: string,
  purpose: ListingPurpose,
  type: string,
  limit = 4,
): Promise<Listing[]> {
  const primary = await prisma.listing.findMany({
    where: {
      id: { not: listingId },
      status: ListingStatus.PUBLISHED,
      city,
      purpose,
      type: type as "Apartment" | "Villa" | "Plot" | "PG",
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  if (primary.length >= limit) {
    return primary.map(prismaListingToApp);
  }

  const excludeIds = [listingId, ...primary.map((row) => row.id)];
  const sameCity = await prisma.listing.findMany({
    where: {
      id: { notIn: excludeIds },
      status: ListingStatus.PUBLISHED,
      city,
      purpose,
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit - primary.length,
  });

  const combined = [...primary, ...sameCity];
  if (combined.length >= limit) {
    return combined.map(prismaListingToApp);
  }

  const excludeAll = [...excludeIds, ...sameCity.map((row) => row.id)];
  const fallback = await prisma.listing.findMany({
    where: {
      id: { notIn: excludeAll },
      status: ListingStatus.PUBLISHED,
      purpose,
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit - combined.length,
  });

  return [...combined, ...fallback].map(prismaListingToApp);
}

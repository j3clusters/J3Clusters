import { ListingPurpose, ListingStatus } from "@prisma/client";

import { listings as bundledListings } from "@/data/listings";
import { prismaListingToApp } from "@/lib/listing-map";
import { prisma } from "@/lib/prisma";
import type { Listing } from "@/types/listing";

function sortFeaturedPosted(items: Listing[]): Listing[] {
  return [...items].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });
}

function similarFromBundled(
  listingId: string,
  city: string,
  purpose: ListingPurpose,
  type: string,
  limit: number,
): Listing[] {
  const pool = bundledListings.filter((listing) => listing.id !== listingId);
  const primary = sortFeaturedPosted(
    pool.filter(
      (listing) =>
        listing.city === city &&
        listing.purpose === purpose &&
        listing.type === type,
    ),
  );
  if (primary.length >= limit) return primary.slice(0, limit);

  const excludeIds = new Set([
    listingId,
    ...primary.map((listing) => listing.id),
  ]);
  const sameCity = sortFeaturedPosted(
    pool.filter(
      (listing) =>
        !excludeIds.has(listing.id) &&
        listing.city === city &&
        listing.purpose === purpose,
    ),
  );
  const combined = [...primary, ...sameCity];
  if (combined.length >= limit) return combined.slice(0, limit);

  const excludeAll = new Set([
    ...excludeIds,
    ...sameCity.map((listing) => listing.id),
  ]);
  const fallback = sortFeaturedPosted(
    pool.filter(
      (listing) =>
        !excludeAll.has(listing.id) && listing.purpose === purpose,
    ),
  );
  return [...combined, ...fallback].slice(0, limit);
}

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

  const dbPublishedCount = await prisma.listing.count({
    where: { status: ListingStatus.PUBLISHED },
  });
  if (dbPublishedCount === 0) {
    return similarFromBundled(listingId, city, purpose, type, limit);
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

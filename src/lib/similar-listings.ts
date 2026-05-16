import type { ListingPurpose } from "@prisma/client";

import { loadPublishedAppListingsOrdered } from "@/lib/listing-catalog";
import type { Listing } from "@/types/listing";

function sortFeaturedPosted(items: Listing[]): Listing[] {
  return [...items].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });
}

function similarFromCatalog(
  pool: Listing[],
  listingId: string,
  city: string,
  purpose: ListingPurpose,
  type: string,
  limit: number,
): Listing[] {
  const candidates = pool.filter((listing) => listing.id !== listingId);
  const primary = sortFeaturedPosted(
    candidates.filter(
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
    candidates.filter(
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
    candidates.filter(
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
  const catalog = await loadPublishedAppListingsOrdered();
  return similarFromCatalog(catalog, listingId, city, purpose, type, limit);
}

import { ListingStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { listings as bundledListings } from "@/data/listings";
import { prismaListingToApp } from "@/lib/listing-map";
import { listingPurposeFor } from "@/lib/listing-purpose";
import { LISTINGS_PAGE_REVALIDATE_SECONDS } from "@/lib/listing-cache";
import {
  shouldSkipListingsDb,
  withListingsDbTimeout,
} from "@/lib/listing-db-timeout";
import { prisma } from "@/lib/prisma";
import type { Listing } from "@/types/listing";

export function sortListingsLikeDb(items: Listing[]): Listing[] {
  return [...items].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });
}

/** Prefer admin-featured listings, then fill with latest published up to `limit`. */
export function pickHomeFeaturedListings(
  items: Listing[],
  limit = 6,
): Listing[] {
  const flagged = items.filter((item) => item.isFeatured);
  if (flagged.length >= limit) {
    return flagged.slice(0, limit);
  }
  if (flagged.length > 0) {
    const rest = items.filter((item) => !item.isFeatured);
    return [...flagged, ...rest].slice(0, limit);
  }
  return items.slice(0, limit);
}

const bundledCatalog = sortListingsLikeDb([...bundledListings]);

function mergePublishedWithBundled(dbListings: Listing[]): Listing[] {
  if (dbListings.length === 0) {
    return bundledCatalog;
  }
  const dbIds = new Set(dbListings.map((item) => item.id));
  const extras = bundledCatalog.filter((item) => !dbIds.has(item.id));
  return sortListingsLikeDb([...dbListings, ...extras]);
}

async function loadPublishedAppListingsOrderedUncached(): Promise<Listing[]> {
  if (shouldSkipListingsDb()) {
    return bundledCatalog;
  }

  try {
    const rows = await withListingsDbTimeout(
      prisma.listing.findMany({
        where: { status: ListingStatus.PUBLISHED },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      }),
    );
    const published = rows.map(prismaListingToApp);
    if (published.length === 0) {
      console.warn(
        "[listing-catalog] No PUBLISHED rows in database; serving bundled catalog.",
      );
    }
    return mergePublishedWithBundled(published);
  } catch (err) {
    console.warn(
      "[listing-catalog] Published listings query failed; serving bundled catalog only.",
      err,
    );
    return bundledCatalog;
  }
}

const loadPublishedCached = unstable_cache(
  loadPublishedAppListingsOrderedUncached,
  ["published-app-listings"],
  { revalidate: LISTINGS_PAGE_REVALIDATE_SECONDS },
);

/** Published rows from Postgres, merged with bundled catalog when the DB is empty or unavailable. */
export async function loadPublishedAppListingsOrdered(): Promise<Listing[]> {
  try {
    return await loadPublishedCached();
  } catch (err) {
    console.warn(
      "[listing-catalog] Cached catalog load failed; serving bundled catalog only.",
      err,
    );
    return bundledCatalog;
  }
}

/** Resolve a listing from the cached catalog (avoids per-id database round-trips). */
export const loadPublishedListingById = cache(
  async (id: string): Promise<Listing | null> => {
    const catalog = await loadPublishedAppListingsOrdered();
    return catalog.find((listing) => listing.id === id) ?? null;
  },
);

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

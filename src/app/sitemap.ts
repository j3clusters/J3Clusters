import type { MetadataRoute } from "next";
import { ListingStatus } from "@prisma/client";

import { listings as bundledListings } from "@/data/listings";
import { getAppBaseUrl } from "@/lib/app-base-url";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppBaseUrl();

  const rows = await prisma.listing.findMany({
    where: { status: ListingStatus.PUBLISHED },
    select: { id: true, updatedAt: true },
    take: 5000,
    orderBy: { updatedAt: "desc" },
  });

  const listings =
    rows.length > 0
      ? rows
      : bundledListings.map((listing) => ({
          id: listing.id,
          updatedAt: new Date(listing.updatedAt),
        }));

  const core: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    {
      url: `${base}/listings`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/listings/buy`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${base}/listings/rent`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${base}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${base}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const properties: MetadataRoute.Sitemap = listings.map((row) => ({
    url: `${base}/property/${row.id}`,
    lastModified: row.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...core, ...properties];
}

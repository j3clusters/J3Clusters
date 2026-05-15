import type { Listing as PrismaListing } from "@prisma/client";

import { listingPurposeFor } from "@/lib/listing-purpose";
import type {
  Listing as AppListing,
  ListingPurpose,
  ListingType,
} from "@/types/listing";

export function prismaListingToApp(row: PrismaListing): AppListing {
  return {
    id: row.id,
    title: row.title,
    type: row.type as ListingType,
    purpose: listingPurposeFor(row) as ListingPurpose,
    city: row.city,
    address: row.address,
    beds: row.beds,
    baths: row.baths,
    balconies: row.balconies,
    parkingSpots: row.parkingSpots,
    furnishing: row.furnishing,
    propertyAgeYears: row.propertyAgeYears,
    availableFrom: row.availableFrom,
    areaSqft: row.areaSqft,
    price: row.price,
    image: row.image,
    imageUrls: row.imageUrls,
    description: row.description,
    ownerName: row.ownerName,
    ownerEmail: row.ownerEmail,
    ownerPhone: row.ownerPhone,
    isFeatured: row.isFeatured,
    postedAt: (row.approvedAt ?? row.createdAt).toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

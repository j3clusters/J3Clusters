import type { Listing as PrismaListing } from "@prisma/client";

import type { Listing as AppListing, ListingType } from "@/types/listing";

export function prismaListingToApp(row: PrismaListing): AppListing {
  return {
    id: row.id,
    title: row.title,
    type: row.type as ListingType,
    city: row.city,
    beds: row.beds,
    baths: row.baths,
    areaSqft: row.areaSqft,
    price: row.price,
    image: row.image,
    imageUrls: row.imageUrls,
    description: row.description,
  };
}

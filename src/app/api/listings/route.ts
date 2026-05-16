import { NextResponse } from "next/server";

import { LISTINGS_PAGE_REVALIDATE_SECONDS } from "@/lib/listing-cache";

/** Keep in sync with LISTINGS_PAGE_REVALIDATE_SECONDS in @/lib/listing-cache */
export const revalidate = 300;

import {
  canViewListingContactDetails,
  redactListingContact,
} from "@/lib/listing-contact-access";
import {
  filterListingsByPurposeRouteMode,
  loadPublishedAppListingsOrdered,
} from "@/lib/listing-catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get("mode") || "").toLowerCase();

  const ordered = await loadPublishedAppListingsOrdered();
  const purposeFiltered = filterListingsByPurposeRouteMode(ordered, mode);
  const canViewContact = await canViewListingContactDetails();
  const items = purposeFiltered.map((listing) =>
    redactListingContact(listing, canViewContact),
  );

  return NextResponse.json(
    { items },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${LISTINGS_PAGE_REVALIDATE_SECONDS}, stale-while-revalidate=${LISTINGS_PAGE_REVALIDATE_SECONDS * 2}`,
      },
    },
  );
}

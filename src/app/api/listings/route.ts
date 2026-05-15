import { NextResponse } from "next/server";

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

  return NextResponse.json({ items });
}

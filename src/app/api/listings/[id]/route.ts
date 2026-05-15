import { NextResponse } from "next/server";

import {
  canViewListingContactDetails,
  redactListingContact,
} from "@/lib/listing-contact-access";
import { loadPublishedListingById } from "@/lib/listing-catalog";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const listing = await loadPublishedListingById(id);

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canViewContact = await canViewListingContactDetails();
  return NextResponse.json(redactListingContact(listing, canViewContact));
}

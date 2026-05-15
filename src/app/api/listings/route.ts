import { ListingStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  canViewListingContactDetails,
  redactListingContact,
} from "@/lib/listing-contact-access";
import { prismaListingToApp } from "@/lib/listing-map";
import { listingPurposeFor } from "@/lib/listing-purpose";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get("mode") || "").toLowerCase();
  const rows = await prisma.listing.findMany({
    where: { status: ListingStatus.PUBLISHED },
    orderBy: { createdAt: "desc" },
  });

  const purposeFilteredRows =
    mode === "rent"
      ? rows.filter((row) => listingPurposeFor(row) === "Rent")
      : mode === "buy" || mode === "sell"
        ? rows.filter((row) => listingPurposeFor(row) === "Sale")
        : rows;
  const canViewContact = await canViewListingContactDetails();
  const items = purposeFilteredRows
    .map(prismaListingToApp)
    .map((listing) => redactListingContact(listing, canViewContact));

  return NextResponse.json({ items });
}

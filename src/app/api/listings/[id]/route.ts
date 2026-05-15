import { ListingStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  canViewListingContactDetails,
  redactListingContact,
} from "@/lib/listing-contact-access";
import { prismaListingToApp } from "@/lib/listing-map";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const row = await prisma.listing.findFirst({
    where: { id, status: ListingStatus.PUBLISHED },
  });

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canViewContact = await canViewListingContactDetails();
  return NextResponse.json(
    redactListingContact(prismaListingToApp(row), canViewContact),
  );
}

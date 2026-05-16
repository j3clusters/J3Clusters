import { ListingStatus, SubmissionStatus } from "@prisma/client";

import { withListingPurpose } from "@/lib/listing-purpose";
import { markListingDeleted } from "@/lib/listing-recycle-bin";
import { prisma } from "@/lib/prisma";
import type { propertySubmissionSchema } from "@/lib/validators";
import type { Prisma } from "@prisma/client";
import type { z } from "zod";

type ParsedSubmission = z.infer<typeof propertySubmissionSchema>;

type Tx = Prisma.TransactionClient;

/** Unpublish live listings tied to this resubmit so the site never shows old + new copies. */
export async function withdrawPublishedListingsForResubmit(
  tx: Tx,
  params: { submissionId: string; listingId?: string },
): Promise<string[]> {
  const orFilters: Prisma.ListingWhereInput[] = [
    { sourceSubmissionId: params.submissionId },
  ];
  if (params.listingId) {
    orFilters.push({ id: params.listingId });
  }

  const published = await tx.listing.findMany({
    where: {
      status: ListingStatus.PUBLISHED,
      OR: orFilters,
    },
    select: { id: true },
  });

  const listingIds = [...new Set(published.map((row) => row.id))];
  if (listingIds.length === 0) {
    return [];
  }

  await tx.listing.updateMany({
    where: { id: { in: listingIds } },
    data: { status: ListingStatus.PENDING },
  });

  return listingIds;
}

export async function applySubmissionResubmit(params: {
  submissionId: string;
  parsed: ParsedSubmission;
  ownerPhotoUrl: string;
  /** Published listing being edited (used when sourceSubmissionId was not set yet). */
  listingId?: string;
}) {
  const { submissionId, parsed, ownerPhotoUrl, listingId } = params;
  const descriptionWithPurpose = withListingPurpose(
    parsed.description,
    parsed.purpose,
  );

  let withdrawnListingIds: string[] = [];

  await prisma.$transaction(async (tx) => {
    await tx.propertySubmission.update({
      where: { id: submissionId },
      data: {
        ownerName: parsed.ownerName,
        ownerEmail: parsed.ownerEmail,
        ownerPhone: parsed.ownerPhone,
        purpose: parsed.purpose,
        type: parsed.type,
        address: parsed.address,
        city: parsed.city,
        areaSqft: parsed.areaSqft,
        bedrooms: parsed.bedrooms,
        bathrooms: parsed.bathrooms,
        balconies: parsed.balconies,
        parkingSpots: parsed.parkingSpots,
        furnishing: parsed.furnishing,
        propertyAgeYears: parsed.propertyAgeYears,
        availableFrom: parsed.availableFrom,
        legalClearance: parsed.legalClearance,
        imageUrl: parsed.imageUrl,
        imageUrls: parsed.imageUrls,
        ownerPhotoUrl,
        price: parsed.price,
        description: descriptionWithPurpose,
        status: SubmissionStatus.PENDING,
        reviewedAt: null,
        reviewedByEmail: null,
      },
    });

    withdrawnListingIds = await withdrawPublishedListingsForResubmit(tx, {
      submissionId,
      listingId,
    });
  });

  for (const id of withdrawnListingIds) {
    await markListingDeleted(id);
  }

  return { withdrawnListingIds };
}

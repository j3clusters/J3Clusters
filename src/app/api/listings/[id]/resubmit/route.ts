import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { AppUserRole, ListingStatus } from "@prisma/client";

import { USER_SESSION_COOKIE_NAME, verifyUserJwt } from "@/lib/auth/session";
import { applySubmissionResubmit } from "@/lib/resubmit-listing";
import { revalidateListingPages } from "@/lib/revalidate-listing-pages";
import { prisma } from "@/lib/prisma";
import {
  existingImagesFromFormData,
  processSubmissionImageFiles,
} from "@/lib/submission-images";
import { parsePropertySubmissionFields } from "@/lib/submission-form";
import { listingOwnerWhere } from "@/lib/submission-access";
import { withListingPurpose } from "@/lib/listing-purpose";
import { saveOwnerPortrait } from "@/lib/upload";
import { propertySubmissionSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id: listingId } = await context.params;

  const token = (await cookies()).get(USER_SESSION_COOKIE_NAME)?.value;
  const session = await verifyUserJwt(token);
  if (!session) {
    return NextResponse.json(
      { error: "Please login to edit your property." },
      { status: 401 },
    );
  }

  const account = await prisma.appUser.findUnique({
    where: { id: session.sub },
    select: { role: true, email: true },
  });
  if (!account || account.role !== AppUserRole.CONSULTANT) {
    return NextResponse.json(
      { error: "Only property agent accounts can edit listings." },
      { status: 403 },
    );
  }

  const listing = await prisma.listing.findFirst({
    where: {
      id: listingId,
      status: ListingStatus.PUBLISHED,
      ...listingOwnerWhere(account.email),
    },
  });
  if (!listing) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const rawImages = formData.getAll("images");
  const newImages = rawImages.filter((item): item is File => item instanceof File);
  const processed = await processSubmissionImageFiles(newImages);
  if (!processed.ok) {
    return NextResponse.json({ error: processed.error }, { status: 400 });
  }

  const keptFromForm = existingImagesFromFormData(formData);
  const fallbackUrls =
    listing.imageUrls.length > 0 ? listing.imageUrls : [listing.image];
  const imageUrls =
    processed.paths.length > 0
      ? processed.paths
      : keptFromForm.length > 0
        ? keptFromForm
        : fallbackUrls;

  if (!imageUrls.length) {
    return NextResponse.json(
      { error: "At least one property image is required." },
      { status: 400 },
    );
  }

  const ownerPhotoField = formData.get("ownerPhoto");
  let ownerPhotoUrl = listing.ownerPhotoUrl;
  if (ownerPhotoField instanceof File && ownerPhotoField.size > 0) {
    const portrait = await saveOwnerPortrait(ownerPhotoField);
    if (!portrait.ok) {
      return NextResponse.json({ error: portrait.error }, { status: 400 });
    }
    ownerPhotoUrl = portrait.path;
  }

  const fields = parsePropertySubmissionFields(formData);
  const parsed = propertySubmissionSchema.safeParse({
    ...fields,
    imageUrl: imageUrls[0],
    imageUrls,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    let submissionId = listing.sourceSubmissionId;
    await prisma.$transaction(async (tx) => {
      if (!submissionId) {
        const created = await tx.propertySubmission.create({
          data: {
            appUserId: session.sub,
            ownerName: parsed.data.ownerName,
            ownerEmail: parsed.data.ownerEmail,
            ownerPhone: parsed.data.ownerPhone,
            purpose: parsed.data.purpose,
            type: parsed.data.type,
            address: parsed.data.address,
            city: parsed.data.city,
            areaSqft: parsed.data.areaSqft,
            bedrooms: parsed.data.bedrooms,
            bathrooms: parsed.data.bathrooms,
            balconies: parsed.data.balconies,
            parkingSpots: parsed.data.parkingSpots,
            furnishing: parsed.data.furnishing,
            propertyAgeYears: parsed.data.propertyAgeYears,
            availableFrom: parsed.data.availableFrom,
            legalClearance: parsed.data.legalClearance,
            imageUrl: parsed.data.imageUrl,
            imageUrls: parsed.data.imageUrls,
            ownerPhotoUrl,
            price: parsed.data.price,
            description: withListingPurpose(
              parsed.data.description,
              parsed.data.purpose,
            ),
          },
        });
        submissionId = created.id;
        await tx.listing.update({
          where: { id: listing.id },
          data: { sourceSubmissionId: submissionId },
        });
      }
    });

    if (!submissionId) {
      throw new Error("Missing submission id after create.");
    }

    await applySubmissionResubmit({
      submissionId,
      parsed: parsed.data,
      ownerPhotoUrl,
      listingId: listing.id,
    });
  } catch (error) {
    console.error("Failed to resubmit listing:", error);
    return NextResponse.json(
      { error: "Unable to save changes right now. Please try again." },
      { status: 500 },
    );
  }

  revalidateListingPages();
  revalidatePath("/admin");

  return NextResponse.json({ ok: true });
}

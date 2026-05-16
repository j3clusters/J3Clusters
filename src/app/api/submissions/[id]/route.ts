import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { AppUserRole } from "@prisma/client";

import { USER_SESSION_COOKIE_NAME, verifyUserJwt } from "@/lib/auth/session";
import { applySubmissionResubmit } from "@/lib/resubmit-listing";
import { revalidateListingPages } from "@/lib/revalidate-listing-pages";
import { prisma } from "@/lib/prisma";
import {
  existingImagesFromFormData,
  processSubmissionImageFiles,
} from "@/lib/submission-images";
import { parsePropertySubmissionFields } from "@/lib/submission-form";
import { submissionOwnerWhere } from "@/lib/submission-access";
import { saveOwnerPortrait } from "@/lib/upload";
import { propertySubmissionSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id: submissionId } = await context.params;

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

  const existing = await prisma.propertySubmission.findFirst({
    where: {
      id: submissionId,
      deletedAt: null,
      ...submissionOwnerWhere(session.sub, account.email),
    },
  });
  if (!existing) {
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
    existing.imageUrls.length > 0 ? existing.imageUrls : [existing.imageUrl];
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
  let ownerPhotoUrl = existing.ownerPhotoUrl;
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
    await applySubmissionResubmit({
      submissionId: existing.id,
      parsed: parsed.data,
      ownerPhotoUrl,
    });
  } catch (error) {
    console.error("Failed to update property submission:", error);
    return NextResponse.json(
      { error: "Unable to save changes right now. Please try again." },
      { status: 500 },
    );
  }

  revalidateListingPages();
  revalidatePath("/admin");
  revalidatePath(`/my-properties/edit/${submissionId}`);

  return NextResponse.json({ ok: true });
}

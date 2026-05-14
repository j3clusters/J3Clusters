"use server";

import {
  FurnishingType,
  ListingStatus,
  ListingPurpose,
  ListingType,
  SubmissionStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  markListingDeleted,
  removeListingFromRecycleBin,
} from "@/lib/listing-recycle-bin";
import { listingPurposeFor, withListingPurpose } from "@/lib/listing-purpose";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import {
  sendSubmissionApprovedEmail,
  sendSubmissionRejectedEmail,
} from "@/lib/email/submission-status-email";
import { isUploadedFile, MAX_IMAGES, saveUploadedImages } from "@/lib/upload";

type AuditTarget = {
  action: string;
  targetType: string;
  targetId: string;
  message?: string;
};

function auditLogData(actorEmail: string, item: AuditTarget) {
  return {
    actorEmail,
    action: item.action,
    targetType: item.targetType,
    targetId: item.targetId,
    message: item.message,
  };
}

function listingDataFromSubmission(
  submission: {
    id: string;
    purpose: ListingPurpose;
    type: ListingType;
    city: string;
    address: string;
    bedrooms: number;
    bathrooms: number;
    balconies: number;
    parkingSpots: number;
    furnishing: FurnishingType;
    propertyAgeYears: number;
    availableFrom: string;
    legalClearance: boolean;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    areaSqft: number;
    price: number;
    imageUrl: string;
    imageUrls: string[];
    description: string;
  },
  audit: { approvedAt: Date; approvedByEmail: string },
) {
  return {
    sourceSubmissionId: submission.id,
    title: `${submission.type} in ${submission.city}`,
    purpose: submission.purpose,
    type: submission.type,
    city: submission.city,
    address: submission.address,
    beds: submission.bedrooms,
    baths: submission.bathrooms,
    balconies: submission.balconies,
    parkingSpots: submission.parkingSpots,
    furnishing: submission.furnishing,
    propertyAgeYears: submission.propertyAgeYears,
    availableFrom: submission.availableFrom,
    legalClearance: submission.legalClearance,
    ownerName: submission.ownerName,
    ownerEmail: submission.ownerEmail,
    ownerPhone: submission.ownerPhone,
    areaSqft: submission.areaSqft,
    price: submission.price,
    image: submission.imageUrl,
    imageUrls:
      submission.imageUrls.length > 0
        ? submission.imageUrls
        : [submission.imageUrl],
    description: withListingPurpose(
      submission.description,
      listingPurposeFor(submission),
    ),
    status: ListingStatus.PUBLISHED,
    approvedAt: audit.approvedAt,
    approvedByEmail: audit.approvedByEmail,
  };
}

export async function approveSubmissionAction(
  submissionId: string,
  formData?: FormData,
): Promise<void> {
  void formData;
  const admin = await requireAdmin();

  const submission = await prisma.propertySubmission.findFirst({
    where: { id: submissionId, deletedAt: null },
  });

  if (
    !submission ||
    submission.status !== SubmissionStatus.PENDING ||
    !submission.reviewedAt
  ) {
    return;
  }

  const approvedAt = new Date();
  let newListingId: string | null = null;
  await prisma.$transaction(async (tx) => {
    const updated = await tx.propertySubmission.updateMany({
      where: {
        id: submission.id,
        status: SubmissionStatus.PENDING,
        deletedAt: null,
        reviewedAt: { not: null },
      },
      data: {
        status: SubmissionStatus.APPROVED,
      },
    });

    if (updated.count !== 1) {
      throw new Error("Submission was already processed.");
    }

    const listing = await tx.listing.create({
      data: listingDataFromSubmission(submission, {
        approvedAt,
        approvedByEmail: admin.email,
      }),
    });
    newListingId = listing.id;
    await tx.adminAuditLog.create({
      data: auditLogData(admin.email, {
        action: "APPROVE_SUBMISSION",
        targetType: "PropertySubmission",
        targetId: submission.id,
        message: `Approved and published ${submission.type} in ${submission.city}.`,
      }),
    });
  });

  if (newListingId) {
    const emailed = await sendSubmissionApprovedEmail({
      to: submission.ownerEmail.trim(),
      ownerName: submission.ownerName.trim(),
      summary: `${submission.type} in ${submission.city}`,
      listingPath: `/property/${newListingId}`,
    });
    if (!emailed.ok) {
      console.error("[submission-email] approve", {
        submissionId: submission.id,
        reason: emailed.reason,
      });
    }
  }

  revalidatePath("/admin");
  revalidatePath("/listings");
  revalidatePath("/listings/buy");
  revalidatePath("/listings/rent");
  revalidatePath("/");
  revalidatePath("/my-properties");
}

export async function markSubmissionReviewedAction(
  submissionId: string,
  formData?: FormData,
): Promise<void> {
  void formData;
  const admin = await requireAdmin();
  const now = new Date();
  const result = await prisma.propertySubmission.updateMany({
    where: {
      id: submissionId,
      status: SubmissionStatus.PENDING,
      deletedAt: null,
      reviewedAt: null,
    },
    data: {
      reviewedAt: now,
      reviewedByEmail: admin.email,
    },
  });
  if (result.count !== 1) {
    return;
  }
  await prisma.adminAuditLog.create({
    data: auditLogData(admin.email, {
      action: "MARK_SUBMISSION_REVIEWED",
      targetType: "PropertySubmission",
      targetId: submissionId,
    }),
  });
  revalidatePath("/admin");
}

export async function rejectSubmissionAction(
  submissionId: string,
  formData?: FormData,
): Promise<void> {
  void formData;
  const admin = await requireAdmin();

  const submission = await prisma.propertySubmission.findFirst({
    where: {
      id: submissionId,
      status: SubmissionStatus.PENDING,
      deletedAt: null,
    },
  });
  if (!submission) {
    return;
  }

  const result = await prisma.propertySubmission.updateMany({
    where: { id: submissionId, status: SubmissionStatus.PENDING, deletedAt: null },
    data: {
      status: SubmissionStatus.REJECTED,
      reviewedAt: new Date(),
      reviewedByEmail: admin.email,
    },
  });

  if (result.count !== 1) {
    return;
  }

  await prisma.adminAuditLog.create({
    data: auditLogData(admin.email, {
      action: "REJECT_SUBMISSION",
      targetType: "PropertySubmission",
      targetId: submissionId,
    }),
  });

  const emailed = await sendSubmissionRejectedEmail({
    to: submission.ownerEmail.trim(),
    ownerName: submission.ownerName.trim(),
    summary: `${submission.type} in ${submission.city}`,
  });
  if (!emailed.ok) {
    console.error("[submission-email] reject", {
      submissionId,
      reason: emailed.reason,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/my-properties");
}

export async function bulkSubmissionAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const submissionIds = formData
    .getAll("submissionIds")
    .map((value) => String(value))
    .filter(Boolean);
  const intent = String(formData.get("intent") || "");

  if (!submissionIds.length) {
    return;
  }

  if (intent === "approve") {
    const pendingSubmissions = await prisma.propertySubmission.findMany({
      where: {
        id: { in: submissionIds },
        status: SubmissionStatus.PENDING,
        deletedAt: null,
        reviewedAt: { not: null },
      },
    });

    if (!pendingSubmissions.length) {
      return;
    }

    const approvedAt = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.propertySubmission.updateMany({
        where: {
          id: { in: pendingSubmissions.map((item) => item.id) },
          status: SubmissionStatus.PENDING,
          deletedAt: null,
          reviewedAt: { not: null },
        },
        data: {
          status: SubmissionStatus.APPROVED,
        },
      });

      await tx.listing.createMany({
        data: pendingSubmissions.map((submission) =>
          listingDataFromSubmission(submission, {
            approvedAt,
            approvedByEmail: admin.email,
          }),
        ),
      });
      await tx.adminAuditLog.createMany({
        data: pendingSubmissions.map((submission) =>
          auditLogData(admin.email, {
            action: "BULK_APPROVE_SUBMISSION",
            targetType: "PropertySubmission",
            targetId: submission.id,
            message: `Approved and published ${submission.type} in ${submission.city}.`,
          }),
        ),
      });
    });

    const publishedRows = await prisma.listing.findMany({
      where: {
        sourceSubmissionId: { in: pendingSubmissions.map((item) => item.id) },
      },
      select: { id: true, sourceSubmissionId: true },
    });
    const listingIdBySubmission = new Map(
      publishedRows
        .filter((row) => row.sourceSubmissionId)
        .map((row) => [row.sourceSubmissionId as string, row.id]),
    );
    for (const sub of pendingSubmissions) {
      const listingId = listingIdBySubmission.get(sub.id);
      if (!listingId) {
        continue;
      }
      const emailed = await sendSubmissionApprovedEmail({
        to: sub.ownerEmail.trim(),
        ownerName: sub.ownerName.trim(),
        summary: `${sub.type} in ${sub.city}`,
        listingPath: `/property/${listingId}`,
      });
      if (!emailed.ok) {
        console.error("[submission-email] bulk approve", {
          submissionId: sub.id,
          reason: emailed.reason,
        });
      }
    }

    revalidatePath("/listings");
    revalidatePath("/listings/buy");
    revalidatePath("/listings/rent");
    revalidatePath("/");
    revalidatePath("/my-properties");
  } else if (intent === "reject") {
    const toReject = await prisma.propertySubmission.findMany({
      where: {
        id: { in: submissionIds },
        status: SubmissionStatus.PENDING,
        deletedAt: null,
      },
    });
    const rejectedAt = new Date();
    const result = await prisma.propertySubmission.updateMany({
      where: {
        id: { in: submissionIds },
        status: SubmissionStatus.PENDING,
        deletedAt: null,
      },
      data: {
        status: SubmissionStatus.REJECTED,
        reviewedAt: rejectedAt,
        reviewedByEmail: admin.email,
      },
    });
    if (result.count > 0) {
      await prisma.adminAuditLog.create({
        data: auditLogData(admin.email, {
          action: "BULK_REJECT_SUBMISSION",
          targetType: "PropertySubmission",
          targetId: submissionIds.join(","),
          message: `Rejected ${result.count} submission(s).`,
        }),
      });
      const rejectedRows = await prisma.propertySubmission.findMany({
        where: {
          id: { in: toReject.map((item) => item.id) },
          status: SubmissionStatus.REJECTED,
          reviewedByEmail: admin.email,
        },
      });
      for (const sub of rejectedRows) {
        const emailed = await sendSubmissionRejectedEmail({
          to: sub.ownerEmail.trim(),
          ownerName: sub.ownerName.trim(),
          summary: `${sub.type} in ${sub.city}`,
        });
        if (!emailed.ok) {
          console.error("[submission-email] bulk reject", {
            submissionId: sub.id,
            reason: emailed.reason,
          });
        }
      }
    }
    revalidatePath("/my-properties");
  } else {
    return;
  }

  revalidatePath("/admin");
}

export async function editSubmissionAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const ownerName = String(formData.get("ownerName") || "").trim();
  const ownerEmail = String(formData.get("ownerEmail") || "").trim();
  const ownerPhone = String(formData.get("ownerPhone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const typeRaw = String(formData.get("type") || "");
  const purposeRaw = String(formData.get("purpose") || "");
  const areaSqftRaw = Number(formData.get("areaSqft") || 0);
  const bedroomsRaw = Number(formData.get("bedrooms") || 0);
  const bathroomsRaw = Number(formData.get("bathrooms") || 0);
  const balconiesRaw = Number(formData.get("balconies") || 0);
  const parkingSpotsRaw = Number(formData.get("parkingSpots") || 0);
  const furnishingRaw = String(formData.get("furnishing") || "");
  const propertyAgeYearsRaw = Number(formData.get("propertyAgeYears") || 0);
  const availableFrom = String(formData.get("availableFrom") || "").trim();
  const legalClearance = formData.get("legalClearance") === "on";
  const priceRaw = Number(formData.get("price") || 0);

  const existing = await prisma.propertySubmission.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return;
  }

  const incomingFiles = formData
    .getAll("imageUrl")
    .filter(isUploadedFile)
    .slice(0, MAX_IMAGES);
  let imageUrl = existing.imageUrl;
  let imageUrls = existing.imageUrls.length > 0 ? existing.imageUrls : [existing.imageUrl];
  if (incomingFiles.length > 0) {
    const result = await saveUploadedImages(incomingFiles, { maxCount: MAX_IMAGES });
    if (result.ok && result.paths.length > 0) {
      imageUrl = result.paths[0];
      imageUrls = result.paths;
    }
  }

  if (
    !id ||
    !ownerName ||
    !ownerEmail ||
    !ownerPhone ||
    !address ||
    address.length < 5 ||
    !city ||
    !description ||
    description.length < 10 ||
    !availableFrom ||
    !imageUrl ||
    !Number.isFinite(priceRaw)
  ) {
    return;
  }
  if (
    priceRaw <= 0 ||
    areaSqftRaw <= 0 ||
    bedroomsRaw < 0 ||
    bathroomsRaw < 0 ||
    balconiesRaw < 0 ||
    parkingSpotsRaw < 0 ||
    propertyAgeYearsRaw < 0
  ) {
    return;
  }
  if (!Object.values(ListingType).includes(typeRaw as ListingType)) {
    return;
  }
  if (purposeRaw !== "Sale" && purposeRaw !== "Rent") {
    return;
  }
  const purpose = purposeRaw as ListingPurpose;
  const type = typeRaw as ListingType;
  const isPlot = type === ListingType.Plot;
  const requiresRoomDetails = !isPlot;

  if (
    requiresRoomDetails &&
    !Object.values(FurnishingType).includes(furnishingRaw as FurnishingType)
  ) {
    return;
  }

  const furnishing = requiresRoomDetails
    ? (furnishingRaw as FurnishingType)
    : FurnishingType.Unfurnished;

  await prisma.propertySubmission.update({
    where: { id },
    data: {
      ownerName,
      ownerEmail,
      ownerPhone,
      address,
      city,
      purpose,
      description: withListingPurpose(description, purpose),
      type,
      areaSqft: Math.round(areaSqftRaw),
      bedrooms: requiresRoomDetails ? Math.round(bedroomsRaw) : 0,
      bathrooms: requiresRoomDetails ? Math.round(bathroomsRaw) : 0,
      balconies: requiresRoomDetails ? Math.round(balconiesRaw) : 0,
      parkingSpots: requiresRoomDetails ? Math.round(parkingSpotsRaw) : 0,
      furnishing,
      propertyAgeYears: requiresRoomDetails ? Math.round(propertyAgeYearsRaw) : 0,
      availableFrom,
      legalClearance,
      imageUrl,
      imageUrls,
      price: Math.round(priceRaw),
      reviewedAt: null,
      reviewedByEmail: null,
    },
  });

  await prisma.adminAuditLog.create({
    data: auditLogData(admin.email, {
      action: "EDIT_SUBMISSION",
      targetType: "PropertySubmission",
      targetId: id,
      message: `Edited submission for ${ownerName}.`,
    }),
  });
  revalidatePath("/admin");
  revalidatePath("/my-properties");
}

export async function deleteSubmissionAction(
  submissionId: string,
  formData?: FormData,
): Promise<void> {
  void formData;
  const admin = await requireAdmin();
  const now = new Date();
  const result = await prisma.propertySubmission.updateMany({
    where: { id: submissionId, deletedAt: null },
    data: { deletedAt: now },
  });
  if (result.count !== 1) {
    return;
  }
  await prisma.adminAuditLog.create({
    data: auditLogData(admin.email, {
      action: "MOVE_SUBMISSION_TO_RECYCLE_BIN",
      targetType: "PropertySubmission",
      targetId: submissionId,
    }),
  });
  revalidatePath("/admin");
  revalidatePath("/my-properties");
}

export async function restoreSubmissionAction(
  submissionId: string,
  formData?: FormData,
): Promise<void> {
  void formData;
  const admin = await requireAdmin();
  const result = await prisma.propertySubmission.updateMany({
    where: { id: submissionId, deletedAt: { not: null } },
    data: { deletedAt: null },
  });
  if (result.count !== 1) {
    return;
  }
  await prisma.adminAuditLog.create({
    data: auditLogData(admin.email, {
      action: "RESTORE_SUBMISSION",
      targetType: "PropertySubmission",
      targetId: submissionId,
    }),
  });
  revalidatePath("/admin");
  revalidatePath("/my-properties");
}

export async function permanentlyDeleteSubmissionAction(
  submissionId: string,
  formData?: FormData,
): Promise<void> {
  void formData;
  const admin = await requireAdmin();
  const result = await prisma.propertySubmission.deleteMany({
    where: { id: submissionId, deletedAt: { not: null } },
  });
  if (result.count !== 1) {
    return;
  }
  await prisma.adminAuditLog.create({
    data: auditLogData(admin.email, {
      action: "PERMANENTLY_DELETE_SUBMISSION",
      targetType: "PropertySubmission",
      targetId: submissionId,
    }),
  });
  revalidatePath("/admin");
}

export async function deleteContactLeadAction(
  leadId: string,
  formData?: FormData,
): Promise<void> {
  void formData;
  const admin = await requireAdmin();
  const now = new Date();
  const result = await prisma.contactLead.updateMany({
    where: { id: leadId, deletedAt: null },
    data: { deletedAt: now },
  });
  if (result.count !== 1) {
    return;
  }
  await prisma.adminAuditLog.create({
    data: auditLogData(admin.email, {
      action: "MOVE_LEAD_TO_RECYCLE_BIN",
      targetType: "ContactLead",
      targetId: leadId,
    }),
  });
  revalidatePath("/admin");
}

export async function restoreContactLeadAction(
  leadId: string,
  formData?: FormData,
): Promise<void> {
  void formData;
  const admin = await requireAdmin();
  const result = await prisma.contactLead.updateMany({
    where: { id: leadId, deletedAt: { not: null } },
    data: { deletedAt: null },
  });
  if (result.count !== 1) {
    return;
  }
  await prisma.adminAuditLog.create({
    data: auditLogData(admin.email, {
      action: "RESTORE_CONTACT_LEAD",
      targetType: "ContactLead",
      targetId: leadId,
    }),
  });
  revalidatePath("/admin");
}

export async function permanentlyDeleteContactLeadAction(
  leadId: string,
  formData?: FormData,
): Promise<void> {
  void formData;
  const admin = await requireAdmin();
  const result = await prisma.contactLead.deleteMany({
    where: { id: leadId, deletedAt: { not: null } },
  });
  if (result.count !== 1) {
    return;
  }
  await prisma.adminAuditLog.create({
    data: auditLogData(admin.email, {
      action: "PERMANENTLY_DELETE_CONTACT_LEAD",
      targetType: "ContactLead",
      targetId: leadId,
    }),
  });
  revalidatePath("/admin");
}

export async function deleteListingAction(
  listingId: string,
  formData?: FormData,
): Promise<void> {
  void formData;
  const admin = await requireAdmin();
  await prisma.listing.update({
    where: { id: listingId },
    data: { status: ListingStatus.PENDING },
  });
  await markListingDeleted(listingId);
  await prisma.adminAuditLog.create({
    data: auditLogData(admin.email, {
      action: "MOVE_LISTING_TO_RECYCLE_BIN",
      targetType: "Listing",
      targetId: listingId,
    }),
  });
  revalidatePath("/admin");
  revalidatePath("/listings");
  revalidatePath("/listings/buy");
  revalidatePath("/listings/rent");
  revalidatePath("/");
  revalidatePath("/my-properties");
}

export async function editListingAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const typeRaw = String(formData.get("type") || "");
  const purposeRaw = String(formData.get("purpose") || "");
  const bedsRaw = Number(formData.get("beds") || 0);
  const bathsRaw = Number(formData.get("baths") || 0);
  const balconiesRaw = Number(formData.get("balconies") || 0);
  const parkingSpotsRaw = Number(formData.get("parkingSpots") || 0);
  const furnishingRaw = String(formData.get("furnishing") || "");
  const propertyAgeYearsRaw = Number(formData.get("propertyAgeYears") || 0);
  const availableFrom = String(formData.get("availableFrom") || "").trim();
  const legalClearance = formData.get("legalClearance") === "on";
  const ownerName = String(formData.get("ownerName") || "").trim();
  const ownerEmail = String(formData.get("ownerEmail") || "").trim();
  const ownerPhone = String(formData.get("ownerPhone") || "").trim();
  const areaSqftRaw = Number(formData.get("areaSqft") || 0);
  const priceRaw = Number(formData.get("price") || 0);

  const existing = await prisma.listing.findUnique({ where: { id } });
  if (!existing) {
    return;
  }

  const incomingFiles = formData
    .getAll("image")
    .filter(isUploadedFile)
    .slice(0, MAX_IMAGES);
  let image = existing.image;
  let imageUrls = existing.imageUrls.length > 0 ? existing.imageUrls : [existing.image];
  if (incomingFiles.length > 0) {
    const result = await saveUploadedImages(incomingFiles, { maxCount: MAX_IMAGES });
    if (result.ok && result.paths.length > 0) {
      image = result.paths[0];
      imageUrls = result.paths;
    }
  }

  if (!id || !title || !city || !address || !image || !description) {
    return;
  }
  if (!Object.values(ListingType).includes(typeRaw as ListingType)) {
    return;
  }
  if (purposeRaw !== "Sale" && purposeRaw !== "Rent") {
    return;
  }
  const purpose = purposeRaw as ListingPurpose;
  const type = typeRaw as ListingType;
  const isPlot = type === ListingType.Plot;
  const requiresRoomDetails = !isPlot;

  if (
    !Number.isFinite(areaSqftRaw) ||
    !Number.isFinite(priceRaw) ||
    !Number.isFinite(bedsRaw) ||
    !Number.isFinite(bathsRaw) ||
    !Number.isFinite(balconiesRaw) ||
    !Number.isFinite(parkingSpotsRaw) ||
    !Number.isFinite(propertyAgeYearsRaw)
  ) {
    return;
  }
  if (areaSqftRaw <= 0 || priceRaw <= 0) {
    return;
  }
  if (
    bedsRaw < 0 ||
    bathsRaw < 0 ||
    balconiesRaw < 0 ||
    parkingSpotsRaw < 0 ||
    propertyAgeYearsRaw < 0
  ) {
    return;
  }
  if (
    requiresRoomDetails &&
    !Object.values(FurnishingType).includes(furnishingRaw as FurnishingType)
  ) {
    return;
  }
  if (!availableFrom) {
    return;
  }
  if (!ownerName || !ownerEmail || !ownerPhone) {
    return;
  }

  const furnishing = requiresRoomDetails
    ? (furnishingRaw as FurnishingType)
    : FurnishingType.Unfurnished;

  await prisma.listing.update({
    where: { id },
    data: {
      title,
      type,
      purpose,
      city,
      address,
      ownerName,
      ownerEmail,
      ownerPhone,
      image,
      imageUrls,
      description: withListingPurpose(description, purpose),
      beds: requiresRoomDetails ? Math.round(bedsRaw) : 0,
      baths: requiresRoomDetails ? Math.round(bathsRaw) : 0,
      balconies: requiresRoomDetails ? Math.round(balconiesRaw) : 0,
      parkingSpots: requiresRoomDetails ? Math.round(parkingSpotsRaw) : 0,
      furnishing,
      propertyAgeYears: requiresRoomDetails ? Math.round(propertyAgeYearsRaw) : 0,
      availableFrom,
      legalClearance,
      areaSqft: Math.round(areaSqftRaw),
      price: Math.round(priceRaw),
    },
  });
  await prisma.adminAuditLog.create({
    data: auditLogData(admin.email, {
      action: "EDIT_LISTING",
      targetType: "Listing",
      targetId: id,
      message: `Edited listing "${title}".`,
    }),
  });
  revalidatePath("/admin");
  revalidatePath("/listings");
  revalidatePath("/listings/buy");
  revalidatePath("/listings/rent");
  revalidatePath("/");
  revalidatePath("/my-properties");
}

export async function toggleFeaturedListingAction(
  listingId: string,
  formData?: FormData,
): Promise<void> {
  void formData;
  const admin = await requireAdmin();
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { isFeatured: true, title: true },
  });
  if (!listing) {
    return;
  }

  const nextFeatured = !listing.isFeatured;
  await prisma.listing.update({
    where: { id: listingId },
    data: { isFeatured: nextFeatured },
  });
  await prisma.adminAuditLog.create({
    data: auditLogData(admin.email, {
      action: nextFeatured ? "FEATURE_LISTING" : "UNFEATURE_LISTING",
      targetType: "Listing",
      targetId: listingId,
      message: `${nextFeatured ? "Featured" : "Unfeatured"} listing "${listing.title}".`,
    }),
  });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function restoreListingAction(
  listingId: string,
  formData?: FormData,
): Promise<void> {
  void formData;
  const admin = await requireAdmin();
  await prisma.listing.update({
    where: { id: listingId },
    data: { status: ListingStatus.PUBLISHED },
  });
  await removeListingFromRecycleBin(listingId);
  await prisma.adminAuditLog.create({
    data: auditLogData(admin.email, {
      action: "RESTORE_LISTING",
      targetType: "Listing",
      targetId: listingId,
    }),
  });
  revalidatePath("/admin");
  revalidatePath("/listings");
  revalidatePath("/listings/buy");
  revalidatePath("/listings/rent");
  revalidatePath("/");
  revalidatePath("/my-properties");
}

export async function permanentlyDeleteListingAction(
  listingId: string,
  formData?: FormData,
): Promise<void> {
  void formData;
  const admin = await requireAdmin();
  await prisma.listing.delete({
    where: { id: listingId },
  });
  await removeListingFromRecycleBin(listingId);
  await prisma.adminAuditLog.create({
    data: auditLogData(admin.email, {
      action: "PERMANENTLY_DELETE_LISTING",
      targetType: "Listing",
      targetId: listingId,
    }),
  });
  revalidatePath("/admin");
  revalidatePath("/listings");
  revalidatePath("/listings/buy");
  revalidatePath("/listings/rent");
  revalidatePath("/");
  revalidatePath("/my-properties");
}

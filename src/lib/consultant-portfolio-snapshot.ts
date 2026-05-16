import { ListingStatus, SubmissionStatus } from "@prisma/client";

import { isSubmissionEmailConfigured } from "@/lib/email/submission-status-email";
import { prisma } from "@/lib/prisma";

export type ConsultantPortfolioSnapshot = {
  liveCount: number;
  pendingCount: number;
  totalCount: number;
  ownerEmailAlerts: boolean;
};

export async function getConsultantPortfolioSnapshot(
  userId: string,
  email: string,
): Promise<ConsultantPortfolioSnapshot> {
  const submissions = await prisma.propertySubmission.findMany({
    where: {
      deletedAt: null,
      OR: [
        { appUserId: userId },
        { ownerEmail: { equals: email, mode: "insensitive" } },
      ],
    },
    select: { id: true, status: true },
  });

  const submissionIds = submissions.map((s) => s.id);
  const linkedListings =
    submissionIds.length === 0
      ? []
      : await prisma.listing.findMany({
          where: { sourceSubmissionId: { in: submissionIds } },
          select: { sourceSubmissionId: true, status: true },
        });

  const listingIdBySubmission = new Map<string, string>();
  for (const row of linkedListings) {
    if (!row.sourceSubmissionId) {
      continue;
    }
    if (row.status === ListingStatus.PUBLISHED) {
      listingIdBySubmission.set(row.sourceSubmissionId, row.sourceSubmissionId);
    }
  }

  const submissionsForDisplay = submissions.filter(
    (sub) =>
      sub.status !== SubmissionStatus.APPROVED ||
      !listingIdBySubmission.has(sub.id),
  );

  const liveCount = await prisma.listing.count({
    where: {
      status: ListingStatus.PUBLISHED,
      OR: [
        { ownerEmail: { equals: email, mode: "insensitive" } },
        ...(submissionIds.length > 0
          ? [{ sourceSubmissionId: { in: submissionIds } }]
          : []),
      ],
    },
  });

  const pendingCount = submissionsForDisplay.filter(
    (s) => s.status === SubmissionStatus.PENDING,
  ).length;

  return {
    liveCount,
    pendingCount,
    totalCount: submissions.length,
    ownerEmailAlerts: isSubmissionEmailConfigured(),
  };
}

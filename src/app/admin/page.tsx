import Link from "next/link";
import { ListingStatus, SubmissionStatus } from "@prisma/client";

import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { EditListingFormFields } from "@/components/EditListingFormFields";
import { EditModal } from "@/components/EditModal";
import { EditSubmissionFormFields } from "@/components/EditSubmissionFormFields";
import { SubmissionReviewModal } from "@/components/SubmissionReviewModal";
import {
  getListingRecycleBinEntries,
  purgeExpiredRecycleBinEntries,
} from "@/lib/listing-recycle-bin";
import { RECYCLE_BIN_RETENTION_DAYS, recycleBinCutoffDate } from "@/lib/recycle-bin-retention";
import {
  listingTypeLabel,
  submissionStatusLabel,
  submissionStatusTone,
} from "@/lib/listing-labels";
import {
  listingPurposeFor,
  stripListingPurpose,
} from "@/lib/listing-purpose";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

import {
  approveSubmissionAction,
  bulkSubmissionAction,
  deleteContactLeadAction,
  deleteListingAction,
  deleteSubmissionAction,
  editListingAction,
  editSubmissionAction,
  markSubmissionReviewedAction,
  permanentlyDeleteContactLeadAction,
  permanentlyDeleteListingAction,
  permanentlyDeleteSubmissionAction,
  rejectSubmissionAction,
  restoreContactLeadAction,
  restoreListingAction,
  restoreSubmissionAction,
  toggleFeaturedListingAction,
} from "./actions";

function formatUtc(value: Date) {
  return value.toISOString().replace("T", " ").slice(0, 16);
}

type PageProps = {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
    view?: string;
    lpage?: string;
    rpage?: string;
    cpage?: string;
  }>;
};

function normalizeListingView(value: string | undefined) {
  const v = (value ?? "ALL").toUpperCase();
  return v === "SALE" || v === "RENT" ? v : "ALL";
}

function listingPurposeView(listing: { type: string; description: string }) {
  return listingPurposeFor(listing).toUpperCase() as "SALE" | "RENT";
}

function listingPurposeLabel(listing: { type: string; description: string }) {
  return listingPurposeView(listing) === "RENT" ? "For rent" : "For sale";
}

function statusParamToEnum(value: string | undefined) {
  if (value === "PENDING") {
    return SubmissionStatus.PENDING;
  }
  if (value === "APPROVED") {
    return SubmissionStatus.APPROVED;
  }
  if (value === "REJECTED") {
    return SubmissionStatus.REJECTED;
  }
  return undefined;
}

function buildAdminQuery(params: {
  status?: string;
  q?: string;
  page?: number;
  view?: string;
  lpage?: number;
  rpage?: number;
  cpage?: number;
}) {
  const search = new URLSearchParams();
  if (params.status && params.status !== "ALL") {
    search.set("status", params.status);
  }
  if (params.q?.trim()) {
    search.set("q", params.q.trim());
  }
  if (params.page && params.page > 1) {
    search.set("page", String(params.page));
  }
  if (params.view && params.view !== "ALL") {
    search.set("view", params.view);
  }
  if (params.lpage && params.lpage > 1) {
    search.set("lpage", String(params.lpage));
  }
  if (params.rpage && params.rpage > 1) {
    search.set("rpage", String(params.rpage));
  }
  if (params.cpage && params.cpage > 1) {
    search.set("cpage", String(params.cpage));
  }
  const query = search.toString();
  return query ? `/admin?${query}` : "/admin";
}

export default async function AdminDashboardPage(props: PageProps) {
  const adminSession = await requireAdmin();
  const expiredListingIds = await purgeExpiredRecycleBinEntries(
    RECYCLE_BIN_RETENTION_DAYS,
  );
  if (expiredListingIds.length) {
    await prisma.listing.deleteMany({
      where: { id: { in: expiredListingIds } },
    });
  }
  const softDeleteCutoff = recycleBinCutoffDate();
  await prisma.$transaction([
    prisma.propertySubmission.deleteMany({
      where: { deletedAt: { lt: softDeleteCutoff } },
    }),
    prisma.contactLead.deleteMany({
      where: { deletedAt: { lt: softDeleteCutoff } },
    }),
  ]);
  const recycleBinEntries = await getListingRecycleBinEntries();
  const recycleBinDeletedAtMap = new Map(
    recycleBinEntries.map((item) => [item.listingId, item.deletedAtIso]),
  );
  const recycleBinIds = recycleBinEntries.map((item) => item.listingId);
  const searchParams = await props.searchParams;
  const activeStatus = searchParams.status ?? "ALL";
  const searchText = searchParams.q?.trim() ?? "";
  const activeView = normalizeListingView(searchParams.view);
  const pageSize = 12;
  const listingsPageSize = 12;
  const recycleBinPageSize = 12;
  const leadsPageSize = 20;
  const currentPage = Math.max(1, Number(searchParams.page || "1") || 1);
  const currentLpage = Math.max(1, Number(searchParams.lpage || "1") || 1);
  const currentRpage = Math.max(1, Number(searchParams.rpage || "1") || 1);
  const currentCpage = Math.max(1, Number(searchParams.cpage || "1") || 1);
  const statusEnum = statusParamToEnum(activeStatus);

  const submissionWhere = {
    deletedAt: null,
    ...(statusEnum ? { status: statusEnum } : {}),
    ...(searchText
      ? {
          OR: [
            { ownerName: { contains: searchText, mode: "insensitive" as const } },
            { city: { contains: searchText, mode: "insensitive" as const } },
            { ownerEmail: { contains: searchText, mode: "insensitive" as const } },
            { ownerPhone: { contains: searchText, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [
    submissions,
    submissionTotal,
    pendingCount,
    pendingAwaitingReviewCount,
    approvedCount,
    rejectedCount,
    publishedListings,
    recycledListings,
    leads,
    leadsTotal,
    recycledSubmissions,
    recycledLeads,
    auditLogs,
  ] = await Promise.all([
    prisma.propertySubmission.findMany({
      where: submissionWhere,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.propertySubmission.count({ where: submissionWhere }),
    prisma.propertySubmission.count({
      where: { status: SubmissionStatus.PENDING, deletedAt: null },
    }),
    prisma.propertySubmission.count({
      where: {
        status: SubmissionStatus.PENDING,
        deletedAt: null,
        reviewedAt: null,
      },
    }),
    prisma.propertySubmission.count({
      where: { status: SubmissionStatus.APPROVED, deletedAt: null },
    }),
    prisma.propertySubmission.count({
      where: { status: SubmissionStatus.REJECTED, deletedAt: null },
    }),
    prisma.listing.findMany({
      where: { status: ListingStatus.PUBLISHED },
      orderBy: { createdAt: "desc" },
    }),
    recycleBinIds.length
      ? prisma.listing.findMany({
          where: {
            id: { in: recycleBinIds },
            status: ListingStatus.PENDING,
          },
        })
      : Promise.resolve([]),
    prisma.contactLead.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      skip: (currentCpage - 1) * leadsPageSize,
      take: leadsPageSize,
    }),
    prisma.contactLead.count({ where: { deletedAt: null } }),
    prisma.propertySubmission.findMany({
      where: { deletedAt: { not: null } },
    }),
    prisma.contactLead.findMany({
      where: { deletedAt: { not: null } },
    }),
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(submissionTotal / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const filteredPublishedListings =
    activeView === "RENT"
      ? publishedListings.filter((listing) => listingPurposeView(listing) === "RENT")
      : activeView === "SALE"
        ? publishedListings.filter((listing) => listingPurposeView(listing) === "SALE")
        : publishedListings;
  const filteredPublishedTotal = filteredPublishedListings.length;
  const listingsTotalPages = Math.max(
    1,
    Math.ceil(filteredPublishedTotal / listingsPageSize),
  );
  const safeLpage = Math.min(currentLpage, listingsTotalPages);
  const pagedPublishedListings = filteredPublishedListings.slice(
    (safeLpage - 1) * listingsPageSize,
    safeLpage * listingsPageSize,
  );

  type RecycleBinRow =
    | {
        kind: "listing";
        deletedAt: Date;
        listing: (typeof recycledListings)[number];
      }
    | {
        kind: "submission";
        deletedAt: Date;
        submission: (typeof recycledSubmissions)[number];
      }
    | {
        kind: "lead";
        deletedAt: Date;
        lead: (typeof recycledLeads)[number];
      };

  const sortedRecycleRows: RecycleBinRow[] = [
    ...recycledListings.map((listing) => ({
      kind: "listing" as const,
      listing,
      deletedAt: recycleBinDeletedAtMap.has(listing.id)
        ? new Date(recycleBinDeletedAtMap.get(listing.id)!)
        : listing.updatedAt,
    })),
    ...recycledSubmissions.map((submission) => ({
      kind: "submission" as const,
      submission,
      deletedAt: submission.deletedAt!,
    })),
    ...recycledLeads.map((lead) => ({
      kind: "lead" as const,
      lead,
      deletedAt: lead.deletedAt!,
    })),
  ].sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());

  const recycleTotalPages = Math.max(
    1,
    Math.ceil(sortedRecycleRows.length / recycleBinPageSize),
  );
  const safeRpage = Math.min(currentRpage, recycleTotalPages);
  const pagedRecycleRows = sortedRecycleRows.slice(
    (safeRpage - 1) * recycleBinPageSize,
    safeRpage * recycleBinPageSize,
  );

  const leadsTotalPages = Math.max(1, Math.ceil(leadsTotal / leadsPageSize));
  const safeCpage = Math.min(currentCpage, leadsTotalPages);

  return (
    <div className="admin-portal admin-dashboard">
      <div className="admin-dashboard-sticky-head">
      <header className="admin-topbar admin-dashboard-topbar">
        <div className="container admin-topbar-inner">
          <div className="admin-topbar-brand">
            <span className="admin-topbar-badge">J3 Clusters</span>
            <div>
              <h1 className="admin-topbar-title">Operations dashboard</h1>
              <p className="admin-topbar-sub">
                Review submissions, publish listings, and manage leads
              </p>
            </div>
          </div>
          <div className="admin-topbar-actions">
            <Link
              href="/"
              className="admin-topbar-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              View public site
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
        <div className="container admin-quick-nav-wrap">
          <nav className="admin-quick-nav" aria-label="Jump to section">
            <a href="#submissions">Submissions</a>
            <a href="#listings">Listings</a>
            <a href="#recycle">Recycle bin</a>
            <a href="#leads">Leads</a>
            <a href="#audit">Audit log</a>
          </nav>
        </div>
      </div>

      <main className="admin-portal-main section">
        <div className="admin-overview-strip">
          <div className="admin-metrics admin-dashboard-metrics">
            <div className="admin-metric-card admin-metric-pending">
              <span className="admin-metric-label">Pending</span>
              <strong>{pendingCount}</strong>
              <span className="admin-metric-hint">In queue</span>
            </div>
            <div className="admin-metric-card admin-metric-review">
              <span className="admin-metric-label">Awaiting review</span>
              <strong>{pendingAwaitingReviewCount}</strong>
              <span className="admin-metric-hint">Needs attention</span>
            </div>
            <div className="admin-metric-card admin-metric-approved">
              <span className="admin-metric-label">Approved</span>
              <strong>{approvedCount}</strong>
              <span className="admin-metric-hint">Processed</span>
            </div>
            <div className="admin-metric-card admin-metric-rejected">
              <span className="admin-metric-label">Rejected</span>
              <strong>{rejectedCount}</strong>
              <span className="admin-metric-hint">Not published</span>
            </div>
            <div className="admin-metric-card admin-metric-leads">
              <span className="admin-metric-label">Contact leads</span>
              <strong>{leadsTotal}</strong>
              <span className="admin-metric-hint">Active inquiries</span>
            </div>
            <div className="admin-metric-card admin-metric-live">
              <span className="admin-metric-label">Live listings</span>
              <strong>{publishedListings.length}</strong>
              <span className="admin-metric-hint">On public site</span>
            </div>
          </div>
        </div>

      <section id="submissions" className="admin-panel admin-panel-submissions">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title">Property submissions</h2>
          <span className="admin-panel-chip">{submissionTotal} total</span>
        </div>
        <p className="admin-panel-desc">
          New posts are <strong>PENDING</strong>. Open <strong>Review</strong>, then{" "}
          <strong>Mark as reviewed</strong> before <strong>Approve &amp; publish</strong>{" "}
          moves the property to live listings. Deleting sends a submission to the
          recycle bin for {RECYCLE_BIN_RETENTION_DAYS} days.
        </p>
        <form method="get" className="admin-filter-row" action="/admin">
          <input
            type="text"
            name="q"
            placeholder="Search consultant, city, email, or phone"
            defaultValue={searchText}
          />
          <select name="status" defaultValue={activeStatus}>
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          {activeView !== "ALL" ? (
            <input type="hidden" name="view" value={activeView} />
          ) : null}
          <button type="submit">Apply</button>
          <Link className="secondary-btn reset-link" href="/admin">
            Reset
          </Link>
        </form>
        <div className="admin-tabs">
          <Link
            href={buildAdminQuery({ status: "ALL", q: searchText, view: activeView })}
            className={activeStatus === "ALL" ? "admin-tab-active" : ""}
          >
            All
          </Link>
          <Link
            href={buildAdminQuery({ status: "PENDING", q: searchText, view: activeView })}
            className={activeStatus === "PENDING" ? "admin-tab-active" : ""}
          >
            Pending
          </Link>
          <Link
            href={buildAdminQuery({ status: "APPROVED", q: searchText, view: activeView })}
            className={activeStatus === "APPROVED" ? "admin-tab-active" : ""}
          >
            Approved
          </Link>
          <Link
            href={buildAdminQuery({ status: "REJECTED", q: searchText, view: activeView })}
            className={activeStatus === "REJECTED" ? "admin-tab-active" : ""}
          >
            Rejected
          </Link>
        </div>
        <p className="admin-panel-desc admin-panel-meta">
          Showing {submissions.length} of {submissionTotal} submissions
          (page {safePage} of {totalPages})
        </p>
        <div className="admin-table-wrap admin-bulk-area">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Select</th>
                <th className="admin-th">When</th>
                <th className="admin-th">Consultant</th>
                <th className="admin-th">Type</th>
                <th className="admin-th">Purpose</th>
                <th className="admin-th">City</th>
                <th className="admin-th admin-th-num">Price (INR)</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="admin-td admin-td-bulk-bar" colSpan={9}>
                  <form id="bulk-submissions-form" action={bulkSubmissionAction}>
                    <div className="admin-action-row">
                      <ConfirmSubmitButton
                        name="intent"
                        value="approve"
                        variant="primary"
                        title="Approve & publish"
                        confirmLabel="Approve & publish"
                        confirmMessage="Only submissions already marked as reviewed will be published. Continue?"
                      >
                        Bulk approve
                      </ConfirmSubmitButton>
                      <ConfirmSubmitButton
                        name="intent"
                        value="reject"
                        className="secondary-btn"
                        title="Reject submissions"
                        confirmLabel="Reject"
                        confirmMessage="Reject all selected submissions? Consultants will not see these go live."
                      >
                        Bulk reject
                      </ConfirmSubmitButton>
                      <span className="admin-bulk-hint">
                        Bulk approve: select reviewed pending rows only (checkbox
                        appears after review).
                      </span>
                    </div>
                  </form>
                </td>
              </tr>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="admin-td">
                    {submission.status === "PENDING" &&
                    submission.reviewedAt ? (
                      <input
                        type="checkbox"
                        name="submissionIds"
                        value={submission.id}
                        form="bulk-submissions-form"
                        aria-label={`Select ${submission.ownerName} for bulk action`}
                      />
                    ) : (
                      <span className="admin-text-muted">—</span>
                    )}
                  </td>
                  <td className="admin-td">{formatUtc(submission.createdAt)}</td>
                  <td className="admin-td">
                    <div className="admin-owner-cell">
                      <span className="admin-owner-name">
                        {submission.ownerName}
                      </span>
                      <div className="admin-contact-chips">
                        <a
                          className="admin-contact-chip"
                          href={`mailto:${submission.ownerEmail}`}
                          aria-label={`Email ${submission.ownerName}`}
                        >
                          {submission.ownerEmail}
                        </a>
                        <a
                          className="admin-contact-chip"
                          href={`tel:${submission.ownerPhone}`}
                          aria-label={`Call ${submission.ownerName}`}
                        >
                          {submission.ownerPhone}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="admin-td">{listingTypeLabel(submission.type)}</td>
                  <td className="admin-td">
                    {listingPurposeFor(submission) === "Rent"
                      ? "For rent"
                      : "For sale"}
                  </td>
                  <td className="admin-td">{submission.city}</td>
                  <td className="admin-td admin-td-num">
                    {submission.price.toLocaleString("en-IN")}
                  </td>
                  <td className="admin-td">
                    <div className="admin-status-stack">
                      <span
                        className={`admin-status-badge admin-status-${submissionStatusTone(
                          submission.status,
                        )}`}
                      >
                        {submissionStatusLabel(submission.status)}
                      </span>
                      {submission.status === "PENDING" ? (
                        submission.reviewedAt ? (
                          <span className="admin-text-muted admin-status-sub">
                            Reviewed · {formatUtc(submission.reviewedAt)}
                          </span>
                        ) : (
                          <span className="admin-text-muted admin-status-sub">
                            Awaiting review
                          </span>
                        )
                      ) : null}
                    </div>
                  </td>
                  <td className="admin-td">
                    {submission.status === "PENDING" ? (
                      <div className="admin-action-stack">
                        <SubmissionReviewModal
                          submission={{
                            id: submission.id,
                            ownerName: submission.ownerName,
                            ownerEmail: submission.ownerEmail,
                            ownerPhone: submission.ownerPhone,
                            ownerPhotoUrl: submission.ownerPhotoUrl,
                            type: submission.type,
                            purpose: listingPurposeFor(submission),
                            city: submission.city,
                            address: submission.address,
                            areaSqft: submission.areaSqft,
                            bedrooms: submission.bedrooms,
                            bathrooms: submission.bathrooms,
                            balconies: submission.balconies,
                            parkingSpots: submission.parkingSpots,
                            furnishing: submission.furnishing,
                            propertyAgeYears: submission.propertyAgeYears,
                            availableFrom: submission.availableFrom,
                            legalClearance: submission.legalClearance,
                            price: submission.price,
                            description: stripListingPurpose(
                              submission.description,
                            ),
                            images:
                              submission.imageUrls.length > 0
                                ? submission.imageUrls
                                : [submission.imageUrl],
                            createdAtIso: submission.createdAt.toISOString(),
                          }}
                          approveAction={approveSubmissionAction.bind(
                            null,
                            submission.id,
                          )}
                          rejectAction={rejectSubmissionAction.bind(
                            null,
                            submission.id,
                          )}
                          markReviewedAction={markSubmissionReviewedAction.bind(
                            null,
                            submission.id,
                          )}
                          reviewedAtIso={
                            submission.reviewedAt
                              ? submission.reviewedAt.toISOString()
                              : null
                          }
                        />
                        {!submission.reviewedAt ? (
                          <form
                            action={markSubmissionReviewedAction.bind(
                              null,
                              submission.id,
                            )}
                          >
                            <ConfirmSubmitButton
                              variant="primary"
                              title="Mark submission as reviewed"
                              confirmLabel="Mark as reviewed"
                              confirmMessage="Record that you have reviewed this submission? You can then approve to publish it."
                            >
                              Mark as reviewed
                            </ConfirmSubmitButton>
                          </form>
                        ) : (
                          <form
                            action={approveSubmissionAction.bind(null, submission.id)}
                          >
                            <ConfirmSubmitButton
                              variant="primary"
                              title="Approve & publish"
                              confirmLabel="Approve & publish"
                              confirmMessage={`Publish "${submission.type} in ${submission.city}" as a live listing?`}
                            >
                              Approve & publish
                            </ConfirmSubmitButton>
                          </form>
                        )}
                        <form
                          action={rejectSubmissionAction.bind(null, submission.id)}
                        >
                          <ConfirmSubmitButton
                            className="secondary-btn"
                            title="Reject submission"
                            confirmLabel="Reject"
                            confirmMessage="Reject this submission? The consultant will not see it go live."
                          >
                            Reject
                          </ConfirmSubmitButton>
                        </form>
                        <EditModal
                          title="Edit submission"
                          subtitle={submission.ownerName}
                          size="lg"
                          formId={`edit-submission-${submission.id}`}
                          saveLabel="Save submission"
                        >
                          <EditSubmissionFormFields
                            formId={`edit-submission-${submission.id}`}
                            formAction={editSubmissionAction}
                            defaults={{
                              id: submission.id,
                              ownerName: submission.ownerName,
                              ownerEmail: submission.ownerEmail,
                              ownerPhone: submission.ownerPhone,
                              ownerPhotoUrl: submission.ownerPhotoUrl,
                              type: submission.type,
                              purpose: listingPurposeFor(submission),
                              city: submission.city,
                              address: submission.address,
                              areaSqft: submission.areaSqft,
                              bedrooms: submission.bedrooms,
                              bathrooms: submission.bathrooms,
                              balconies: submission.balconies,
                              parkingSpots: submission.parkingSpots,
                              furnishing: submission.furnishing,
                              propertyAgeYears: submission.propertyAgeYears,
                              availableFrom: submission.availableFrom,
                              legalClearance: submission.legalClearance,
                              price: submission.price,
                              description: stripListingPurpose(
                                submission.description,
                              ),
                              imageUrls:
                                submission.imageUrls.length > 0
                                  ? submission.imageUrls
                                  : [submission.imageUrl],
                            }}
                            maxImages={10}
                          />
                        </EditModal>
                        <form
                          action={deleteSubmissionAction.bind(null, submission.id)}
                        >
                          <ConfirmSubmitButton
                            className="secondary-btn danger-btn"
                            title="Move submission to recycle bin"
                            confirmLabel="Move to recycle bin"
                            confirmMessage={`This submission will be hidden from the queue and kept in the recycle bin for ${RECYCLE_BIN_RETENTION_DAYS} days. You can restore it from there.`}
                          >
                            Delete
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    ) : (
                      <form
                        action={deleteSubmissionAction.bind(null, submission.id)}
                      >
                        <ConfirmSubmitButton
                          className="secondary-btn danger-btn"
                          title="Move submission to recycle bin"
                          confirmLabel="Move to recycle bin"
                          confirmMessage={`This submission will be hidden from the queue and kept in the recycle bin for ${RECYCLE_BIN_RETENTION_DAYS} days. You can restore it from there.`}
                        >
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {submissionTotal > 0 ? (
          <div className="pagination-row">
            <Link
              className={`secondary-btn ${safePage <= 1 ? "disabled-link" : ""}`}
              href={buildAdminQuery({
                status: activeStatus,
                q: searchText,
                page: Math.max(1, safePage - 1),
                view: activeView,
                lpage: safeLpage,
                rpage: safeRpage,
                cpage: safeCpage,
              })}
              aria-disabled={safePage <= 1}
            >
              Previous
            </Link>
            <span>
              Page {safePage} of {totalPages}
            </span>
            <Link
              className={`secondary-btn ${
                safePage >= totalPages ? "disabled-link" : ""
              }`}
              href={buildAdminQuery({
                status: activeStatus,
                q: searchText,
                page: Math.min(totalPages, safePage + 1),
                view: activeView,
                lpage: safeLpage,
                rpage: safeRpage,
                cpage: safeCpage,
              })}
              aria-disabled={safePage >= totalPages}
            >
              Next
            </Link>
          </div>
        ) : null}
      </section>

      <section id="listings" className="admin-panel admin-panel-listings">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title">Published listings</h2>
          <span className="admin-panel-chip">{publishedListings.length} live</span>
        </div>
        <p className="admin-panel-desc">
          Deleting moves a listing to the recycle bin for {RECYCLE_BIN_RETENTION_DAYS}{" "}
          days. Use the tabs to filter by purpose (For sale or For rent).
        </p>
        <div className="admin-tabs">
          <Link
            href={buildAdminQuery({
              status: activeStatus,
              q: searchText,
              page: safePage,
              view: "ALL",
            })}
            className={activeView === "ALL" ? "admin-tab-active" : ""}
          >
            All ({publishedListings.length})
          </Link>
          <Link
            href={buildAdminQuery({
              status: activeStatus,
              q: searchText,
              page: safePage,
              view: "SALE",
            })}
            className={activeView === "SALE" ? "admin-tab-active" : ""}
          >
            For sale (
            {
              publishedListings.filter(
                (listing) => listingPurposeView(listing) === "SALE",
              ).length
            }
            )
          </Link>
          <Link
            href={buildAdminQuery({
              status: activeStatus,
              q: searchText,
              page: safePage,
              view: "RENT",
            })}
            className={activeView === "RENT" ? "admin-tab-active" : ""}
          >
            For rent (
            {
              publishedListings.filter(
                (listing) => listingPurposeView(listing) === "RENT",
              ).length
            }
            )
          </Link>
        </div>
        <p className="admin-panel-desc admin-panel-meta">
          Showing {pagedPublishedListings.length} of{" "}
          {filteredPublishedListings.length} published listings
          {activeView === "ALL" ? "" : ` (${activeView === "RENT" ? "For rent" : "For sale"})`}
          {listingsTotalPages > 1
            ? ` • page ${safeLpage} of ${listingsTotalPages}`
            : ""}
        </p>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">When</th>
                <th className="admin-th">Title</th>
                <th className="admin-th">Type</th>
                <th className="admin-th">Purpose</th>
                <th className="admin-th">City</th>
                <th className="admin-th">Featured</th>
                <th className="admin-th">Approved</th>
                <th className="admin-th admin-th-num">Price (INR)</th>
                <th className="admin-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {pagedPublishedListings.map((listing) => (
                <tr key={listing.id}>
                  <td className="admin-td">{formatUtc(listing.createdAt)}</td>
                  <td className="admin-td">{listing.title}</td>
                  <td className="admin-td">{listingTypeLabel(listing.type)}</td>
                  <td className="admin-td">{listingPurposeLabel(listing)}</td>
                  <td className="admin-td">{listing.city}</td>
                  <td className="admin-td">
                    <span
                      className={`admin-status-badge ${
                        listing.isFeatured
                          ? "admin-status-success"
                          : "admin-status-neutral"
                      }`}
                    >
                      {listing.isFeatured ? "Featured" : "Standard"}
                    </span>
                  </td>
                  <td className="admin-td">
                    <div className="admin-owner-cell">
                      <span>
                        {listing.approvedAt ? formatUtc(listing.approvedAt) : "—"}
                      </span>
                      <span className="admin-text-muted">
                        {listing.approvedByEmail ?? "Unknown admin"}
                      </span>
                    </div>
                  </td>
                  <td className="admin-td admin-td-num">
                    {listing.price.toLocaleString("en-IN")}
                  </td>
                  <td className="admin-td">
                    <div className="admin-action-stack">
                      <Link
                        href={`/property/${listing.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="secondary-btn admin-preview-link"
                      >
                        Preview
                      </Link>
                      <form
                        action={toggleFeaturedListingAction.bind(null, listing.id)}
                      >
                        <button type="submit" className="secondary-btn">
                          {listing.isFeatured ? "Unfeature" : "Feature"}
                        </button>
                      </form>
                      <EditModal
                        title="Edit listing"
                        subtitle={listing.title}
                        size="lg"
                        formId={`edit-listing-${listing.id}`}
                        saveLabel="Save listing"
                      >
                        <EditListingFormFields
                          formId={`edit-listing-${listing.id}`}
                          formAction={editListingAction}
                          defaults={{
                            id: listing.id,
                            title: listing.title,
                            type: listing.type,
                            purpose: listingPurposeFor(listing),
                            city: listing.city,
                            address: listing.address,
                            beds: listing.beds,
                            baths: listing.baths,
                            balconies: listing.balconies,
                            parkingSpots: listing.parkingSpots,
                            furnishing: listing.furnishing,
                            propertyAgeYears: listing.propertyAgeYears,
                            availableFrom: listing.availableFrom,
                            legalClearance: listing.legalClearance,
                            ownerName: listing.ownerName,
                            ownerEmail: listing.ownerEmail,
                            ownerPhone: listing.ownerPhone,
                            ownerPhotoUrl: listing.ownerPhotoUrl,
                            areaSqft: listing.areaSqft,
                            price: listing.price,
                            description: stripListingPurpose(
                              listing.description,
                            ),
                            imageUrls:
                              listing.imageUrls.length > 0
                                ? listing.imageUrls
                                : [listing.image],
                          }}
                          maxImages={11}
                        />
                      </EditModal>
                      <form action={deleteListingAction.bind(null, listing.id)}>
                        <ConfirmSubmitButton
                          className="secondary-btn danger-btn"
                          title="Move to recycle bin"
                          confirmLabel="Move to recycle bin"
                          confirmMessage="This listing will be hidden from the public site and kept in the recycle bin for 30 days. You can restore it any time before then."
                        >
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {pagedPublishedListings.length === 0 ? (
                <tr>
                  <td className="admin-td" colSpan={9}>
                    {activeView === "ALL"
                      ? "No published listings found."
                      : activeView === "RENT"
                        ? "No published listings for rent."
                        : "No published listings for sale."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {listingsTotalPages > 1 ? (
          <div className="pagination-row">
            <Link
              className={`secondary-btn ${safeLpage <= 1 ? "disabled-link" : ""}`}
              href={buildAdminQuery({
                status: activeStatus,
                q: searchText,
                page: safePage,
                view: activeView,
                lpage: Math.max(1, safeLpage - 1),
                rpage: safeRpage,
                cpage: safeCpage,
              })}
              aria-disabled={safeLpage <= 1}
            >
              Previous
            </Link>
            <span>
              Page {safeLpage} of {listingsTotalPages}
            </span>
            <Link
              className={`secondary-btn ${
                safeLpage >= listingsTotalPages ? "disabled-link" : ""
              }`}
              href={buildAdminQuery({
                status: activeStatus,
                q: searchText,
                page: safePage,
                view: activeView,
                lpage: Math.min(listingsTotalPages, safeLpage + 1),
                rpage: safeRpage,
                cpage: safeCpage,
              })}
              aria-disabled={safeLpage >= listingsTotalPages}
            >
              Next
            </Link>
          </div>
        ) : null}
      </section>

      <section id="recycle" className="admin-panel admin-panel-recycle">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title">
            Recycle bin ({RECYCLE_BIN_RETENTION_DAYS} days)
          </h2>
          <span className="admin-panel-chip">{sortedRecycleRows.length} items</span>
        </div>
        <p className="admin-panel-desc">
          Deleted listings, submissions, and contact leads stay here for{" "}
          {RECYCLE_BIN_RETENTION_DAYS} days, then are removed automatically.
          {recycleTotalPages > 1
            ? ` Page ${safeRpage} of ${recycleTotalPages}.`
            : ""}
        </p>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Deleted on</th>
                <th className="admin-th">Type</th>
                <th className="admin-th">Summary</th>
                <th className="admin-th admin-th-num">Price (INR)</th>
                <th className="admin-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {pagedRecycleRows.map((row) => (
                <tr
                  key={
                    row.kind === "listing"
                      ? `listing-${row.listing.id}`
                      : row.kind === "submission"
                        ? `submission-${row.submission.id}`
                        : `lead-${row.lead.id}`
                  }
                >
                  <td className="admin-td">{formatUtc(row.deletedAt)}</td>
                  <td className="admin-td">
                    {row.kind === "listing"
                      ? "Listing"
                      : row.kind === "submission"
                        ? "Submission"
                        : "Lead"}
                  </td>
                  <td className="admin-td">
                    {row.kind === "listing" ? (
                      <>
                        <div>{row.listing.title}</div>
                        <span className="admin-text-muted">{row.listing.city}</span>
                      </>
                    ) : row.kind === "submission" ? (
                      <>
                        <div>{row.submission.ownerName}</div>
                        <span className="admin-text-muted">
                          {listingTypeLabel(row.submission.type)} ·{" "}
                          {row.submission.city}
                        </span>
                      </>
                    ) : (
                      <>
                        <div>{row.lead.name}</div>
                        <span className="admin-text-muted">{row.lead.email}</span>
                      </>
                    )}
                  </td>
                  <td className="admin-td admin-td-num">
                    {row.kind === "listing"
                      ? row.listing.price.toLocaleString("en-IN")
                      : row.kind === "submission"
                        ? row.submission.price.toLocaleString("en-IN")
                        : "—"}
                  </td>
                  <td className="admin-td">
                    <div className="admin-action-stack">
                      {row.kind === "listing" ? (
                        <>
                          <form
                            action={restoreListingAction.bind(null, row.listing.id)}
                          >
                            <ConfirmSubmitButton
                              className="secondary-btn"
                              title="Restore listing"
                              confirmLabel="Restore listing"
                              confirmMessage="This listing will be restored and shown again on the public site."
                              variant="primary"
                            >
                              Restore
                            </ConfirmSubmitButton>
                          </form>
                          <form
                            action={permanentlyDeleteListingAction.bind(
                              null,
                              row.listing.id,
                            )}
                          >
                            <ConfirmSubmitButton
                              className="secondary-btn danger-btn"
                              title="Permanently delete listing"
                              confirmLabel="Delete forever"
                              confirmMessage="This listing will be permanently removed from the database. This cannot be undone."
                              requireTypedValue={adminSession.email}
                              typedValueLabel={`Type your admin email "${adminSession.email}" to confirm`}
                            >
                              Delete forever
                            </ConfirmSubmitButton>
                          </form>
                        </>
                      ) : row.kind === "submission" ? (
                        <>
                          <form
                            action={restoreSubmissionAction.bind(
                              null,
                              row.submission.id,
                            )}
                          >
                            <ConfirmSubmitButton
                              className="secondary-btn"
                              title="Restore submission"
                              confirmLabel="Restore submission"
                              confirmMessage="This submission will return to the submissions queue with its previous status."
                              variant="primary"
                            >
                              Restore
                            </ConfirmSubmitButton>
                          </form>
                          <form
                            action={permanentlyDeleteSubmissionAction.bind(
                              null,
                              row.submission.id,
                            )}
                          >
                            <ConfirmSubmitButton
                              className="secondary-btn danger-btn"
                              title="Permanently delete submission"
                              confirmLabel="Delete forever"
                              confirmMessage="This submission will be permanently removed. This cannot be undone."
                              requireTypedValue={adminSession.email}
                              typedValueLabel={`Type your admin email "${adminSession.email}" to confirm`}
                            >
                              Delete forever
                            </ConfirmSubmitButton>
                          </form>
                        </>
                      ) : (
                        <>
                          <form
                            action={restoreContactLeadAction.bind(null, row.lead.id)}
                          >
                            <ConfirmSubmitButton
                              className="secondary-btn"
                              title="Restore lead"
                              confirmLabel="Restore lead"
                              confirmMessage="This contact lead will appear again in the Contact leads table."
                              variant="primary"
                            >
                              Restore
                            </ConfirmSubmitButton>
                          </form>
                          <form
                            action={permanentlyDeleteContactLeadAction.bind(
                              null,
                              row.lead.id,
                            )}
                          >
                            <ConfirmSubmitButton
                              className="secondary-btn danger-btn"
                              title="Permanently delete lead"
                              confirmLabel="Delete forever"
                              confirmMessage="This lead will be permanently removed. This cannot be undone."
                              requireTypedValue={adminSession.email}
                              typedValueLabel={`Type your admin email "${adminSession.email}" to confirm`}
                            >
                              Delete forever
                            </ConfirmSubmitButton>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {pagedRecycleRows.length === 0 ? (
                <tr>
                  <td className="admin-td" colSpan={5}>
                    Recycle bin is empty.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {recycleTotalPages > 1 ? (
          <div className="pagination-row">
            <Link
              className={`secondary-btn ${safeRpage <= 1 ? "disabled-link" : ""}`}
              href={buildAdminQuery({
                status: activeStatus,
                q: searchText,
                page: safePage,
                view: activeView,
                lpage: safeLpage,
                rpage: Math.max(1, safeRpage - 1),
                cpage: safeCpage,
              })}
              aria-disabled={safeRpage <= 1}
            >
              Previous
            </Link>
            <span>
              Page {safeRpage} of {recycleTotalPages}
            </span>
            <Link
              className={`secondary-btn ${
                safeRpage >= recycleTotalPages ? "disabled-link" : ""
              }`}
              href={buildAdminQuery({
                status: activeStatus,
                q: searchText,
                page: safePage,
                view: activeView,
                lpage: safeLpage,
                rpage: Math.min(recycleTotalPages, safeRpage + 1),
                cpage: safeCpage,
              })}
              aria-disabled={safeRpage >= recycleTotalPages}
            >
              Next
            </Link>
          </div>
        ) : null}
      </section>

      <section id="leads" className="admin-panel admin-panel-leads">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title">Contact leads</h2>
          <span className="admin-panel-chip">{leadsTotal} active</span>
        </div>
        <p className="admin-panel-desc">
          Inquiries captured from the Contact page. Deleting moves a lead to the
          recycle bin for {RECYCLE_BIN_RETENTION_DAYS} days.
          {leadsTotalPages > 1
            ? ` Page ${safeCpage} of ${leadsTotalPages}.`
            : ""}
        </p>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">When</th>
                <th className="admin-th">Name</th>
                <th className="admin-th">Contact</th>
                <th className="admin-th">Message</th>
                <th className="admin-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="admin-td">{formatUtc(lead.createdAt)}</td>
                  <td className="admin-td">{lead.name}</td>
                  <td className="admin-td">
                    <div className="admin-contact-chips">
                      <a
                        className="admin-contact-chip"
                        href={`mailto:${lead.email}`}
                      >
                        {lead.email}
                      </a>
                      <a
                        className="admin-contact-chip"
                        href={`tel:${lead.phone}`}
                      >
                        {lead.phone}
                      </a>
                    </div>
                  </td>
                  <td className="admin-td admin-td-clip">
                    {lead.message ?? "—"}
                  </td>
                  <td className="admin-td">
                    <form action={deleteContactLeadAction.bind(null, lead.id)}>
                      <ConfirmSubmitButton
                        className="secondary-btn danger-btn"
                        title="Move lead to recycle bin"
                        confirmLabel="Move to recycle bin"
                        confirmMessage={`This lead will be hidden here and kept in the recycle bin for ${RECYCLE_BIN_RETENTION_DAYS} days.`}
                      >
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
              {leads.length === 0 ? (
                <tr>
                  <td className="admin-td" colSpan={5}>
                    No leads captured yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {leadsTotalPages > 1 ? (
          <div className="pagination-row">
            <Link
              className={`secondary-btn ${safeCpage <= 1 ? "disabled-link" : ""}`}
              href={buildAdminQuery({
                status: activeStatus,
                q: searchText,
                page: safePage,
                view: activeView,
                lpage: safeLpage,
                rpage: safeRpage,
                cpage: Math.max(1, safeCpage - 1),
              })}
              aria-disabled={safeCpage <= 1}
            >
              Previous
            </Link>
            <span>
              Page {safeCpage} of {leadsTotalPages}
            </span>
            <Link
              className={`secondary-btn ${
                safeCpage >= leadsTotalPages ? "disabled-link" : ""
              }`}
              href={buildAdminQuery({
                status: activeStatus,
                q: searchText,
                page: safePage,
                view: activeView,
                lpage: safeLpage,
                rpage: safeRpage,
                cpage: Math.min(leadsTotalPages, safeCpage + 1),
              })}
              aria-disabled={safeCpage >= leadsTotalPages}
            >
              Next
            </Link>
          </div>
        ) : null}
      </section>

      <section id="audit" className="admin-panel admin-panel-audit">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title">Admin audit log</h2>
          <span className="admin-panel-chip">Last 50 events</span>
        </div>
        <p className="admin-panel-desc">
          Last 50 admin actions across submissions, listings, leads, and recycle
          bin operations.
        </p>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">When</th>
                <th className="admin-th">Admin</th>
                <th className="admin-th">Action</th>
                <th className="admin-th">Target</th>
                <th className="admin-th">Message</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="admin-td">{formatUtc(log.createdAt)}</td>
                  <td className="admin-td">{log.actorEmail}</td>
                  <td className="admin-td">{log.action.replaceAll("_", " ")}</td>
                  <td className="admin-td">
                    {log.targetType} / {log.targetId}
                  </td>
                  <td className="admin-td admin-td-clip">
                    {log.message ?? "—"}
                  </td>
                </tr>
              ))}
              {auditLogs.length === 0 ? (
                <tr>
                  <td className="admin-td" colSpan={5}>
                    No admin actions recorded yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <p className="admin-portal-footer">
        <Link href="/">← Back to website</Link>
      </p>
      </main>
    </div>
  );
}

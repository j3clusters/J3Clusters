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
  editListingAction,
  deleteListingAction,
  deleteSubmissionAction,
  editSubmissionAction,
  permanentlyDeleteListingAction,
  rejectSubmissionAction,
  restoreListingAction,
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
  const expiredListingIds = await purgeExpiredRecycleBinEntries(30);
  if (expiredListingIds.length) {
    await prisma.listing.deleteMany({
      where: { id: { in: expiredListingIds } },
    });
  }
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
    approvedCount,
    rejectedCount,
    publishedListings,
    recycledListings,
    leads,
    leadsTotal,
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
      where: { status: SubmissionStatus.PENDING },
    }),
    prisma.propertySubmission.count({
      where: { status: SubmissionStatus.APPROVED },
    }),
    prisma.propertySubmission.count({
      where: { status: SubmissionStatus.REJECTED },
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
      orderBy: { createdAt: "desc" },
      skip: (currentCpage - 1) * leadsPageSize,
      take: leadsPageSize,
    }),
    prisma.contactLead.count(),
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

  const sortedRecycledListings = [...recycledListings].sort((a, b) => {
    const aTime = new Date(recycleBinDeletedAtMap.get(a.id) || 0).getTime();
    const bTime = new Date(recycleBinDeletedAtMap.get(b.id) || 0).getTime();
    return bTime - aTime;
  });
  const recycleTotalPages = Math.max(
    1,
    Math.ceil(sortedRecycledListings.length / recycleBinPageSize),
  );
  const safeRpage = Math.min(currentRpage, recycleTotalPages);
  const pagedRecycledListings = sortedRecycledListings.slice(
    (safeRpage - 1) * recycleBinPageSize,
    safeRpage * recycleBinPageSize,
  );

  const leadsTotalPages = Math.max(1, Math.ceil(leadsTotal / leadsPageSize));
  const safeCpage = Math.min(currentCpage, leadsTotalPages);

  return (
    <div className="admin-portal">
      <header className="admin-topbar">
        <div className="container admin-topbar-inner">
          <div className="admin-topbar-brand">
            <span className="admin-topbar-badge">Admin</span>
            <h1 className="admin-topbar-title">Operations dashboard</h1>
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

      <main className="admin-portal-main section">
      <section className="admin-panel">
        <h2 className="admin-panel-title">Property submissions</h2>
        <p className="admin-panel-desc">
          Posts from owners are stored as <strong>PENDING</strong>. Approve to
          publish a live listing.
        </p>
        <form method="get" className="admin-filter-row" action="/admin">
          <input
            type="text"
            name="q"
            placeholder="Search owner, city, email, or phone"
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
        <div className="admin-metrics">
          <div className="admin-metric-card">
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>
          <div className="admin-metric-card">
            <span>Approved</span>
            <strong>{approvedCount}</strong>
          </div>
          <div className="admin-metric-card">
            <span>Rejected</span>
            <strong>{rejectedCount}</strong>
          </div>
          <div className="admin-metric-card">
            <span>Leads</span>
            <strong>{leadsTotal}</strong>
          </div>
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
                <th className="admin-th">Owner</th>
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
                        confirmMessage="The selected submissions will go live as published listings. Continue?"
                      >
                        Bulk approve
                      </ConfirmSubmitButton>
                      <ConfirmSubmitButton
                        name="intent"
                        value="reject"
                        className="secondary-btn"
                        title="Reject submissions"
                        confirmLabel="Reject"
                        confirmMessage="Reject all selected submissions? Owners will not see these go live."
                      >
                        Bulk reject
                      </ConfirmSubmitButton>
                      <span className="admin-bulk-hint">
                        Select at least one row to enable bulk actions.
                      </span>
                    </div>
                  </form>
                </td>
              </tr>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="admin-td">
                    {submission.status === "PENDING" ? (
                      <input
                        type="checkbox"
                        name="submissionIds"
                        value={submission.id}
                        form="bulk-submissions-form"
                        aria-label={`Select ${submission.ownerName}`}
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
                    <span
                      className={`admin-status-badge admin-status-${submissionStatusTone(
                        submission.status,
                      )}`}
                    >
                      {submissionStatusLabel(submission.status)}
                    </span>
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
                        />
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
                        <form
                          action={rejectSubmissionAction.bind(null, submission.id)}
                        >
                          <ConfirmSubmitButton
                            className="secondary-btn"
                            title="Reject submission"
                            confirmLabel="Reject"
                            confirmMessage="Reject this submission? The owner will not see it go live."
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
                            title="Delete submission"
                            confirmLabel="Delete submission"
                            confirmMessage="This submission will be permanently removed. This cannot be undone."
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
                          title="Delete submission"
                          confirmLabel="Delete submission"
                          confirmMessage="This submission will be permanently removed. This cannot be undone."
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

      <section className="admin-panel">
        <h2 className="admin-panel-title">Published listings</h2>
        <p className="admin-panel-desc">
          Deleting moves a listing to recycle bin for 30 days. Use the tabs to
          filter by purpose (For sale or For rent).
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

      <section className="admin-panel">
        <h2 className="admin-panel-title">Recycle bin (30 days)</h2>
        <p className="admin-panel-desc">
          Deleted listings stay here for 30 days, then are auto-removed.
          {recycleTotalPages > 1
            ? ` Page ${safeRpage} of ${recycleTotalPages}.`
            : ""}
        </p>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Deleted on</th>
                <th className="admin-th">Title</th>
                <th className="admin-th">City</th>
                <th className="admin-th admin-th-num">Price (INR)</th>
                <th className="admin-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {pagedRecycledListings.map((listing) => (
                <tr key={listing.id}>
                  <td className="admin-td">
                    {recycleBinDeletedAtMap.get(listing.id)
                      ? formatUtc(new Date(recycleBinDeletedAtMap.get(listing.id)!))
                      : "—"}
                  </td>
                  <td className="admin-td">{listing.title}</td>
                  <td className="admin-td">{listing.city}</td>
                  <td className="admin-td admin-td-num">
                    {listing.price.toLocaleString("en-IN")}
                  </td>
                  <td className="admin-td">
                    <div className="admin-action-stack">
                      <form action={restoreListingAction.bind(null, listing.id)}>
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
                        action={permanentlyDeleteListingAction.bind(null, listing.id)}
                      >
                        <ConfirmSubmitButton
                          className="secondary-btn danger-btn"
                          title="Permanently delete listing"
                          confirmLabel="Delete forever"
                          confirmMessage="This listing will be permanently removed from the database. This cannot be undone."
                          requireTypedValue={adminSession.email}
                          typedValueLabel={`Type your admin name "${adminSession.email}" to confirm`}
                        >
                          Delete forever
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {pagedRecycledListings.length === 0 ? (
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

      <section className="admin-panel">
        <h2 className="admin-panel-title">Contact leads</h2>
        <p className="admin-panel-desc">
          Inquiries captured from the Contact page.
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
                </tr>
              ))}
              {leads.length === 0 ? (
                <tr>
                  <td className="admin-td" colSpan={4}>
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

      <section className="admin-panel">
        <h2 className="admin-panel-title">Admin audit log</h2>
        <p className="admin-panel-desc">
          Last 50 admin actions across submissions, listings, and recycle bin
          operations.
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

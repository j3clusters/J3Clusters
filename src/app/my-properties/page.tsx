import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ListingStatus, SubmissionStatus } from "@prisma/client";

import { OwnerPortalNav } from "@/components/OwnerPortalNav";
import { UserLogoutButton } from "@/components/UserLogoutButton";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { isSubmissionEmailConfigured } from "@/lib/email/submission-status-email";

function submissionStatusLabel(status: SubmissionStatus) {
  switch (status) {
    case SubmissionStatus.PENDING:
      return "Pending review";
    case SubmissionStatus.APPROVED:
      return "Live on site";
    case SubmissionStatus.REJECTED:
      return "Not approved";
    default:
      return String(status);
  }
}

function submissionStatusTone(status: SubmissionStatus): "pending" | "ok" | "err" {
  switch (status) {
    case SubmissionStatus.APPROVED:
      return "ok";
    case SubmissionStatus.REJECTED:
      return "err";
    default:
      return "pending";
  }
}

export default async function MyPropertiesPage() {
  const session = await requireUser();
  const user = await prisma.appUser.findUnique({
    where: { id: session.sub },
    select: { email: true },
  });
  if (!user) {
    redirect("/login");
  }

  const submissions = await prisma.propertySubmission.findMany({
    where: {
      deletedAt: null,
      OR: [
        { appUserId: session.sub },
        { ownerEmail: { equals: user.email, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const submissionIds = submissions.map((s) => s.id);
  const publishedForSubmission =
    submissionIds.length === 0
      ? []
      : await prisma.listing.findMany({
          where: {
            sourceSubmissionId: { in: submissionIds },
            status: ListingStatus.PUBLISHED,
          },
          select: { id: true, sourceSubmissionId: true },
        });

  const listingIdBySubmission = new Map<string, string>();
  for (const row of publishedForSubmission) {
    if (row.sourceSubmissionId) {
      listingIdBySubmission.set(row.sourceSubmissionId, row.id);
    }
  }

  const ownerEmailAlerts = isSubmissionEmailConfigured();

  const legacyLiveListings = await prisma.listing.findMany({
    where: {
      ownerEmail: { equals: user.email, mode: "insensitive" },
      status: ListingStatus.PUBLISHED,
      sourceSubmissionId: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      image: true,
      city: true,
      type: true,
      price: true,
      purpose: true,
      createdAt: true,
    },
  });

  return (
    <div className="owner-portal">
      <header className="owner-portal-hero">
        <div className="container owner-portal-hero-inner">
          <div>
            <span className="owner-portal-badge">Owner</span>
            <h1>My properties</h1>
            <p>
              Submissions you have sent from this account and anything already
              published under your contact email.
            </p>
            <p className="owner-portal-hero-note">
              {ownerEmailAlerts ? (
                <>
                  When a submission is approved or rejected, we email the
                  contact details on that submission. This page always shows the
                  latest status.
                </>
              ) : (
                <>
                  Automatic email for review decisions is not enabled on this
                  deployment. Check this page for updates.
                </>
              )}
            </p>
          </div>
          <UserLogoutButton className="secondary-btn portal-btn-ghost" />
        </div>
      </header>

      <main className="container owner-portal-layout section">
        <OwnerPortalNav active="mine" />
        <div className="owner-portal-main">
          <section className="owner-my-section" aria-labelledby="my-submissions-heading">
            <h2 id="my-submissions-heading" className="owner-my-section-title">
              Your submissions
            </h2>
            {submissions.length === 0 ? (
              <div className="owner-info-card owner-my-empty">
                <strong>Nothing here yet</strong>
                When you post a property while signed in, it will show up here
                with review status.
                <p className="owner-my-empty-cta">
                  <Link href="/post-property" className="card-link">
                    Post a property →
                  </Link>
                </p>
              </div>
            ) : (
              <ul className="owner-my-list">
                {submissions.map((sub) => {
                  const liveId = listingIdBySubmission.get(sub.id);
                  const summary = `${sub.type} in ${sub.city}`;
                  return (
                    <li key={sub.id} className="owner-my-card">
                      <div className="owner-my-card-image">
                        <Image
                          src={sub.imageUrl}
                          alt={summary}
                          width={120}
                          height={90}
                          className="owner-my-thumb"
                        />
                      </div>
                      <div className="owner-my-card-body">
                        <div className="owner-my-card-header">
                          <h3>{summary}</h3>
                          <span
                            className="owner-my-status"
                            data-tone={submissionStatusTone(sub.status)}
                          >
                            {submissionStatusLabel(sub.status)}
                          </span>
                        </div>
                        <p className="owner-my-meta">
                          {sub.purpose === "Rent" ? "Rent" : "Sale"} ·{" "}
                          {formatPrice(sub.price)} · Submitted{" "}
                          {sub.createdAt.toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <div className="owner-my-card-actions">
                          {liveId ? (
                            <Link href={`/property/${liveId}`} className="card-link">
                              View live listing →
                            </Link>
                          ) : sub.status === SubmissionStatus.PENDING ? (
                            <span className="owner-my-hint">
                              {ownerEmailAlerts
                                ? "We email the contact on the submission when a decision is made."
                                : "No automatic email on this site — check here for updates."}
                            </span>
                          ) : sub.status === SubmissionStatus.REJECTED ? (
                            <span className="owner-my-hint">
                              Contact support if you need more detail on this
                              decision.
                            </span>
                          ) : (
                            <span className="owner-my-hint">
                              Your listing should appear on the site shortly.
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {legacyLiveListings.length > 0 ? (
            <section
              className="owner-my-section"
              aria-labelledby="legacy-live-heading"
            >
              <h2 id="legacy-live-heading" className="owner-my-section-title">
                Live listings on your email
              </h2>
              <p className="owner-my-section-intro">
                These published properties use your account email but are not
                linked to a tracked submission (for example, older data).
              </p>
              <ul className="owner-my-list">
                {legacyLiveListings.map((listing) => (
                  <li key={listing.id} className="owner-my-card">
                    <div className="owner-my-card-image">
                      <Image
                        src={listing.image}
                        alt={listing.title}
                        width={120}
                        height={90}
                        className="owner-my-thumb"
                      />
                    </div>
                    <div className="owner-my-card-body">
                      <div className="owner-my-card-header">
                        <h3>{listing.title}</h3>
                        <span className="owner-my-status" data-tone="ok">
                          Live on site
                        </span>
                      </div>
                      <p className="owner-my-meta">
                        {listing.type} · {listing.city} ·{" "}
                        {listing.purpose === "Rent" ? "Rent" : "Sale"} ·{" "}
                        {formatPrice(listing.price)}
                      </p>
                      <div className="owner-my-card-actions">
                        <Link href={`/property/${listing.id}`} className="card-link">
                          View listing →
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}

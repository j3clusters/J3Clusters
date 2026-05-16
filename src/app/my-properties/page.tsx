import Link from "next/link";
import { ListingStatus, SubmissionStatus } from "@prisma/client";

import { ConsultantPortfolioHeroPanel } from "@/components/ConsultantPortfolioHeroPanel";
import { MyPropertiesHeroActions } from "@/components/MyPropertiesHeroActions";
import { MyPropertiesHeroMarquee } from "@/components/MyPropertiesHeroMarquee";
import { MyPropertyCard, type MyPropertyStatusTone } from "@/components/MyPropertyCard";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { CONSULTANT } from "@/lib/consultant-labels";
import { requireConsultant } from "@/lib/require-user";
import { isSubmissionEmailConfigured } from "@/lib/email/submission-status-email";

function submissionStatusLabel(
  status: SubmissionStatus,
  hadLiveListing: boolean,
) {
  switch (status) {
    case SubmissionStatus.PENDING:
      return hadLiveListing ? "Changes pending review" : "Pending review";
    case SubmissionStatus.APPROVED:
      return "Live on site";
    case SubmissionStatus.REJECTED:
      return "Not approved";
    default:
      return String(status);
  }
}

function submissionStatusTone(status: SubmissionStatus): MyPropertyStatusTone {
  switch (status) {
    case SubmissionStatus.APPROVED:
      return "ok";
    case SubmissionStatus.REJECTED:
      return "err";
    default:
      return "pending";
  }
}

function formatSubmittedDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type PageProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function MyPropertiesPage({ searchParams }: PageProps) {
  const { view: viewParam } = await searchParams;
  const { session, user } = await requireConsultant();

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
  const linkedListingsForSubmission =
    submissionIds.length === 0
      ? []
      : await prisma.listing.findMany({
          where: { sourceSubmissionId: { in: submissionIds } },
          select: { id: true, sourceSubmissionId: true, status: true },
        });

  const listingIdBySubmission = new Map<string, string>();
  const submissionIdsWithLinkedListing = new Set<string>();
  for (const row of linkedListingsForSubmission) {
    if (!row.sourceSubmissionId) {
      continue;
    }
    submissionIdsWithLinkedListing.add(row.sourceSubmissionId);
    if (row.status === ListingStatus.PUBLISHED) {
      listingIdBySubmission.set(row.sourceSubmissionId, row.id);
    }
  }

  const ownerEmailAlerts = isSubmissionEmailConfigured();

  const submissionsForDisplay = submissions.filter(
    (sub) =>
      sub.status !== SubmissionStatus.APPROVED ||
      !listingIdBySubmission.has(sub.id),
  );

  const liveListings = await prisma.listing.findMany({
    where: {
      status: ListingStatus.PUBLISHED,
      OR: [
        { ownerEmail: { equals: user.email, mode: "insensitive" } },
        ...(submissionIds.length > 0
          ? [{ sourceSubmissionId: { in: submissionIds } }]
          : []),
      ],
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
      sourceSubmissionId: true,
    },
  });

  const pendingSubmissions = submissionsForDisplay.filter(
    (s) => s.status === SubmissionStatus.PENDING,
  );
  const pendingCount = pendingSubmissions.length;
  const liveCount = liveListings.length;
  const totalCount = submissions.length;

  const view: "live" | "pending" =
    viewParam === "pending"
      ? "pending"
      : viewParam === "live"
        ? "live"
        : liveCount > 0
          ? "live"
          : "pending";
  const showLive = view === "live";
  const showPending = view === "pending";

  return (
    <div className="owner-portal my-properties-page">
      <header className="mp-hero consultant-portal-hero">
        <div className="mp-hero-bg" aria-hidden="true">
          <span className="mp-hero-orb mp-hero-orb--a" />
          <span className="mp-hero-orb mp-hero-orb--b" />
        </div>
        <div className="container mp-hero-inner">
          <div className="mp-hero-copy">
            <span className="owner-portal-badge">{CONSULTANT.role}</span>
            <h1>My properties</h1>
            <div
              className="mp-hero-marquee"
              aria-label="My properties summary"
            >
              <div className="post-property-hero-steps-track">
                <MyPropertiesHeroMarquee />
                <MyPropertiesHeroMarquee hidden />
              </div>
            </div>
            <MyPropertiesHeroActions
              page="mine"
              view={view}
              liveCount={liveCount}
              pendingCount={pendingCount}
            />
          </div>
          <ConsultantPortfolioHeroPanel
            liveCount={liveCount}
            pendingCount={pendingCount}
            totalCount={totalCount}
            ownerEmailAlerts={ownerEmailAlerts}
          />
        </div>
      </header>

      <main className="container mp-layout section">
        <div className="mp-main">
          {showLive ? (
            <section className="mp-section" aria-labelledby="live-listings-heading">
              <header className="mp-section-head">
                <div>
                  <h2 id="live-listings-heading">Live on site</h2>
                  <p>Published properties buyers can view right now.</p>
                </div>
                <span className="mp-section-count">{liveCount}</span>
              </header>
              {liveListings.length > 0 ? (
                <ul className="mp-grid mp-grid--horizontal">
                  {liveListings.map((listing) => (
                  <MyPropertyCard
                    key={listing.id}
                    variant="live"
                    image={listing.image}
                    imageAlt={listing.title}
                    title={listing.title}
                    priceLabel={formatPrice(listing.price)}
                    metaLine={`${listing.type} | ${listing.city} | Published ${formatSubmittedDate(listing.createdAt)}`}
                    purpose={listing.purpose === "Rent" ? "Rent" : "Sale"}
                    statusLabel="Live on site"
                    statusTone="ok"
                    editHref={
                      listing.sourceSubmissionId
                        ? `/my-properties/edit/${listing.sourceSubmissionId}`
                        : `/my-properties/edit/listing/${listing.id}`
                    }
                    viewHref={`/property/${listing.id}`}
                  />
                  ))}
                </ul>
              ) : (
                <div className="mp-empty">
                  <h3>No live listings yet</h3>
                  <p>
                    Published properties linked to your account will appear here.
                  </p>
                  <Link href="/post-property" className="mp-cta-primary">
                    Post a property
                  </Link>
                </div>
              )}
            </section>
          ) : null}

          {showPending ? (
            <section className="mp-section" aria-labelledby="my-submissions-heading">
            <header className="mp-section-head">
              <div>
                <h2 id="my-submissions-heading">Pending review</h2>
                <p>Submissions waiting for team approval.</p>
              </div>
              {pendingCount > 0 ? (
                <span className="mp-section-count">{pendingCount}</span>
              ) : null}
            </header>

            {pendingCount === 0 ? (
              <div className="mp-empty">
                <h3>Nothing awaiting review</h3>
                <p>
                  When you post a property, it will show here until it is approved.
                </p>
                <Link href="/post-property" className="mp-cta-primary">
                  Post a property
                </Link>
              </div>
            ) : (
              <ul className="mp-grid mp-grid--horizontal">
                {pendingSubmissions.map((sub) => {
                  const summary = `${sub.type} in ${sub.city}`;
                  const purpose = sub.purpose === "Rent" ? "Rent" : "Sale";
                  const hint = ownerEmailAlerts
                    ? "We will email the contact on this submission when a decision is made."
                    : "No automatic email on this site - check back here for updates.";

                  return (
                    <MyPropertyCard
                      key={sub.id}
                      variant="submission"
                      image={sub.imageUrl}
                      imageAlt={summary}
                      title={summary}
                      priceLabel={formatPrice(sub.price)}
                      metaLine={`Submitted ${formatSubmittedDate(sub.createdAt)}`}
                      purpose={purpose}
                      statusLabel={submissionStatusLabel(
                        sub.status,
                        submissionIdsWithLinkedListing.has(sub.id),
                      )}
                      statusTone={submissionStatusTone(sub.status)}
                      editHref={`/my-properties/edit/${sub.id}`}
                      hint={hint}
                    />
                  );
                })}
              </ul>
            )}
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}


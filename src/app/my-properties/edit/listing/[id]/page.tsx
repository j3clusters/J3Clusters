import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ListingStatus } from "@prisma/client";

import { PostPropertyForm } from "@/components/PostPropertyForm";
import { propertyFormInitialFromListing } from "@/lib/property-form-initial";
import { prisma } from "@/lib/prisma";
import { requireConsultant } from "@/lib/require-user";
import { listingOwnerWhere } from "@/lib/submission-access";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await requireConsultant();

  const listing = await prisma.listing.findFirst({
    where: {
      id,
      status: ListingStatus.PUBLISHED,
      ...listingOwnerWhere(user.email),
    },
  });

  if (!listing) {
    notFound();
  }

  if (listing.sourceSubmissionId) {
    redirect(`/my-properties/edit/${listing.sourceSubmissionId}`);
  }

  const initial = propertyFormInitialFromListing(listing);

  return (
    <div className="owner-portal post-property-page">
      <header className="owner-portal-hero post-property-hero">
        <div className="container owner-portal-hero-inner">
          <div className="post-property-hero-copy">
            <span className="owner-portal-badge">Property agent</span>
            <h1>Edit property</h1>
            <p>
              Changes need team approval before they appear on the public site
              again.
            </p>
          </div>
        </div>
      </header>

      <main className="container owner-portal-layout section">
        <div className="owner-portal-main">
          <p className="owner-my-edit-back">
            <Link href="/my-properties">← Back to My properties</Link>
          </p>
          <PostPropertyForm initial={initial} />
        </div>
      </main>
    </div>
  );
}

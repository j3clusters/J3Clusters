import Link from "next/link";

import { CONSULTANT } from "@/lib/consultant-labels";
import { formatListingDate } from "@/lib/format";
import { stripListingPurpose } from "@/lib/listing-purpose";
import type { Listing } from "@/types/listing";

function showLastUpdated(postedAt: string, updatedAt: string) {
  if (!postedAt.trim() || !updatedAt.trim()) return false;
  const posted = new Date(postedAt).getTime();
  const updated = new Date(updatedAt).getTime();
  if (Number.isNaN(posted) || Number.isNaN(updated)) return false;
  return updated - posted > 60_000;
}

export function PropertyDetailDescription({ item }: { item: Listing }) {
  const description = stripListingPurpose(item.description);

  return (
    <section
      className="property-detail-media-card property-detail-media-description"
      aria-labelledby="property-description-left"
    >
      <h3 id="property-description-left">Description</h3>
      <p className="property-detail-desc">
        {description.trim() || "No description provided."}
      </p>
    </section>
  );
}

type PropertyDetailListedByProps = {
  item: Listing;
  consultantPhone: string;
  consultantEmail: string;
  canViewContact: boolean;
};

export function PropertyDetailListedBy({
  item,
  consultantPhone,
  consultantEmail,
  canViewContact,
}: PropertyDetailListedByProps) {
  const phone = consultantPhone.trim();
  const email = consultantEmail.trim();
  const hasContactOnFile = Boolean(phone || email);
  const hasOwnerContact =
    item.ownerName.trim() || hasContactOnFile || Boolean(item.postedAt.trim());
  const hasPostedMeta = Boolean(item.postedAt.trim());
  const postedLabel = formatListingDate(item.postedAt);
  const updatedLabel = formatListingDate(item.updatedAt);

  if (!hasOwnerContact && !hasPostedMeta) {
    return null;
  }

  return (
    <section
      className="property-detail-media-card property-detail-media-agent property-detail-listed-by-bottom"
      aria-labelledby="property-agent-left"
    >
      <h3 id="property-agent-left">{CONSULTANT.listedBy}</h3>
      <dl className="property-detail-agent-facts">
        {item.ownerName.trim() ? (
          <div>
            <dt>{CONSULTANT.name}</dt>
            <dd>{item.ownerName.trim()}</dd>
          </div>
        ) : null}

        {canViewContact && phone ? (
          <div>
            <dt>Mobile number</dt>
            <dd>
              <a href={`tel:${phone}`}>{phone}</a>
            </dd>
          </div>
        ) : null}

        {canViewContact && email ? (
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${email}`}>{email}</a>
            </dd>
          </div>
        ) : null}

        {!canViewContact && hasContactOnFile ? (
          <div>
            <dt>Contact details</dt>
            <dd className="consultant-contact-gated">
              <p className="meta">{CONSULTANT.contactHiddenHint}</p>
              <p className="consultant-contact-gated-actions">
                <Link href="/register">{CONSULTANT.contactHiddenCta}</Link>
                <span aria-hidden="true"> · </span>
                <Link href="/login">Log in</Link>
              </p>
            </dd>
          </div>
        ) : null}

        {hasPostedMeta ? (
          <div>
            <dt>Posted on</dt>
            <dd>{postedLabel}</dd>
          </div>
        ) : null}
        {hasPostedMeta && showLastUpdated(item.postedAt, item.updatedAt) ? (
          <div>
            <dt>Last updated</dt>
            <dd>{updatedLabel}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}

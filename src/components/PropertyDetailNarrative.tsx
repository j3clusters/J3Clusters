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

export function PropertyDetailListedBy({ item }: { item: Listing }) {
  const hasOwnerContact =
    item.ownerName.trim() ||
    item.ownerEmail.trim() ||
    item.ownerPhone.trim();
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
        {item.ownerPhone.trim() ? (
          <div>
            <dt>Mobile number</dt>
            <dd>
              <a href={`tel:${item.ownerPhone.trim()}`}>
                {item.ownerPhone.trim()}
              </a>
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
        {item.ownerEmail.trim() ? (
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${item.ownerEmail.trim()}`}>
                {item.ownerEmail.trim()}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}

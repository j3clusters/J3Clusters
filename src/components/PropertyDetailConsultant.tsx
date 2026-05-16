import Image from "next/image";
import Link from "next/link";

import { CONSULTANT } from "@/lib/consultant-labels";
import type { Listing } from "@/types/listing";

function consultantInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function PropertyDetailConsultant({
  item,
  listingId,
  consultantPhoneOnFile,
  canViewContact,
}: {
  item: Listing;
  listingId: string;
  consultantPhoneOnFile: string;
  canViewContact: boolean;
}) {
  const consultantPhone = consultantPhoneOnFile.trim();
  const hasConsultantPhone = Boolean(consultantPhone);
  const consultantName = item.ownerName.trim();
  const consultantPhoto = item.ownerPhotoUrl.trim();
  const returnToListingPath = `/property/${listingId}`;
  const registerHref = `/register/member?next=${encodeURIComponent(returnToListingPath)}`;
  const loginHref = `/login?next=${encodeURIComponent(returnToListingPath)}`;

  return (
    <section
      className="property-detail-media-card property-detail-consultant-card"
      aria-labelledby="property-consultant-details"
    >
      <h3 id="property-consultant-details" className="property-detail-consultant-card-title">
        {CONSULTANT.detailsTitle}
      </h3>
      <div className="property-detail-consultant-layout">
        <div className="property-detail-consultant-photo-wrap">
          {consultantPhoto ? (
            <Image
              src={consultantPhoto}
              alt={`${consultantName || CONSULTANT.role}`}
              width={72}
              height={72}
              className="property-detail-consultant-photo"
              sizes="72px"
              unoptimized={consultantPhoto.startsWith("http")}
            />
          ) : (
            <span
              className="property-detail-consultant-photo-fallback"
              aria-hidden="true"
            >
              {consultantInitials(consultantName || CONSULTANT.role)}
            </span>
          )}
        </div>
        <dl className="property-detail-agent-facts property-detail-consultant-facts">
          <div>
            <dt>{CONSULTANT.nameShort}</dt>
            <dd>{consultantName || CONSULTANT.role}</dd>
          </div>
          {hasConsultantPhone ? (
            <div>
              <dt>Mobile</dt>
              <dd>
                {canViewContact ? (
                  <a href={`tel:${consultantPhone.replace(/\s/g, "")}`}>{consultantPhone}</a>
                ) : (
                  <>
                    <p className="property-detail-facts-gated-hint">
                      {CONSULTANT.contactHiddenHint}
                    </p>
                    <div className="property-detail-facts-gated-actions">
                      <Link href={registerHref} className="property-detail-facts-btn-primary">
                        {CONSULTANT.contactHiddenCta}
                      </Link>
                      <Link href={loginHref} className="property-detail-facts-btn-ghost">
                        Log in
                      </Link>
                    </div>
                  </>
                )}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  );
}

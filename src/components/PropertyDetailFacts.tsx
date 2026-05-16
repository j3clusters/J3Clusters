import Image from "next/image";
import Link from "next/link";

import { CONSULTANT } from "@/lib/consultant-labels";
import { furnishingLabel, listingTypeLabel } from "@/lib/listing-labels";
import type { Listing } from "@/types/listing";

type Fact = {
  label: string;
  value: string;
  fullWidth?: boolean;
};

function formatAvailableFrom(value: string) {
  if (!value?.trim()) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  }
  return value;
}

function displayCount(value: number) {
  return value > 0 ? String(value) : "—";
}

function consultantInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function PropertyDetailFacts({
  item,
  listingId,
  consultantPhoneOnFile,
  canViewContact,
}: {
  item: Listing;
  listingId: string;
  /** Raw listing phone from the database; only shown when `canViewContact` is true. */
  consultantPhoneOnFile: string;
  canViewContact: boolean;
}) {
  const isPlot = item.type === "Plot";
  const isPG = item.type === "PG";
  const showRoomDetails = !isPlot;
  const purposeLabel = item.purpose === "Rent" ? "For rent" : "For sale";
  const consultantPhone = consultantPhoneOnFile.trim();
  const hasConsultantPhone = Boolean(consultantPhone);
  const consultantName = item.ownerName.trim();
  const consultantPhoto = item.ownerPhotoUrl.trim();
  const returnToListingPath = `/property/${listingId}`;
  const registerHref = `/register/member?next=${encodeURIComponent(returnToListingPath)}`;
  const loginHref = `/login?next=${encodeURIComponent(returnToListingPath)}`;

  const overviewFacts: Fact[] = [
    { label: "Listing for", value: purposeLabel },
    { label: "Property type", value: listingTypeLabel(item.type) },
    { label: "City", value: item.city },
    {
      label: isPlot ? "Plot area" : "Built-up area",
      value: `${item.areaSqft.toLocaleString("en-IN")} sqft`,
    },
    {
      label: "Available from",
      value: formatAvailableFrom(item.availableFrom),
    },
  ];

  if (item.address.trim()) {
    overviewFacts.splice(3, 0, {
      label: "Address",
      value: item.address.trim(),
      fullWidth: true,
    });
  }

  const featureFacts: Fact[] = [];

  if (showRoomDetails) {
    featureFacts.push(
      {
        label: isPG ? "Rooms" : "Bedrooms",
        value: displayCount(item.beds),
      },
      {
        label: isPG ? "Bathrooms (shared/attached)" : "Bathrooms",
        value: displayCount(item.baths),
      },
      { label: "Balconies", value: displayCount(item.balconies) },
      { label: "Parking spots", value: displayCount(item.parkingSpots) },
      {
        label: "Furnishing",
        value: furnishingLabel(item.furnishing) || "—",
      },
    );
    if (item.propertyAgeYears > 0) {
      featureFacts.push({
        label: "Property age",
        value: `${item.propertyAgeYears} years`,
      });
    }
  }

  return (
    <>
      <section className="property-detail-section" aria-labelledby="property-overview">
        <h2 id="property-overview" className="property-detail-section-title">
          Overview
        </h2>
        <dl className="property-detail-facts">
          {overviewFacts.map((fact) => (
            <div
              key={fact.label}
              className={fact.fullWidth ? "property-detail-fact-full" : undefined}
            >
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div
          className="property-detail-overview-consultant-block"
          aria-labelledby="property-consultant-details"
        >
          <h3 id="property-consultant-details" className="property-detail-subsection-title">
            Property consultant details
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
            <dl className="property-detail-facts property-detail-consultant-facts">
              <div>
                <dt>{CONSULTANT.nameShort}</dt>
                <dd>{consultantName || CONSULTANT.role}</dd>
              </div>
              {hasConsultantPhone ? (
                <div className="property-detail-fact-full">
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
        </div>
      </section>

      {featureFacts.length > 0 ? (
        <section className="property-detail-section" aria-labelledby="property-features">
          <h2 id="property-features" className="property-detail-section-title">
            Property features
          </h2>
          <dl className="property-detail-facts">
            {featureFacts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </>
  );
}

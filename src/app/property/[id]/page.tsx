import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingPurpose } from "@prisma/client";

import { JsonLd } from "@/components/JsonLd";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyDetailFacts } from "@/components/PropertyDetailFacts";
import { MortgageCalculator } from "@/components/MortgageCalculator";
import { PropertyDetailMediaColumn } from "@/components/PropertyDetailMediaColumn";
import { formatPrice } from "@/lib/format";
import { estimateMonthlyEmi } from "@/lib/mortgage";
import {
  canViewListingContactDetails,
  redactListingContact,
} from "@/lib/listing-contact-access";
import { loadPublishedListingById } from "@/lib/listing-catalog";
import { fetchSimilarListings } from "@/lib/similar-listings";
import {
  buildBreadcrumbJsonLd,
  buildListingJsonLd,
  buildPropertyMetadata,
} from "@/lib/seo";

/** Keep in sync with LISTINGS_PAGE_REVALIDATE_SECONDS in @/lib/listing-cache */
export const revalidate = 300;

type PropertyDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PropertyDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await loadPublishedListingById(id);
  if (!listing) {
    return { title: "Property not found" };
  }
  return buildPropertyMetadata(listing);
}

function formatPricePerSqft(price: number, areaSqft: number) {
  if (areaSqft <= 0) return null;
  return formatPrice(Math.round(price / areaSqft));
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { id } = await params;

  const [rawListing, canViewContact] = await Promise.all([
    loadPublishedListingById(id),
    canViewListingContactDetails(),
  ]);

  if (!rawListing) {
    notFound();
  }
  const item = redactListingContact(rawListing, canViewContact);
  const gallery = item.imageUrls.length ? item.imageUrls : [item.image];
  const isRent = item.purpose === "Rent" || item.type === "PG";
  const priceLabel = isRent ? "Monthly rent" : "Price";
  const emi = !isRent ? estimateMonthlyEmi(item.price) : null;
  const pricePerSqft = formatPricePerSqft(item.price, item.areaSqft);
  const similarRaw = await fetchSimilarListings(
    id,
    item.city,
    rawListing.purpose as ListingPurpose,
    item.type,
  );
  const similar = similarRaw.map((listing) =>
    redactListingContact(listing, canViewContact),
  );
  const listingsCityHref = isRent
    ? `/listings/rent?city=${encodeURIComponent(item.city)}`
    : `/listings/buy?city=${encodeURIComponent(item.city)}`;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    {
      name: isRent ? "Rent" : "Buy",
      path: isRent ? "/listings/rent" : "/listings/buy",
    },
    { name: item.city, path: listingsCityHref },
    { name: item.title, path: `/property/${id}` },
  ]);

  return (
    <main className="container section property-detail-page">
      <JsonLd data={[buildListingJsonLd(rawListing), breadcrumbJsonLd]} />
      <article className="property-detail-card">
        <PropertyDetailMediaColumn
          item={item}
          images={gallery}
          listingId={id}
          consultantPhoneOnFile={rawListing.ownerPhone}
          canViewContact={canViewContact}
        />
        <div className="property-detail-body">
          <header className="property-detail-header">
              <h1 className="property-detail-title">
                {item.title}
                {item.isFeatured ? (
                  <span className="property-detail-featured-tag">Featured</span>
                ) : null}
              </h1>
              <div className="property-detail-price-block">
                <span className="property-detail-price-label">{priceLabel}</span>
                <strong className="property-detail-price-value">
                  {formatPrice(item.price)}
                </strong>
                {pricePerSqft ? (
                  <span className="property-detail-price-per-sqft">
                    {pricePerSqft}/sqft
                  </span>
                ) : null}
                {emi ? (
                  <Link
                    href={`/mortgage-calculator?price=${item.price}`}
                    className="property-detail-emi"
                  >
                    EMI ≈ {formatPrice(emi)}/mo · Calculate
                  </Link>
                ) : null}
              </div>
            </header>

          <PropertyDetailFacts item={item} />

          {!isRent ? (
            <MortgageCalculator
              variant="embedded"
              initialPropertyPrice={item.price}
            />
          ) : null}
        </div>
      </article>

      {similar.length > 0 ? (
        <section className="property-detail-similar section">
          <div className="section-head">
            <h2>Suggested properties</h2>
            <Link href={listingsCityHref}>More in {item.city}</Link>
          </div>
          <p className="property-detail-similar-desc">
            Similar {isRent ? "rentals" : "homes"} in {item.city} · {item.type}
          </p>
          <div className="card-grid">
            {similar.map((listing) => (
              <PropertyCard key={listing.id} item={listing} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

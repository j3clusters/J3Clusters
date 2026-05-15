import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingStatus } from "@prisma/client";

import { PropertyCard } from "@/components/PropertyCard";
import { PropertyDetailFacts } from "@/components/PropertyDetailFacts";
import { PropertyDetailMediaColumn } from "@/components/PropertyDetailMediaColumn";
import { CONSULTANT } from "@/lib/consultant-labels";
import { formatPrice } from "@/lib/format";
import { prismaListingToApp } from "@/lib/listing-map";
import { prisma } from "@/lib/prisma";
import { fetchSimilarListings } from "@/lib/similar-listings";

type PropertyDetailPageProps = {
  params: Promise<{ id: string }>;
};

function estimateEmi(price: number) {
  return Math.round((price * 0.0085) / 1000) * 1000;
}

function formatPricePerSqft(price: number, areaSqft: number) {
  if (areaSqft <= 0) return null;
  return formatPrice(Math.round(price / areaSqft));
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { id } = await params;

  const row = await prisma.listing.findFirst({
    where: { id, status: ListingStatus.PUBLISHED },
  });

  if (!row) {
    notFound();
  }

  const item = prismaListingToApp(row);
  const gallery = item.imageUrls.length ? item.imageUrls : [item.image];
  const isRent = item.purpose === "Rent" || item.type === "PG";
  const priceLabel = isRent ? "Monthly rent" : "Price";
  const emi = !isRent ? estimateEmi(item.price) : null;
  const pricePerSqft = formatPricePerSqft(item.price, item.areaSqft);
  const similar = await fetchSimilarListings(
    id,
    item.city,
    row.purpose,
    item.type,
  );
  const listingsCityHref = `/listings?city=${encodeURIComponent(item.city)}&mode=${isRent ? "rent" : "buy"}`;

  return (
    <main className="container section property-detail-page">
      <article className="property-detail-card">
        <PropertyDetailMediaColumn item={item} images={gallery} />
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
                <span className="property-detail-emi">
                  EMI ≈ {formatPrice(emi)}/mo
                </span>
              ) : null}
            </div>
          </header>

          <PropertyDetailFacts item={item} />

          <aside className="property-detail-cta-panel">
            <p>Interested? {CONSULTANT.connectMessage}</p>
            <Link href="/contact" className="property-detail-cta-btn">
              Request callback
            </Link>
          </aside>
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

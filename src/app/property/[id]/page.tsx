import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingStatus } from "@prisma/client";

import { PropertyDetailGallery } from "@/components/PropertyDetailGallery";
import { prismaListingToApp } from "@/lib/listing-map";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

type PropertyDetailPageProps = {
  params: Promise<{ id: string }>;
};

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

  return (
    <main className="container section property-detail-page">
      <article className="property-detail-card">
        <PropertyDetailGallery title={item.title} images={gallery} />
        <div className="property-detail-body">
          <h1>{item.title}</h1>
          <p className="price">{formatPrice(item.price)}</p>
          <p className="meta">
            {item.city} • {item.type}
          </p>
          <div className="property-detail-specs">
            <div className="property-detail-spec">
              <strong>Area</strong>
              <span>{item.areaSqft.toLocaleString("en-IN")} sqft</span>
            </div>
            <div className="property-detail-spec">
              <strong>Bedrooms</strong>
              <span>{item.beds || "—"}</span>
            </div>
            <div className="property-detail-spec">
              <strong>Bathrooms</strong>
              <span>{item.baths || "—"}</span>
            </div>
          </div>
          <p className="property-detail-desc">{item.description}</p>
          <p className="property-detail-cta">
            <Link href="/contact">Request callback</Link>
          </p>
        </div>
      </article>
    </main>
  );
}

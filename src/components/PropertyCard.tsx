import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/format";
import type { Listing } from "@/types/listing";

type PropertyCardProps = {
  item: Listing;
  variant?: "grid" | "list";
  compareSlot?: React.ReactNode;
  openImageInNewTab?: boolean;
};

function estimateEmi(price: number) {
  return Math.round((price * 0.0085) / 1000) * 1000;
}

export function PropertyCard({
  item,
  variant = "grid",
  compareSlot,
  openImageInNewTab = false,
}: PropertyCardProps) {
  const listMode = variant === "list";
  const emi = estimateEmi(item.price);
  const summaryLine =
    item.type === "Plot"
      ? `${item.areaSqft} sqft plot area`
      : item.type === "PG"
        ? `${item.areaSqft} sqft room area • Managed PG stay`
      : `${item.beds} bed • ${item.baths} bath • ${item.areaSqft} sqft`;

  return (
    <article className={`card ${listMode ? "card-list" : ""}`}>
      <Link
        href={`/property/${item.id}`}
        target={openImageInNewTab ? "_blank" : undefined}
        rel={openImageInNewTab ? "noopener noreferrer" : undefined}
        aria-label={`Open ${item.title} details`}
      >
        <div className="card-image-wrap">
          <Image src={item.image} alt={item.title} width={600} height={340} />
          <div className="card-image-overlay">
            <span className="card-chip">{item.city}</span>
            <span className="card-chip">Ready to move</span>
          </div>
        </div>
      </Link>
      <div className="card-body">
        <div className="card-header-row">
          <span className="card-badge">{item.type}</span>
          <span className="verified-badge">Verified</span>
        </div>
        <h3>{item.title}</h3>
        <p className="price">{formatPrice(item.price)}</p>
        <p className="emi-text">EMI from approx. {formatPrice(emi)}/month</p>
        <p className="meta card-location">{item.city}</p>
        <p className="meta">{summaryLine}</p>
        {compareSlot ? <div className="compare-slot">{compareSlot}</div> : null}
        <div className="card-footer-row">
          <span className="meta card-partner">By J3 Partner</span>
          <Link href={`/property/${item.id}`} className="card-link">
            View details →
          </Link>
        </div>
      </div>
    </article>
  );
}

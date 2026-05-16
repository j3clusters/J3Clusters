import Image from "next/image";
import Link from "next/link";

export type MyPropertyStatusTone = "pending" | "ok" | "err";

type MyPropertyCardProps = {
  image: string;
  imageAlt: string;
  title: string;
  priceLabel: string;
  metaLine: string;
  purpose: "Rent" | "Sale";
  statusLabel: string;
  statusTone: MyPropertyStatusTone;
  editHref: string;
  viewHref?: string;
  hint?: string;
  variant?: "submission" | "live";
};

export function MyPropertyCard({
  image,
  imageAlt,
  title,
  priceLabel,
  metaLine,
  purpose,
  statusLabel,
  statusTone,
  editHref,
  viewHref,
  hint,
  variant = "submission",
}: MyPropertyCardProps) {
  return (
    <li className="mp-card">
      <div className="mp-card-media">
        <Image
          src={image}
          alt={imageAlt}
          width={640}
          height={400}
          className="mp-card-img"
          sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 320px"
        />
        <div className="mp-card-media-overlay" aria-hidden="true" />
        <div className="mp-card-media-top">
          <span className="mp-chip mp-chip-purpose">
            {purpose === "Rent" ? "For rent" : "For sale"}
          </span>
          <span className="mp-status" data-tone={statusTone}>
            {statusLabel}
          </span>
        </div>
        {variant === "live" ? (
          <span className="mp-live-glow" aria-hidden="true" />
        ) : null}
      </div>
      <div className="mp-card-body">
        <p className="mp-card-price">{priceLabel}</p>
        <h3 className="mp-card-title">{title}</h3>
        <p className="mp-card-meta">{metaLine}</p>
        {hint ? <p className="mp-card-hint">{hint}</p> : null}
        <div className="mp-card-actions">
          <Link href={editHref} className="mp-btn mp-btn-primary">
            Edit listing
          </Link>
          {viewHref ? (
            <Link href={viewHref} className="mp-btn mp-btn-ghost">
              View on site
            </Link>
          ) : null}
        </div>
      </div>
    </li>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { formatPrice } from "@/lib/format";
import type { Listing } from "@/types/listing";

type HeroFeaturedPropertiesProps = {
  items: Listing[];
};

function FeaturedPropertyRow({ item }: { item: Listing }) {
  return (
    <Link
      href={`/property/${item.id}`}
      className="hero-featured-item"
      aria-label={`View ${item.title}`}
    >
      <span className="hero-featured-thumb-wrap">
        <Image
          src={item.image}
          alt=""
          width={88}
          height={66}
          className="hero-featured-thumb"
          loading="lazy"
        />
      </span>
      <span className="hero-featured-body">
        <span className="hero-featured-meta">
          <span className="hero-featured-type">{item.type}</span>
          <span className="hero-featured-city">{item.city}</span>
        </span>
        <span className="hero-featured-name">{item.title}</span>
        <span className="hero-featured-price">{formatPrice(item.price)}</span>
      </span>
    </Link>
  );
}

export function HeroFeaturedProperties({ items }: HeroFeaturedPropertiesProps) {
  if (items.length === 0) {
    return (
      <div className="hero-highlight-card hero-featured-card">
        <h3 className="hero-featured-title">Featured properties</h3>
        <p className="hero-featured-empty">
          New listings are added regularly.{" "}
          <Link href="/listings">Browse all properties</Link>.
        </p>
      </div>
    );
  }

  const shouldAnimate = items.length > 1;
  const loopItems = shouldAnimate ? [...items, ...items] : items;
  const scrollDurationSec = Math.max(items.length * 4, 12);
  const listStyle: CSSProperties | undefined = shouldAnimate
    ? { "--featured-scroll-duration": `${scrollDurationSec}s` } as CSSProperties
    : undefined;

  return (
    <div className="hero-highlight-card hero-featured-card">
      <div className="hero-featured-head">
        <h3 className="hero-featured-title">Featured properties</h3>
        <Link href="/listings" className="hero-featured-all">
          View all
        </Link>
      </div>
      <div
        className="hero-featured-viewport"
        aria-live="off"
        aria-label="Featured properties carousel"
      >
        <ul
          className={
            shouldAnimate
              ? "hero-featured-list hero-featured-list--animate"
              : "hero-featured-list"
          }
          style={listStyle}
        >
          {loopItems.map((item, index) => (
            <li key={`${item.id}-${index}`}>
              <FeaturedPropertyRow item={item} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { HeroFeaturedProperties } from "@/components/HeroFeaturedProperties";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Buy & rent verified properties in India",
  description:
    "Search apartments, villas, plots, and PG stays for sale and rent. Verified agent listings, transparent pricing, and direct support on J3 Clusters.",
  path: "/",
  keywords: [
    "property marketplace India",
    "buy property online",
    "rent property India",
    "verified real estate listings",
  ],
});
import {
  buildWhatsAppUrl,
  SITE_GENERAL_WHATSAPP_MESSAGE,
} from "@/lib/site-contact";
import { PropertyCard } from "@/components/PropertyCard";
import {
  loadPublishedAppListingsOrdered,
  pickHomeFeaturedListings,
} from "@/lib/listing-catalog";
/** Keep in sync with LISTINGS_PAGE_REVALIDATE_SECONDS in @/lib/listing-cache */
export const revalidate = 300;

export default async function HomePage() {
  const ordered = await loadPublishedAppListingsOrdered();
  const featured = pickHomeFeaturedListings(ordered, 6);
  const heroFeatured = featured;
  const listingCount = ordered.length;
  const citiesCount = new Set(ordered.map((item) => item.city)).size;
  const popularCities = Array.from(new Set(ordered.map((item) => item.city))).slice(
    0,
    6,
  );

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="hero-layout">
            <div className="hero-intro">
              <p className="pill">Trusted local property platform</p>
              <h1>Find a home that fits your life</h1>
              <p className="hero-copy">
                Search verified apartments, villas, plots, and PG options in your
                preferred neighborhood with transparent pricing.
              </p>
              <div className="hero-metrics">
                <div>
                  <strong>{listingCount > 0 ? `${listingCount}+` : "—"}</strong>
                  <span>verified listings</span>
                </div>
                <div>
                  <strong>{citiesCount > 0 ? `${citiesCount}+` : "—"}</strong>
                  <span>active cities</span>
                </div>
                <div>
                  <strong>24h</strong>
                  <span>agent response target</span>
                </div>
              </div>
            </div>
            <HeroFeaturedProperties items={heroFeatured} />
          </div>

          <div className="hero-search-block">
          <form className="search-card portal-search" action="/listings">
            <div className="field-grid">
              <label>
                City
                <input type="text" name="city" placeholder="Ex: Chennai" />
              </label>
              <label>
                Property Type
                <select name="type" defaultValue="">
                  <option value="">Any</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Plot">Plot</option>
                  <option value="PG">PG</option>
                </select>
              </label>
              <label>
                Budget
                <select name="budget" defaultValue="">
                  <option value="">Any</option>
                  <option value="0-5000000">Up to 50L</option>
                  <option value="5000000-10000000">50L - 1Cr</option>
                  <option value="10000000-30000000">1Cr - 3Cr</option>
                </select>
              </label>
              <button type="submit">Search</button>
            </div>
          </form>
          <div className="hero-quick-links">
            <Link
              href="/listings?type=Apartment"
              className="hero-quick-link hero-quick-link-apartment"
            >
              <span className="hero-quick-link-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21V7l9-4 9 4v14" />
                  <path d="M9 21v-6h6v6" />
                  <path d="M9 11h.01M15 11h.01M9 7h.01M15 7h.01" />
                </svg>
              </span>
              <span className="hero-quick-link-label">
                <strong>Explore Apartments</strong>
                <small>Ready-to-move flats</small>
              </span>
              <span className="hero-quick-link-arrow" aria-hidden="true">
                →
              </span>
            </Link>

            <Link
              href="/listings?type=Plot"
              className="hero-quick-link hero-quick-link-villa"
            >
              <span className="hero-quick-link-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12 12 3l10 9" />
                  <path d="M5 10v11h14V10" />
                  <path d="M10 21v-6h4v6" />
                </svg>
              </span>
              <span className="hero-quick-link-label">
                <strong>Browse Plots</strong>
                <small>Residential land &amp; layouts</small>
              </span>
              <span className="hero-quick-link-arrow" aria-hidden="true">
                →
              </span>
            </Link>

            <Link
              href="/listings/rent"
              className="hero-quick-link hero-quick-link-pg"
            >
              <span className="hero-quick-link-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7h18v12H3z" />
                  <path d="M3 11h18" />
                  <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
                </svg>
              </span>
              <span className="hero-quick-link-label">
                <strong>Rentals &amp; PG</strong>
                <small>Rent homes and shared stays</small>
              </span>
              <span className="hero-quick-link-arrow" aria-hidden="true">
                →
              </span>
            </Link>

            <Link
              href="/register/consultant"
              className="hero-quick-link hero-quick-link-post"
            >
              <span className="hero-quick-link-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </span>
              <span className="hero-quick-link-label">
                <strong>Post Property Free</strong>
                <small>List in 2 minutes</small>
              </span>
              <span className="hero-quick-link-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
          <div className="trust-strip">
            <span>100% digital inquiry workflow</span>
            <span>Verified agent listings</span>
            <span>Dedicated support team</span>
          </div>
          </div>
        </div>
      </section>

      <section className="section home-type-section" aria-labelledby="home-type-heading">
        <div className="container home-type-panel">
          <div className="section-head">
            <h2 id="home-type-heading">Browse by property type</h2>
            <Link href="/listings">See all categories</Link>
          </div>
          <div className="type-grid">
            <Link
              href="/listings?type=Apartment"
              className="type-tile type-tile-apartment"
            >
              <span className="type-tile-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21V7l9-4 9 4v14" />
                  <path d="M9 21v-6h6v6" />
                  <path d="M9 11h.01M15 11h.01M9 7h.01M15 7h.01" />
                </svg>
              </span>
              <span className="type-tile-body">
                <strong>Apartments</strong>
                <span>Ready-to-move and under-construction homes</span>
              </span>
              <span className="type-tile-arrow" aria-hidden="true">→</span>
            </Link>
            <Link href="/listings?type=Plot" className="type-tile type-tile-villa">
              <span className="type-tile-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12 12 3l10 9" />
                  <path d="M5 10v11h14V10" />
                  <path d="M10 21v-6h4v6" />
                </svg>
              </span>
              <span className="type-tile-body">
                <strong>Plots</strong>
                <span>Residential plots and approved layouts</span>
              </span>
              <span className="type-tile-arrow" aria-hidden="true">→</span>
            </Link>
            <Link href="/listings/rent" className="type-tile type-tile-pg">
              <span className="type-tile-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7h18v12H3z" />
                  <path d="M3 11h18" />
                  <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
                </svg>
              </span>
              <span className="type-tile-body">
                <strong>Rentals</strong>
                <span>Rental homes, flats, and PG options</span>
              </span>
              <span className="type-tile-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section
        className="section home-featured-section"
        aria-labelledby="home-featured-heading"
      >
        <div className="container">
          <div className="section-head section-head-stacked">
            <div>
              <h2 id="home-featured-heading">Featured listings</h2>
              <p className="section-lead">
                Hand-picked homes from verified agents — updated live from
                our catalog.
              </p>
            </div>
            <Link href="/listings">View all</Link>
          </div>
          {featured.length > 0 ? (
            <div className="card-grid home-featured-grid">
              {featured.map((item) => (
                <PropertyCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="home-empty-note">
              No published listings yet.{" "}
              <Link href="/register/consultant">List a property</Link> or{" "}
              <Link href="/listings">check back soon</Link>.
            </p>
          )}
        </div>
      </section>

      <section className="section home-steps-section" aria-labelledby="home-steps-heading">
        <div className="container home-steps-panel">
          <div className="section-head">
            <h2 id="home-steps-heading">How J3 Clusters works</h2>
            <Link href="/contact">Talk to an advisor</Link>
          </div>
          <div className="steps-grid">
            <article className="step-card step-card-search">
              <span className="step-card-num" aria-hidden="true">
                1
              </span>
              <span className="step-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <div className="step-card-body">
                <strong>Search smarter</strong>
                <p>Filter by city, type, and budget to shortlist relevant homes fast.</p>
              </div>
            </article>
            <article className="step-card step-card-compare">
              <span className="step-card-num" aria-hidden="true">
                2
              </span>
              <span className="step-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
                </svg>
              </span>
              <div className="step-card-body">
                <strong>Compare options</strong>
                <p>Use side-by-side comparison to evaluate price, space, and amenities.</p>
              </div>
            </article>
            <article className="step-card step-card-close">
              <span className="step-card-num" aria-hidden="true">
                3
              </span>
              <span className="step-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <div className="step-card-body">
                <strong>Close confidently</strong>
                <p>Connect with property agents through one streamlined workflow.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Popular cities</h2>
          <Link href="/listings">Explore cities</Link>
        </div>
        <div className="city-chip-row">
          {popularCities.length ? (
            popularCities.map((city) => (
              <Link key={city} href={`/listings?city=${encodeURIComponent(city)}`}>
                {city}
              </Link>
            ))
          ) : (
            <p className="home-empty-note city-chip-empty">
              Cities appear when listings are published.
            </p>
          )}
        </div>
      </section>

      <section className="section home-cta-section" aria-labelledby="home-cta-heading">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-banner-content">
              <p className="cta-banner-badge">Free for property agents</p>
              <h2 id="home-cta-heading">Have a property to sell or rent?</h2>
              <p className="cta-banner-copy">
                List on J3 Clusters with a verified workflow — reach serious
                buyers and renters across growing cities.
              </p>
              <ul className="cta-banner-points">
                <li>Free listing submissions</li>
                <li>Verified agent profile</li>
                <li>Dedicated support team</li>
              </ul>
            </div>
            <div className="cta-actions">
              <Link href="/register/consultant" className="cta-primary-btn">
                Register free
              </Link>
              <Link href="/login" className="cta-secondary-btn">
                Sign in
              </Link>
              <a
                href={buildWhatsAppUrl(SITE_GENERAL_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-secondary-btn"
              >
                WhatsApp us
              </a>
              <Link href="/contact" className="cta-secondary-btn">
                Contact sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

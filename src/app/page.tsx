import Link from "next/link";

import { PropertyCard } from "@/components/PropertyCard";
import { loadPublishedAppListingsOrdered } from "@/lib/listing-catalog";

export default async function HomePage() {
  const ordered = await loadPublishedAppListingsOrdered();
  const featured = ordered.slice(0, 6);
  const citiesCount = new Set(featured.map((item) => item.city)).size;
  const popularCities = Array.from(new Set(featured.map((item) => item.city))).slice(
    0,
    6,
  );

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="hero-layout">
            <div>
              <p className="pill">Trusted local property platform</p>
              <h1>Find a home that fits your life</h1>
              <p className="hero-copy">
                Search verified apartments, villas, plots, and PG options in your
                preferred neighborhood with transparent pricing.
              </p>
              <div className="hero-metrics">
                <div>
                  <strong>{featured.length}+</strong>
                  <span>verified listings</span>
                </div>
                <div>
                  <strong>{citiesCount}+</strong>
                  <span>active cities</span>
                </div>
                <div>
                  <strong>24h</strong>
                  <span>consultant response target</span>
                </div>
              </div>
            </div>
            <div className="hero-highlight-card">
              <div className="hero-highlight-eyebrow">
                <span className="hero-highlight-spark" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="currentColor"
                  >
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                </span>
                <span className="hero-highlight-eyebrow-text">
                  Market spotlight
                </span>
                <span className="hero-highlight-live-pill">
                  <span
                    className="hero-highlight-live-dot"
                    aria-hidden="true"
                  />
                  Live
                </span>
              </div>
              <h3 className="hero-highlight-title">Hot in demand this week</h3>
              <p className="hero-highlight-desc">
                High-intent buyers are searching premium gated apartments in{" "}
                <span className="hero-highlight-city">Chennai</span>,{" "}
                <span className="hero-highlight-city">Hyderabad</span>,{" "}
                <span className="hero-highlight-city">Bangalore</span>, and{" "}
                <span className="hero-highlight-city">Pune</span>.
              </p>
              <ul className="hero-highlight-points">
                <li>
                  <span
                    className="hero-highlight-point-check"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  Verified listings only
                </li>
                <li>
                  <span
                    className="hero-highlight-point-check"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  Consultant-assisted journey
                </li>
                <li>
                  <span
                    className="hero-highlight-point-check"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  Instant lead capture
                </li>
              </ul>
            </div>
          </div>
          <div className="search-tabs">
            <Link href="/listings/buy" className="search-tab-active">
              Buy
            </Link>
            <Link href="/listings/rent">Rent</Link>
            <Link href="/register/consultant">Sell</Link>
          </div>
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
              href="/listings?type=Villa"
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
                <strong>Browse Villas</strong>
                <small>Premium gated homes</small>
              </span>
              <span className="hero-quick-link-arrow" aria-hidden="true">
                →
              </span>
            </Link>

            <Link
              href="/listings?type=PG"
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
                <strong>Find PG</strong>
                <small>Managed shared stays</small>
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
            <span>Verified consultant listings</span>
            <span>Dedicated support team</span>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Browse by property type</h2>
          <Link href="/listings">See all categories</Link>
        </div>
        <div className="type-grid">
          <Link href="/listings?type=Apartment" className="type-tile">
            <strong>Apartments</strong>
            <span>Ready-to-move and under-construction homes</span>
          </Link>
          <Link href="/listings?type=Villa" className="type-tile">
            <strong>Villas</strong>
            <span>Premium gated villas and independent houses</span>
          </Link>
          <Link href="/listings?type=PG" className="type-tile">
            <strong>PG</strong>
            <span>Paying guest rooms and managed shared stays</span>
          </Link>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Featured listings</h2>
          <Link href="/listings">View all</Link>
        </div>
        <div className="card-grid">
          {featured.map((item) => (
            <PropertyCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>How J3 Clusters works</h2>
          <Link href="/contact">Talk to an advisor</Link>
        </div>
        <div className="steps-grid">
          <article className="step-card">
            <strong>1. Search smarter</strong>
            <p>Filter by city, type, and budget to shortlist relevant homes fast.</p>
          </article>
          <article className="step-card">
            <strong>2. Compare options</strong>
            <p>Use side-by-side comparison to evaluate price, space, and amenities.</p>
          </article>
          <article className="step-card">
            <strong>3. Close confidently</strong>
            <p>Connect with property consultants through one streamlined workflow.</p>
          </article>
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
            <span className="meta">Seed listings to see city chips here.</span>
          )}
        </div>
      </section>

      <section className="section container">
        <div className="cta-banner">
          <div>
            <h2>Have a property to sell or rent?</h2>
            <p className="meta">
              Register as a property consultant — free listings with verified
              workflow.
            </p>
          </div>
          <div className="cta-actions">
            <Link href="/register/consultant" className="primary-nav-cta">
              Register free
            </Link>
            <Link href="/login" className="cta-contact-btn">
              Sign in
            </Link>
            <Link
              href="/contact"
              className="cta-contact-btn"
              aria-label="Contact sales"
            >
              <span className="cta-contact-btn-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <span>Contact sales</span>
              <span className="cta-contact-btn-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PropertyCard } from "@/components/PropertyCard";
import { filterListingsByPurposeRouteMode } from "@/lib/listing-catalog";
import type { Listing } from "@/types/listing";

type ListingsViewProps = {
  /** `/listings` vs dedicated `/listings/buy` or `/listings/rent` */
  purposeRoute?: "listings" | "buy" | "rent";
  /** Server-provided catalog — avoids a client fetch on first paint. */
  catalogItems: Listing[];
  initialMode: string;
  initialType: string;
  initialCity: string;
  initialMinBudget: string;
  initialBudgetMax: string;
  initialSort: string;
};

function normalizePurposeMode(raw: string): "" | "buy" | "rent" {
  const v = raw.trim().toLowerCase();
  if (v === "rent") {
    return "rent";
  }
  if (v === "buy" || v === "sell") {
    return "buy";
  }
  return "";
}

export function ListingsView({
  purposeRoute = "listings",
  catalogItems,
  initialMode,
  initialType,
  initialCity,
  initialMinBudget,
  initialBudgetMax,
  initialSort,
}: ListingsViewProps) {
  const router = useRouter();
  const [items, setItems] = useState<Listing[]>(catalogItems);
  const [mode, setMode] = useState(() => normalizePurposeMode(initialMode));
  const [type, setType] = useState(initialType);
  const [city, setCity] = useState(initialCity);
  const [minBudget, setMinBudget] = useState(initialMinBudget);
  const [maxBudget, setMaxBudget] = useState(initialBudgetMax);
  const [sort, setSort] = useState(initialSort || "newest");
  const [page, setPage] = useState(1);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showComparePanel, setShowComparePanel] = useState(false);
  const pageSize = 6;

  useEffect(() => {
    setMode(normalizePurposeMode(initialMode));
    setType(initialType);
    setCity(initialCity);
    setMinBudget(initialMinBudget);
    setMaxBudget(initialBudgetMax);
    setSort(initialSort || "newest");
  }, [
    initialMode,
    initialType,
    initialCity,
    initialMinBudget,
    initialBudgetMax,
    initialSort,
  ]);

  useEffect(() => {
    setItems(catalogItems);
  }, [catalogItems]);

  const itemsForPurpose = useMemo(
    () => filterListingsByPurposeRouteMode(items, mode),
    [items, mode],
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (purposeRoute === "listings" && mode) {
      params.set("mode", mode);
    }
    if (type) {
      params.set("type", type);
    }
    if (city.trim()) {
      params.set("city", city.trim());
    }
    if (minBudget) {
      params.set("min", minBudget);
    }
    if (maxBudget) {
      params.set("budget", `0-${maxBudget}`);
    }
    if (sort && sort !== "newest") {
      params.set("sort", sort);
    }

    const basePath =
      purposeRoute === "buy"
        ? "/listings/buy"
        : purposeRoute === "rent"
          ? "/listings/rent"
          : "/listings";
    const query = params.toString();
    router.replace(query ? `${basePath}?${query}` : basePath);
  }, [purposeRoute, mode, type, city, minBudget, maxBudget, sort, router]);

  const filtered = useMemo(() => {
    const normalizedType = type.trim().toLowerCase();
    const normalizedCity = city.trim().toLowerCase();
    const minBudgetValue = Number(minBudget || "0");
    const budgetValue = Number(maxBudget || "0");

    const filteredItems = itemsForPurpose.filter((item) => {
      const typeOk =
        !normalizedType || item.type.toLowerCase() === normalizedType;
      const cityOk =
        !normalizedCity || item.city.toLowerCase().includes(normalizedCity);
      const minBudgetOk = !minBudgetValue || item.price >= minBudgetValue;
      const budgetOk = !budgetValue || item.price <= budgetValue;
      return typeOk && cityOk && minBudgetOk && budgetOk;
    });

    if (sort === "newest") {
      return filteredItems;
    }

    return filteredItems.sort((a, b) => {
      if (sort === "price-asc") {
        return a.price - b.price;
      }
      return b.price - a.price;
    });
  }, [itemsForPurpose, type, city, minBudget, maxBudget, sort]);

  const clearFilters = () => {
    setType("");
    setCity("");
    setMinBudget("");
    setMaxBudget("");
    setSort("newest");
    setPage(1);
    if (purposeRoute === "listings") {
      setMode("");
    }
  };

  function filterQueryString(): string {
    const params = new URLSearchParams();
    if (type) {
      params.set("type", type);
    }
    if (city.trim()) {
      params.set("city", city.trim());
    }
    if (minBudget) {
      params.set("min", minBudget);
    }
    if (maxBudget) {
      params.set("budget", `0-${maxBudget}`);
    }
    if (sort && sort !== "newest") {
      params.set("sort", sort);
    }
    return params.toString();
  }

  function handlePurposeChange(raw: string) {
    const next = normalizePurposeMode(raw);
    if (purposeRoute === "listings") {
      setMode(next);
      return;
    }
    const q = filterQueryString();
    if (purposeRoute === "buy") {
      if (next === "rent") {
        router.push(q ? `/listings/rent?${q}` : "/listings/rent");
        return;
      }
      if (next === "") {
        router.push(q ? `/listings?${q}` : "/listings");
        return;
      }
      return;
    }
    if (purposeRoute === "rent") {
      if (next === "buy") {
        router.push(q ? `/listings/buy?${q}` : "/listings/buy");
        return;
      }
      if (next === "") {
        router.push(q ? `/listings?${q}` : "/listings");
        return;
      }
    }
  }

  useEffect(() => {
    setPage(1);
  }, [mode, type, city, minBudget, maxBudget, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedItems = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const compareItems = useMemo(() => {
    return compareIds
      .map((id) => items.find((item) => item.id === id))
      .filter((item): item is Listing => Boolean(item));
  }, [compareIds, items]);

  function toggleCompare(id: string) {
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.filter((value) => value !== id);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, id];
    });
  }

  function removeCompare(id: string) {
    setCompareIds((current) => current.filter((value) => value !== id));
  }

  const compareDisabled = compareIds.length >= 3;

  const listingsHeading = useMemo(() => {
    if (mode === "rent") {
      return "Properties for rent";
    }
    if (mode === "buy") {
      return "Properties for sale";
    }
    return "Property listings";
  }, [mode]);

  const listingsResultLine = useMemo(() => {
    const pagePart = `page ${safePage} of ${totalPages}`;
    if (mode === "rent") {
      return `${filtered.length} rentals match your filters • ${pagePart}`;
    }
    if (mode === "buy") {
      return `${filtered.length} sale listings match your filters • ${pagePart}`;
    }
    return `${filtered.length} properties found • ${pagePart}`;
  }, [filtered.length, mode, safePage, totalPages]);

  const listingsIntro = useMemo(() => {
    if (mode === "rent") {
      return "Browse verified rental homes and PG options with clear pricing, filters, and side-by-side comparison.";
    }
    if (mode === "buy") {
      return "Explore verified homes and land for purchase with transparent filters and quick comparison.";
    }
    return "Discover verified homes with transparent filters and quick comparison.";
  }, [mode]);

  const purposeVariant = useMemo((): "buy" | "rent" | "any" => {
    if (mode === "rent") {
      return "rent";
    }
    if (mode === "buy") {
      return "buy";
    }
    return "any";
  }, [mode]);

  const purposePillLabel = useMemo(() => {
    if (purposeVariant === "rent") {
      return "Rentals";
    }
    if (purposeVariant === "buy") {
      return "For sale";
    }
    return "All listings";
  }, [purposeVariant]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (purposeRoute === "listings" && mode) {
      count += 1;
    }
    if (type) {
      count += 1;
    }
    if (city.trim()) {
      count += 1;
    }
    if (minBudget) {
      count += 1;
    }
    if (maxBudget) {
      count += 1;
    }
    if (sort && sort !== "newest") {
      count += 1;
    }
    return count;
  }, [purposeRoute, mode, type, city, minBudget, maxBudget, sort]);

  const cityOptions = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.city))).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [items]);

  return (
    <main
      className={`listings-page listings-page--${purposeVariant}`}
      data-listing-purpose={purposeVariant}
    >
      <div className="listings-page-bg" aria-hidden="true" />
      <div className="container listings-page-inner">
        <header className="listings-hero">
          <div className="listings-hero-top">
            <span className="listings-purpose-pill">{purposePillLabel}</span>
            <div className="listings-purpose-tabs" role="tablist" aria-label="Listing purpose">
              <button
                type="button"
                role="tab"
                aria-selected={mode === ""}
                className={`listings-purpose-tab${mode === "" ? " is-active" : ""}`}
                onClick={() => handlePurposeChange("")}
              >
                All
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "buy"}
                className={`listings-purpose-tab${mode === "buy" ? " is-active" : ""}`}
                onClick={() => handlePurposeChange("buy")}
              >
                Buy
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "rent"}
                className={`listings-purpose-tab${mode === "rent" ? " is-active" : ""}`}
                onClick={() => handlePurposeChange("rent")}
              >
                Rent
              </button>
            </div>
          </div>
          <div className="listings-hero-main">
            <div className="listings-hero-copy">
              <h1>{listingsHeading}</h1>
              <p className="listings-hero-intro">{listingsIntro}</p>
            </div>
            <div className="listings-hero-stats" aria-label="Search summary">
              <div className="listings-stat-card">
                <strong>{filtered.length}</strong>
                <span>matching homes</span>
              </div>
              <div className="listings-stat-card">
                <strong>{itemsForPurpose.length}</strong>
                <span>in this category</span>
              </div>
              <div className="listings-stat-card">
                <strong>{cityOptions.length}</strong>
                <span>cities covered</span>
              </div>
            </div>
          </div>
          <div className="listings-type-chips" aria-label="Quick property types">
            {["Apartment", "Villa", "Plot", "PG"].map((propertyType) => (
              <button
                key={propertyType}
                type="button"
                className={`listings-type-chip${type === propertyType ? " is-active" : ""}`}
                onClick={() =>
                  setType((current) =>
                    current === propertyType ? "" : propertyType,
                  )
                }
              >
                {propertyType}
              </button>
            ))}
          </div>
        </header>

        <div className="listing-layout">
          <aside className="listing-sidebar listings-filters-panel">
            <div className="listings-filters-head">
              <h2>Refine search</h2>
              <p>Adjust filters — results update instantly.</p>
            </div>
            <div className="filters-vertical listings-filters-form">
              {purposeRoute === "listings" ? (
                <label className="listings-filter-field">
                  <span className="listings-filter-label">Purpose</span>
                  <select
                    value={mode}
                    onChange={(event) => handlePurposeChange(event.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="buy">Buy</option>
                    <option value="rent">Rent</option>
                  </select>
                </label>
              ) : null}
              <label className="listings-filter-field">
                <span className="listings-filter-label">Property type</span>
                <select value={type} onChange={(event) => setType(event.target.value)}>
                  <option value="">Any type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Plot">Plot</option>
                  <option value="PG">PG</option>
                </select>
              </label>
              <label className="listings-filter-field">
                <span className="listings-filter-label">City</span>
                <input
                  type="text"
                  placeholder="e.g. Chennai"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  list="listings-city-suggestions"
                />
                <datalist id="listings-city-suggestions">
                  {cityOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </label>
              <label className="listings-filter-field">
                <span className="listings-filter-label">Min budget (₹)</span>
                <input
                  type="number"
                  min={0}
                  step={100_000}
                  placeholder="No minimum"
                  value={minBudget}
                  onChange={(event) => setMinBudget(event.target.value)}
                />
              </label>
              <label className="listings-filter-field">
                <span className="listings-filter-label">Max budget (₹)</span>
                <input
                  type="number"
                  min={0}
                  step={100_000}
                  placeholder="No maximum"
                  value={maxBudget}
                  onChange={(event) => setMaxBudget(event.target.value)}
                />
              </label>
              <button
                type="button"
                className="secondary-btn listings-filters-clear"
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
              >
                Clear all filters
              </button>
            </div>
          </aside>

          <section className="listings-results">
            <div className="listings-toolbar">
              <div className="listings-toolbar-left">
                <p className="listings-results-count">{listingsResultLine}</p>
                {activeFilterCount > 0 ? (
                  <span className="listings-filter-badge">
                    {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"} active
                  </span>
                ) : null}
              </div>
              <label className="listings-sort">
                <span className="listings-sort-label">Sort by</span>
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="newest">Newest first</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
              </label>
            </div>

            {filtered.length === 0 ? (
              <div className="listings-empty-state">
                <div className="listings-empty-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="32"
                    height="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5Z" />
                    <path d="M9 21v-6h6v6" />
                  </svg>
                </div>
                <h2>No properties found</h2>
                <p>
                  {items.length === 0
                    ? mode === "rent"
                      ? "No rental listings are available yet. Browse properties for sale or check back soon."
                      : "No published listings yet. Check back soon or list a property as an agent."
                    : "Nothing matches these filters. Try a different city, budget, or property type."}
                </p>
                {items.length > 0 ? (
                  <button type="button" className="secondary-btn" onClick={clearFilters}>
                    Reset filters
                  </button>
                ) : null}
              </div>
            ) : (
              <>
                <div className="listings-results-grid">
                  {pagedItems.map((item) => (
                    <PropertyCard
                      key={item.id}
                      item={item}
                      variant="grid"
                      compareSlot={
                        <label className="compare-check listings-compare-check">
                          <input
                            type="checkbox"
                            checked={compareIds.includes(item.id)}
                            disabled={
                              compareDisabled && !compareIds.includes(item.id)
                            }
                            onChange={() => toggleCompare(item.id)}
                          />
                          Compare
                        </label>
                      }
                    />
                  ))}
                </div>
                <nav className="listings-pagination" aria-label="Listings pages">
                  <button
                    type="button"
                    className="secondary-btn listings-page-btn"
                    disabled={safePage <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    ← Previous
                  </button>
                  <div className="listings-page-indicator">
                    <span className="listings-page-current">{safePage}</span>
                    <span className="listings-page-sep">/</span>
                    <span className="listings-page-total">{totalPages}</span>
                  </div>
                  <button
                    type="button"
                    className="secondary-btn listings-page-btn"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                  >
                    Next →
                  </button>
                </nav>
              </>
            )}
          </section>
        </div>

        {compareItems.length > 0 ? (
          <div className="compare-bar">
            <div className="compare-pill-row">
              {compareItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="compare-pill"
                  onClick={() => removeCompare(item.id)}
                >
                  {item.title} ✕
                </button>
              ))}
            </div>
            <div className="compare-bar-actions">
              <span>{compareItems.length}/3 selected</span>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setCompareIds([])}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setShowComparePanel((current) => !current)}
              >
                {showComparePanel ? "Hide compare" : "Compare now"}
              </button>
            </div>
          </div>
        ) : null}

        {showComparePanel && compareItems.length > 0 ? (
          <section className="compare-panel listings-compare-panel">
            <div className="listings-compare-head">
              <h2>Property comparison</h2>
              <span>Compare up to 3 properties side by side</span>
            </div>
            <div className="compare-grid">
              {compareItems.map((item) => (
                <article key={item.id} className="compare-card">
                  <h3>{item.title}</h3>
                  <p className="meta">{item.city}</p>
                  <ul>
                    <li>
                      <strong>Type:</strong> {item.type}
                    </li>
                    <li>
                      <strong>Price:</strong> {item.price.toLocaleString("en-IN")}
                    </li>
                    <li>
                      <strong>Area:</strong> {item.areaSqft} sqft
                    </li>
                    <li>
                      <strong>
                        {item.type === "PG" ? "Stay type:" : "Beds/Baths:"}
                      </strong>{" "}
                      {item.type === "PG"
                        ? "Managed PG"
                        : `${item.beds}/${item.baths}`}
                    </li>
                  </ul>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

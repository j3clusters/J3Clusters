"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PropertyCard } from "@/components/PropertyCard";
import type { Listing } from "@/types/listing";

type ListingsViewProps = {
  /** `/listings` vs dedicated `/listings/buy` or `/listings/rent` */
  purposeRoute?: "listings" | "buy" | "rent";
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
  initialMode,
  initialType,
  initialCity,
  initialMinBudget,
  initialBudgetMax,
  initialSort,
}: ListingsViewProps) {
  const router = useRouter();
  const [items, setItems] = useState<Listing[] | null>(null);
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
    const params = new URLSearchParams();
    if (mode) {
      params.set("mode", mode);
    }
    const query = params.toString();
    fetch(query ? `/api/listings?${query}` : "/api/listings")
      .then((response) => response.json())
      .then((payload) => {
        setItems(Array.isArray(payload.items) ? payload.items : []);
      })
      .catch(() => setItems([]));
  }, [mode]);

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
    if (!items) {
      return [];
    }

    const normalizedType = type.trim().toLowerCase();
    const normalizedCity = city.trim().toLowerCase();
    const minBudgetValue = Number(minBudget || "0");
    const budgetValue = Number(maxBudget || "0");

    const filteredItems = items.filter((item) => {
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
  }, [items, type, city, minBudget, maxBudget, sort]);

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
    if (!items) {
      return [];
    }
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
    if (items === null) {
      return "Loading listings...";
    }
    const pagePart = `page ${safePage} of ${totalPages}`;
    if (mode === "rent") {
      return `${filtered.length} rentals match your filters • ${pagePart}`;
    }
    if (mode === "buy") {
      return `${filtered.length} sale listings match your filters • ${pagePart}`;
    }
    return `${filtered.length} properties found • ${pagePart}`;
  }, [items, filtered.length, mode, safePage, totalPages]);

  const listingsIntro = useMemo(() => {
    if (mode === "rent") {
      return "Browse verified rental homes and PG options with clear pricing, filters, and side-by-side comparison.";
    }
    if (mode === "buy") {
      return "Explore verified homes and land for purchase with transparent filters and quick comparison.";
    }
    return "Discover verified homes similar to leading real-estate marketplaces, with transparent filters and quick comparison.";
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

  const filtersToolbarHint = useMemo(() => {
    if (purposeVariant === "rent") {
      return "Rental inventory updates as you change filters below.";
    }
    if (purposeVariant === "buy") {
      return "Sale inventory updates as you change filters below.";
    }
    return "Filters apply instantly once listings load.";
  }, [purposeVariant]);

  return (
    <main
      className={`listings-page container section listings-page--${purposeVariant}`}
      data-listing-purpose={purposeVariant}
    >
      <header className="listings-hero">
        <span className="listings-purpose-pill">{purposePillLabel}</span>
        <div className="section-head listings-section-head">
          <h1>{listingsHeading}</h1>
          <p>{listingsResultLine}</p>
        </div>
        <p className="meta listings-hero-intro">{listingsIntro}</p>
      </header>

      <div className="listing-layout">
        <aside className="listing-sidebar">
          <h3>Filters</h3>
          <div className="filters-vertical">
            <label>
              Purpose
              <select
                value={mode}
                onChange={(event) => handlePurposeChange(event.target.value)}
              >
                <option value="">Any</option>
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
              </select>
            </label>
            <label>
              Type
              <select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="">Any</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
                <option value="PG">PG</option>
              </select>
            </label>
            <label>
              City
              <input
                type="text"
                placeholder="City name"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
            </label>
            <label>
              Min Budget (INR)
              <input
                type="number"
                min={0}
                step={100_000}
                value={minBudget}
                onChange={(event) => setMinBudget(event.target.value)}
              />
            </label>
            <label>
              Max Budget (INR)
              <input
                type="number"
                min={0}
                step={100_000}
                value={maxBudget}
                onChange={(event) => setMaxBudget(event.target.value)}
              />
            </label>
            <button type="button" className="secondary-btn" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        </aside>
        <section>
          <div className="filters-toolbar">
            <span>{filtersToolbarHint}</span>
            <label className="sort-inline">
              Sort
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </label>
          </div>

          <div className="list-card-grid">
            {pagedItems.map((item) => (
              <PropertyCard
                key={item.id}
                item={item}
                variant="list"
                compareSlot={
                  <label className="compare-check">
                    <input
                      type="checkbox"
                      checked={compareIds.includes(item.id)}
                      disabled={compareDisabled && !compareIds.includes(item.id)}
                      onChange={() => toggleCompare(item.id)}
                    />
                    Compare this property
                  </label>
                }
              />
            ))}
          </div>
          {filtered.length > 0 ? (
            <div className="pagination-row">
              <button
                type="button"
                className="secondary-btn"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </button>
              <span>
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                className="secondary-btn"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                Next
              </button>
            </div>
          ) : null}
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
        <section className="compare-panel">
          <div className="section-head" style={{ marginBottom: "0.6rem" }}>
            <h2>Property comparison</h2>
            <span className="meta">Compare up to 3 properties</span>
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
    </main>
  );
}

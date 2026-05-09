"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PropertyCard } from "@/components/PropertyCard";
import type { Listing } from "@/types/listing";

type ListingsViewProps = {
  initialMode: string;
  initialType: string;
  initialCity: string;
  initialMinBudget: string;
  initialBudgetMax: string;
  initialSort: string;
};

export function ListingsView({
  initialMode,
  initialType,
  initialCity,
  initialMinBudget,
  initialBudgetMax,
  initialSort,
}: ListingsViewProps) {
  const router = useRouter();
  const [items, setItems] = useState<Listing[] | null>(null);
  const [mode, setMode] = useState(initialMode);
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
    if (mode) {
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

    const query = params.toString();
    router.replace(query ? `/listings?${query}` : "/listings");
  }, [mode, type, city, minBudget, maxBudget, sort, router]);

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
    setMode("");
    setType("");
    setCity("");
    setMinBudget("");
    setMaxBudget("");
    setSort("newest");
    setPage(1);
  };

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

  return (
    <main className="container section">
      <div className="section-head">
        <h1>Property listings</h1>
        <p>
          {items === null
            ? "Loading listings..."
            : `${filtered.length} properties found • page ${safePage} of ${totalPages}`}
        </p>
      </div>
      <p className="meta" style={{ marginTop: "-0.4rem", marginBottom: "1rem" }}>
        Discover verified homes similar to leading real-estate marketplaces,
        with transparent filters and quick comparison.
      </p>

      <div className="listing-layout">
        <aside className="listing-sidebar">
          <h3>Filters</h3>
          <div className="filters-vertical">
            <label>
              Purpose
              <select value={mode} onChange={(event) => setMode(event.target.value)}>
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
            <span>Filters apply instantly once listings load.</span>
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
                openImageInNewTab
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

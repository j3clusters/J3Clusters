import Link from "next/link";

import { CONSULTANT } from "@/lib/consultant-labels";

type MyPropertiesView = "live" | "pending";

type MyPropertiesHeroActionsProps = {
  page: "mine" | "post";
  liveCount: number;
  pendingCount: number;
  view?: MyPropertiesView;
};

export function MyPropertiesHeroActions({
  page,
  liveCount,
  pendingCount,
  view,
}: MyPropertiesHeroActionsProps) {
  return (
    <div className="mp-hero-actions">
      <div className="mp-hero-filters" role="group" aria-label={CONSULTANT.pagesGroup}>
        <Link
          href="/my-properties"
          className={`mp-hero-filter${page === "mine" ? " is-active" : ""}`}
          aria-current={page === "mine" ? "page" : undefined}
        >
          My properties
        </Link>
        <Link
          href="/post-property"
          className={`mp-hero-filter${page === "post" ? " is-active" : ""}`}
          aria-current={page === "post" ? "page" : undefined}
        >
          Post new property
        </Link>
      </div>
      {page === "mine" ? (
        <div className="mp-hero-filters" role="group" aria-label="Filter properties">
          <Link
            href="/my-properties?view=live"
            className={`mp-hero-filter${view === "live" ? " is-active" : ""}`}
            aria-current={view === "live" ? "true" : undefined}
          >
            Live on site
            <span className="mp-hero-filter-count">{liveCount}</span>
          </Link>
          <Link
            href="/my-properties?view=pending"
            className={`mp-hero-filter${view === "pending" ? " is-active" : ""}`}
          >
            Pending review
            <span className="mp-hero-filter-count">{pendingCount}</span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}

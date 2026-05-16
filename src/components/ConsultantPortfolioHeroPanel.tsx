import type { ConsultantPortfolioSnapshot } from "@/lib/consultant-portfolio-snapshot";

type ConsultantPortfolioHeroPanelProps = ConsultantPortfolioSnapshot;

export function ConsultantPortfolioHeroPanel({
  liveCount,
  pendingCount,
  totalCount,
  ownerEmailAlerts,
}: ConsultantPortfolioHeroPanelProps) {
  return (
    <aside className="mp-hero-panel" aria-label="Account summary">
      <p className="mp-hero-panel-label">Portfolio snapshot</p>
      <ul className="mp-hero-stats">
        <li>
          <span className="mp-hero-stat-value">{liveCount}</span>
          <span className="mp-hero-stat-label">Live</span>
        </li>
        <li>
          <span className="mp-hero-stat-value">{pendingCount}</span>
          <span className="mp-hero-stat-label">In review</span>
        </li>
        <li>
          <span className="mp-hero-stat-value">{totalCount}</span>
          <span className="mp-hero-stat-label">Total</span>
        </li>
      </ul>
      <p className="mp-hero-panel-note">
        {ownerEmailAlerts ? (
          <>
            We email the contact on each submission when it is approved or rejected.
            This dashboard always shows the latest status.
          </>
        ) : (
          <>
            Email alerts are not enabled on this site - refresh this page for review
            updates.
          </>
        )}
      </p>
    </aside>
  );
}

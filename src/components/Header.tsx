import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>
            India&apos;s modern property marketplace for buying, renting, and
            selling
          </span>
          <Link href="/contact">Need help?</Link>
        </div>
      </div>
      <div className="container nav-wrap">
        <div className="brand-wrap">
          <Link className="brand" href="/" aria-label="J3 Clusters home">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-mark-dot brand-mark-dot-1" />
              <span className="brand-mark-dot brand-mark-dot-2" />
              <span className="brand-mark-dot brand-mark-dot-3" />
            </span>
            <span className="brand-text">
              <span className="brand-text-j3">J3</span>
              <span className="brand-text-clusters">Clusters</span>
            </span>
          </Link>
        </div>
        <nav>
          <ul className="nav-list">
            <li>
              <Link href="/listings">Buy</Link>
            </li>
            <li>
              <Link href="/listings">Rent</Link>
            </li>
            <li>
              <Link href="/register">Sell</Link>
            </li>
            <li>
              <Link href="/register" className="primary-nav-cta">
                Post Property Free
              </Link>
            </li>
            <li>
              <Link href="/login" className="muted-link">
                Login
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

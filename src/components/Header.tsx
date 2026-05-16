import { Suspense } from "react";
import Link from "next/link";

import {
  HeaderMainSessionNav,
  HeaderMainSessionNavFallback,
  HeaderTopSessionLinks,
} from "@/components/HeaderSessionNav";
import { SocialLinks } from "@/components/SocialLinks";
import {
  buildWhatsAppUrl,
  SITE_GENERAL_WHATSAPP_MESSAGE,
} from "@/lib/site-contact";

export function Header() {
  const whatsappHref = buildWhatsAppUrl(SITE_GENERAL_WHATSAPP_MESSAGE);

  return (
    <header className="site-header">
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>
            India&apos;s modern property marketplace for buying, renting, and
            selling
          </span>
          <span className="top-strip-links">
            <SocialLinks
              variant="header"
              iconOnly
              excludeIds={["whatsapp"]}
              className="top-strip-social"
            />
            <Suspense fallback={null}>
              <HeaderTopSessionLinks />
            </Suspense>
            <a
              href={whatsappHref}
              className="top-strip-whatsapp"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            <Link href="/contact">Need help?</Link>
          </span>
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
        <nav aria-label="Primary">
          <ul className="nav-list">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/listings">Browse listings</Link>
            </li>
            <li>
              <Link href="/listings/buy">Buy</Link>
            </li>
            <li>
              <Link href="/listings/rent">Rent</Link>
            </li>
            <li>
              <Link href="/post-property" className="primary-nav-cta header-post-property-cta">
                Post Property <span className="header-nav-free">Free</span>
              </Link>
            </li>
            <Suspense fallback={<HeaderMainSessionNavFallback />}>
              <HeaderMainSessionNav />
            </Suspense>
          </ul>
        </nav>
      </div>
    </header>
  );
}

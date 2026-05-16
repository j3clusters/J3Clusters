import Link from "next/link";

import { SocialLinks } from "@/components/SocialLinks";
import {
  buildWhatsAppUrl,
  SITE_GENERAL_WHATSAPP_MESSAGE,
  SITE_WHATSAPP,
} from "@/lib/site-contact";
export function Footer() {
  const whatsappHref = buildWhatsAppUrl(SITE_GENERAL_WHATSAPP_MESSAGE);

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="container footer-grid">
          <div className="footer-col footer-col-brand">
            <Link href="/" className="footer-brand-link" aria-label="J3 Clusters home">
              <span className="brand-mark footer-brand-mark" aria-hidden="true">
                <span className="brand-mark-dot brand-mark-dot-1" />
                <span className="brand-mark-dot brand-mark-dot-2" />
                <span className="brand-mark-dot brand-mark-dot-3" />
              </span>
              <span className="brand-text footer-brand-text">
                <span className="brand-text-j3">J3</span>
                <span className="brand-text-clusters">Clusters</span>
              </span>
            </Link>
            <p className="footer-tagline">Trusted local property platform</p>
            <p className="footer-copy">
              Verified listings, transparent pricing, and consultant support for
              buyers, renters, and sellers across growing Indian cities.
            </p>
            <Link href="/about" className="footer-about-link">
              Learn more about us
            </Link>
            <div className="footer-contact-actions">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-btn"
                title={SITE_WHATSAPP.display}
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className="footer-col">
            <p className="footer-heading">Explore</p>
            <ul className="footer-nav">
              <li>
                <Link href="/listings/buy">Buy a home</Link>
              </li>
              <li>
                <Link href="/listings/rent">Rent a property</Link>
              </li>
              <li>
                <Link href="/listings">All listings</Link>
              </li>
              <li>
                <Link href="/register/consultant">List as consultant</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <p className="footer-heading">Company</p>
            <ul className="footer-nav">
              <li>
                <Link href="/about">About us</Link>
              </li>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
              <li>
                <Link href="/contact">Contact us</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms &amp; conditions</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <p className="footer-heading">Account</p>
            <ul className="footer-nav">
              <li>
                <Link href="/register/consultant">Register as consultant</Link>
              </li>
              <li>
                <Link href="/register/member">Join as member</Link>
              </li>
              <li>
                <Link href="/login">Sign in</Link>
              </li>
              <li>
                <Link href="/admin/login">Admin login</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-social-band">
        <div className="container footer-social-band-inner">
          <p className="footer-social-title">Follow &amp; connect</p>
          <SocialLinks variant="footer" iconOnly />
        </div>
      </div>

      <div className="container footer-bottom">
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} J3 Clusters. All rights reserved.
        </p>
        <nav className="footer-bottom-nav" aria-label="Footer legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}

import Link from "next/link";

import { SocialLinks } from "@/components/SocialLinks";
import {
  buildWhatsAppUrl,
  SITE_GENERAL_WHATSAPP_MESSAGE,
  SITE_WHATSAPP,
} from "@/lib/site-contact";
import { buildMailtoInquiryHref, getSiteContactEmail } from "@/lib/site-social";

export function Footer() {
  const whatsappHref = buildWhatsAppUrl(SITE_GENERAL_WHATSAPP_MESSAGE);
  const email = getSiteContactEmail();
  const mailHref = buildMailtoInquiryHref(email);
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">J3 Clusters</p>
          <p className="footer-copy">
            <strong>About us:</strong> J3 Clusters is committed to delivering a
            reliable and transparent property experience for buyers, renters,
            and sellers. We maintain high standards through verified listings,
            clear communication, and consistent customer support. Our objective
            is to simplify decision-making and build long-term trust across
            growing Indian cities. We continuously improve our platform to meet
            evolving market expectations. Integrity, accountability, and service
            excellence remain central to everything we do.
          </p>
        </div>
        <div>
          <p className="footer-heading">Explore</p>
          <p>
            <Link href="/listings/buy">Buy a home</Link>
          </p>
          <p>
            <Link href="/listings/rent">Rent a property</Link>
          </p>
          <p>
            <Link href="/register/consultant">List as consultant</Link>
          </p>
          <p>
            <Link href="/register/member">Join as member</Link>
          </p>
        </div>
        <div>
          <p className="footer-heading">Company</p>
          <p>
            <Link href="/about">About us</Link>
          </p>
          <p>
            <Link href="/faq">FAQ</Link>
          </p>
          <p>
            <Link href="/privacy">Privacy policy</Link>
          </p>
          <p>
            <Link href="/terms">Terms &amp; conditions</Link>
          </p>
        </div>
        <div>
          <p className="footer-heading">Consultants</p>
          <p>
            <Link href="/community/consultant">Consultant community</Link>
          </p>
          <p>
            <Link href="/register/consultant">Register free</Link>
          </p>
          <p>
            <Link href="/login">Consultant login</Link>
          </p>
          <p>
            <Link href="/contact">Contact us</Link>
          </p>
          <p>
            <a href={mailHref}>Email ({email})</a>
          </p>
          <p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp ({SITE_WHATSAPP.display})
            </a>
          </p>
          <p>
            <Link href="/admin/login">Admin login</Link>
          </p>
        </div>
      </div>
      <div className="footer-social-band">
        <div className="container footer-social-band-inner">
          <p className="footer-social-title">Follow &amp; connect</p>
          <SocialLinks variant="footer" />
        </div>
      </div>
      <div className="container footer-bottom">
        <p>Copyright 2026 J3 Clusters. All rights reserved.</p>
      </div>
    </footer>
  );
}

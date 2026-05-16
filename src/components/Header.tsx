import { cookies } from "next/headers";
import Link from "next/link";

import { USER_SESSION_COOKIE_NAME } from "@/lib/auth/jwt-cookies";
import { verifyUserJwt } from "@/lib/auth/verify-session-token";
import { UserLogoutButton } from "@/components/UserLogoutButton";
import {
  buildWhatsAppUrl,
  SITE_GENERAL_WHATSAPP_MESSAGE,
} from "@/lib/site-contact";
import { effectiveAccountRole } from "@/lib/user-session-role";

export async function Header() {
  const token = (await cookies()).get(USER_SESSION_COOKIE_NAME)?.value;
  let session: Awaited<ReturnType<typeof verifyUserJwt>> | null = null;
  try {
    session = await verifyUserJwt(token);
  } catch (err) {
    console.error(
      "[Header] User session check failed — set ADMIN_JWT_SECRET and USER_JWT_SECRET (32+ chars each) on the host:",
      err,
    );
  }

  const role = effectiveAccountRole(session);

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
            {!session ? (
              <>
                <Link href="/register">Register</Link>
                <span className="top-strip-sep" aria-hidden="true">
                  |
                </span>
                <Link href="/community/member">Members</Link>
              </>
            ) : null}
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
              <Link href="/listings/buy">Buy</Link>
            </li>
            <li>
              <Link href="/listings/rent">Rent</Link>
            </li>
            <li>
              <Link
                href={
                  role === "CONSULTANT"
                    ? "/post-property"
                    : "/register/consultant"
                }
              >
                Sell
              </Link>
            </li>
            {role === "CONSULTANT" ? (
              <>
                <li>
                  <Link href="/post-property" className="primary-nav-cta">
                    Post property
                  </Link>
                </li>
                <li>
                  <UserLogoutButton className="header-logout-btn" />
                </li>
              </>
            ) : role === "MEMBER" ? (
              <>
                <li>
                  <Link href="/community/member">Member hub</Link>
                </li>
                <li>
                  <UserLogoutButton className="header-logout-btn" />
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/community/consultant">Consultants</Link>
                </li>
                <li>
                  <Link href="/register">Join</Link>
                </li>
                <li>
                  <Link href="/login" className="muted-link">
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/login?next=${encodeURIComponent("/post-property")}`}
                    className="primary-nav-cta"
                  >
                    Post property
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

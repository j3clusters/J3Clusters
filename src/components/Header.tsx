import { cookies } from "next/headers";
import Link from "next/link";

import { USER_SESSION_COOKIE_NAME } from "@/lib/auth/jwt-cookies";
import { verifyUserJwt } from "@/lib/auth/verify-session-token";
import { UserLogoutButton } from "@/components/UserLogoutButton";

export async function Header() {
  const token = (await cookies()).get(USER_SESSION_COOKIE_NAME)?.value;
  let isOwner = false;
  try {
    const session = await verifyUserJwt(token);
    isOwner = Boolean(session);
  } catch (err) {
    // Missing/invalid JWT env on Vercel would otherwise 500 every page (Header is global).
    console.error(
      "[Header] User session check failed — set ADMIN_JWT_SECRET and USER_JWT_SECRET (32+ chars each) on the host:",
      err,
    );
  }

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
        <nav aria-label="Primary">
          <ul className="nav-list">
            <li>
              <Link href="/listings/buy">Buy</Link>
            </li>
            <li>
              <Link href="/listings/rent">Rent</Link>
            </li>
            <li>
              <Link href={isOwner ? "/post-property" : "/register"}>Sell</Link>
            </li>
            {isOwner ? (
              <>
                <li>
                  <Link href="/my-properties">My properties</Link>
                </li>
                <li>
                  <Link href="/post-property" className="primary-nav-cta">
                    Post property
                  </Link>
                </li>
                <li>
                  <UserLogoutButton className="header-logout-btn" />
                </li>
              </>
            ) : (
              <>
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
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

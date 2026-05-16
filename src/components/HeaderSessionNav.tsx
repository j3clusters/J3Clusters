import { cookies } from "next/headers";
import Link from "next/link";
import { cache } from "react";

import { USER_SESSION_COOKIE_NAME } from "@/lib/auth/jwt-cookies";
import { verifyUserJwt } from "@/lib/auth/verify-session-token";
import { UserLogoutButton } from "@/components/UserLogoutButton";
import { effectiveAccountRole } from "@/lib/user-session-role";

const readUserRole = cache(async () => {
  const token = (await cookies()).get(USER_SESSION_COOKIE_NAME)?.value;
  try {
    const session = await verifyUserJwt(token);
    return effectiveAccountRole(session);
  } catch (err) {
    console.error(
      "[Header] User session check failed — set ADMIN_JWT_SECRET and USER_JWT_SECRET (32+ chars each) on the host:",
      err,
    );
    return null;
  }
});

export async function HeaderTopSessionLinks() {
  const role = await readUserRole();
  if (role) return null;

  return (
    <>
      <Link href="/register">Register</Link>
      <span className="top-strip-sep" aria-hidden="true">
        |
      </span>
      <Link href="/community/member">Members</Link>
    </>
  );
}

export async function HeaderMainSessionNav() {
  const role = await readUserRole();

  if (role === "CONSULTANT") {
    return (
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
    );
  }

  if (role === "MEMBER") {
    return (
      <>
        <li>
          <Link href="/community/member">Member hub</Link>
        </li>
        <li>
          <UserLogoutButton className="header-logout-btn" />
        </li>
      </>
    );
  }

  return (
    <>
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
  );
}

export function HeaderMainSessionNavFallback() {
  return (
    <>
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
  );
}

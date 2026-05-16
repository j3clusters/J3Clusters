import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE_NAME,
  USER_SESSION_COOKIE_NAME,
} from "@/lib/auth/jwt-cookies";
import { verifyAdminJwt, verifyUserJwt } from "@/lib/auth/verify-session-token";
import { effectiveAccountRole } from "@/lib/user-session-role";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    const session = await verifyAdminJwt(token);
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/post-property") ||
    pathname.startsWith("/my-properties")
  ) {
    const token = request.cookies.get(USER_SESSION_COOKIE_NAME)?.value;
    const session = await verifyUserJwt(token);
    if (!session) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(login);
    }
    if (effectiveAccountRole(session) !== "CONSULTANT") {
      return NextResponse.redirect(new URL("/community/member", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/post-property",
    "/post-property/:path*",
    "/my-properties",
    "/my-properties/:path*",
  ],
};

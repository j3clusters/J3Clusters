import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE_NAME,
  USER_SESSION_COOKIE_NAME,
  verifyAdminJwt,
  verifyUserJwt,
} from "@/lib/auth/session";

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

  if (pathname.startsWith("/post-property")) {
    const token = request.cookies.get(USER_SESSION_COOKIE_NAME)?.value;
    const session = await verifyUserJwt(token);
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/post-property/:path*"],
};

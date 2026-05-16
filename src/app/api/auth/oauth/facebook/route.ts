import { NextResponse } from "next/server";

import {
  buildFacebookAuthUrl,
  isFacebookOAuthConfigured,
} from "@/lib/auth/facebook-oauth";
import { createOAuthState } from "@/lib/auth/oauth-state";
import { setOAuthStateCookies } from "@/lib/auth/oauth-state";
import { memberRedirectAfterLogin } from "@/lib/safe-next-path";

export async function GET(request: Request) {
  if (!isFacebookOAuthConfigured()) {
    return NextResponse.redirect(
      new URL(
        "/login?oauth_error=Facebook+sign-in+is+not+configured",
        request.url,
      ),
    );
  }

  const url = new URL(request.url);
  const next = memberRedirectAfterLogin(url.searchParams.get("next"));
  const state = createOAuthState(next);
  const origin = url.origin;

  let authUrl: string;
  try {
    authUrl = buildFacebookAuthUrl(origin, state);
  } catch {
    return NextResponse.redirect(
      new URL("/login?oauth_error=Facebook+sign-in+is+unavailable", request.url),
    );
  }

  const response = NextResponse.redirect(authUrl);
  setOAuthStateCookies(response, state);
  return response;
}

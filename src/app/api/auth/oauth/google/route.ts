import { NextResponse } from "next/server";

import {
  buildGoogleAuthUrl,
  createOAuthState,
  getGoogleOAuthSetupIssue,
  googleOAuthSetupErrorMessage,
  isGoogleOAuthConfigured,
} from "@/lib/auth/google-oauth";
import { setOAuthStateCookies } from "@/lib/auth/oauth-state";
import { requireTurnstileQueryParam } from "@/lib/auth/turnstile";
import {
  memberRedirectAfterLogin,
  oauthErrorReturnPath,
} from "@/lib/safe-next-path";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const errorReturn = oauthErrorReturnPath(url.searchParams.get("from"));

  const captchaFailure = await requireTurnstileQueryParam(
    request,
    url.searchParams.get("turnstile"),
    errorReturn,
  );
  if (captchaFailure) {
    return captchaFailure;
  }

  if (!isGoogleOAuthConfigured()) {
    const issue = getGoogleOAuthSetupIssue();
    return NextResponse.redirect(
      new URL(
        `${errorReturn}?oauth_error=${encodeURIComponent(googleOAuthSetupErrorMessage(issue))}`,
        request.url,
      ),
    );
  }

  const next = memberRedirectAfterLogin(url.searchParams.get("next"));
  const state = createOAuthState(next, errorReturn);
  const origin = url.origin;

  let authUrl: string;
  try {
    authUrl = buildGoogleAuthUrl(origin, state);
  } catch {
    return NextResponse.redirect(
      new URL(
        `${errorReturn}?oauth_error=Google+sign-in+is+unavailable`,
        request.url,
      ),
    );
  }

  const response = NextResponse.redirect(authUrl);
  setOAuthStateCookies(response, state);
  return response;
}

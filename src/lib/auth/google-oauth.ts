import {
  createOAuthState,
  encodeOAuthState,
  type OAuthState,
} from "@/lib/auth/oauth-state";

export type { OAuthState };

export { createOAuthState, encodeOAuthState };

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

export type GoogleOAuthSetupIssue = "missing_all" | "missing_secret";

export function getGoogleOAuthSetupIssue(): GoogleOAuthSetupIssue | null {
  const hasId = Boolean(process.env.GOOGLE_CLIENT_ID?.trim());
  const hasSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim());
  if (hasId && hasSecret) {
    return null;
  }
  if (hasId && !hasSecret) {
    return "missing_secret";
  }
  return "missing_all";
}

/** User-facing message when Google OAuth cannot start. */
export function googleOAuthSetupErrorMessage(
  issue: GoogleOAuthSetupIssue | null = getGoogleOAuthSetupIssue(),
): string {
  if (issue === "missing_secret") {
    return "Google client ID is set but GOOGLE_CLIENT_SECRET is missing. Add the GOCSPX client secret to .env.local and restart the dev server.";
  }
  return "Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local.";
}

export function getGoogleRedirectUri(origin: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/api/auth/oauth/google/callback`;
}

export function buildGoogleAuthUrl(origin: string, state: OAuthState): string {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured.");
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state: encodeOAuthState(state),
    prompt: "select_account",
    access_type: "online",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export type GoogleUserInfo = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
};

export async function exchangeGoogleCode(
  origin: string,
  code: string,
): Promise<GoogleUserInfo> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured.");
  }

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleRedirectUri(origin),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    throw new Error("Google token exchange failed.");
  }

  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) {
    throw new Error("Google token response missing access_token.");
  }

  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  if (!profileRes.ok) {
    throw new Error("Google userinfo request failed.");
  }

  const profile = (await profileRes.json()) as GoogleUserInfo;
  if (!profile.sub || !profile.email) {
    throw new Error("Google profile missing required fields.");
  }
  if (profile.email_verified === false) {
    throw new Error("Google email is not verified.");
  }

  return profile;
}

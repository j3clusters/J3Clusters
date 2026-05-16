import { encodeOAuthState, type OAuthState } from "@/lib/auth/oauth-state";

const FACEBOOK_AUTH_URL = "https://www.facebook.com/v21.0/dialog/oauth";
const FACEBOOK_GRAPH = "https://graph.facebook.com/v21.0";

export function isFacebookOAuthConfigured(): boolean {
  return Boolean(
    process.env.FACEBOOK_APP_ID?.trim() &&
      process.env.FACEBOOK_APP_SECRET?.trim(),
  );
}

export function getFacebookRedirectUri(origin: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/api/auth/oauth/facebook/callback`;
}

export function buildFacebookAuthUrl(origin: string, state: OAuthState): string {
  const appId = process.env.FACEBOOK_APP_ID?.trim();
  if (!appId) {
    throw new Error("FACEBOOK_APP_ID is not configured.");
  }
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: getFacebookRedirectUri(origin),
    response_type: "code",
    scope: "email,public_profile",
    state: encodeOAuthState(state),
  });
  return `${FACEBOOK_AUTH_URL}?${params.toString()}`;
}

export type FacebookUserInfo = {
  id: string;
  email?: string;
  name?: string;
};

export async function exchangeFacebookCode(
  origin: string,
  code: string,
): Promise<FacebookUserInfo> {
  const appId = process.env.FACEBOOK_APP_ID?.trim();
  const appSecret = process.env.FACEBOOK_APP_SECRET?.trim();
  if (!appId || !appSecret) {
    throw new Error("Facebook OAuth is not configured.");
  }

  const redirectUri = getFacebookRedirectUri(origin);
  const tokenParams = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  });

  const tokenRes = await fetch(
    `${FACEBOOK_GRAPH}/oauth/access_token?${tokenParams.toString()}`,
  );
  if (!tokenRes.ok) {
    throw new Error("Facebook token exchange failed.");
  }

  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) {
    throw new Error("Facebook token response missing access_token.");
  }

  const profileParams = new URLSearchParams({
    fields: "id,name,email",
    access_token: tokenJson.access_token,
  });
  const profileRes = await fetch(
    `${FACEBOOK_GRAPH}/me?${profileParams.toString()}`,
  );
  if (!profileRes.ok) {
    throw new Error("Facebook profile request failed.");
  }

  const profile = (await profileRes.json()) as FacebookUserInfo;
  if (!profile.id) {
    throw new Error("Facebook profile missing id.");
  }
  if (!profile.email?.trim()) {
    throw new Error(
      "Facebook did not share your email. Allow email access or sign in with Google or email.",
    );
  }

  return profile;
}

import { exchangeGoogleCode } from "@/lib/auth/google-oauth";
import {
  completeMemberOAuthSignIn,
  redirectOAuthError,
} from "@/lib/auth/member-oauth";
import { readOAuthStateFromRequest } from "@/lib/auth/oauth-state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) {
    return redirectOAuthError(request, "Google sign-in was cancelled.");
  }

  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");
  if (!code || !stateRaw) {
    return redirectOAuthError(request, "Invalid Google sign-in response.");
  }

  const state = readOAuthStateFromRequest(request, stateRaw);
  if (!state) {
    return redirectOAuthError(request, "Sign-in session expired. Please try again.");
  }

  let profile;
  try {
    profile = await exchangeGoogleCode(url.origin, code);
  } catch {
    return redirectOAuthError(request, "Could not complete Google sign-in.");
  }

  return completeMemberOAuthSignIn(request, {
    provider: "google",
    providerId: profile.sub,
    email: profile.email,
    name: profile.name,
  }, state);
}

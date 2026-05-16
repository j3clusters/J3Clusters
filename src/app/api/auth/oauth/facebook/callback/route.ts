import { exchangeFacebookCode } from "@/lib/auth/facebook-oauth";
import {
  completeMemberOAuthSignIn,
  redirectOAuthError,
} from "@/lib/auth/member-oauth";
import { readOAuthStateFromRequest } from "@/lib/auth/oauth-state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) {
    return redirectOAuthError(request, "Facebook sign-in was cancelled.");
  }

  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");
  if (!code || !stateRaw) {
    return redirectOAuthError(request, "Invalid Facebook sign-in response.");
  }

  const state = readOAuthStateFromRequest(request, stateRaw);
  if (!state) {
    return redirectOAuthError(request, "Sign-in session expired. Please try again.");
  }

  let profile;
  try {
    profile = await exchangeFacebookCode(url.origin, code);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not complete Facebook sign-in.";
    return redirectOAuthError(request, message);
  }

  return completeMemberOAuthSignIn(
    request,
    {
      provider: "facebook",
      providerId: profile.id,
      email: profile.email!,
      name: profile.name,
    },
    state,
  );
}

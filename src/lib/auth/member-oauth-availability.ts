import { isFacebookOAuthConfigured } from "@/lib/auth/facebook-oauth";
import { isGoogleOAuthConfigured } from "@/lib/auth/google-oauth";

export type MemberOAuthAvailability = {
  google: boolean;
  facebook: boolean;
  any: boolean;
  /** Client id present but server secret missing */
  googleMisconfigured: boolean;
  facebookMisconfigured: boolean;
};

function hasPublicGoogleId(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
      process.env.GOOGLE_CLIENT_ID?.trim(),
  );
}

function hasPublicFacebookId(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim() ||
      process.env.FACEBOOK_APP_ID?.trim(),
  );
}

/** Server-only: which social providers are ready for member sign-in. */
export function getMemberOAuthAvailability(): MemberOAuthAvailability {
  const googleServer = isGoogleOAuthConfigured();
  const facebookServer = isFacebookOAuthConfigured();
  const googlePublic = hasPublicGoogleId();
  const facebookPublic = hasPublicFacebookId();

  const google = googleServer && googlePublic;
  const facebook = facebookServer && facebookPublic;

  return {
    google,
    facebook,
    any: google || facebook,
    googleMisconfigured: googlePublic && !googleServer,
    facebookMisconfigured: facebookPublic && !facebookServer,
  };
}

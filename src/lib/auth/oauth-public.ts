/** Safe for client bundles — public OAuth app ids (from NEXT_PUBLIC_* or next.config env mirror). */
export function isGoogleOAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim());
}

export function isFacebookOAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim());
}

export function isMemberSocialAuthConfigured(): boolean {
  return isGoogleOAuthConfigured() || isFacebookOAuthConfigured();
}

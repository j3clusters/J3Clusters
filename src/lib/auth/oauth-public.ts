/** Safe for client bundles — only public OAuth client ids are exposed. */
export function isGoogleOAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim());
}

export function isFacebookOAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim());
}

export function isMemberSocialAuthConfigured(): boolean {
  return isGoogleOAuthConfigured() || isFacebookOAuthConfigured();
}

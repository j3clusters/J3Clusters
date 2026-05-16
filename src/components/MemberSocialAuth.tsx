"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  isFacebookOAuthConfigured,
  isGoogleOAuthConfigured,
  isMemberSocialAuthConfigured,
} from "@/lib/auth/oauth-public";

type MemberSocialAuthProps = {
  mode: "login" | "register";
};

function buildOAuthHref(
  provider: "google" | "facebook",
  next: string | null,
): string {
  const params = new URLSearchParams();
  if (next) {
    params.set("next", next);
  }
  const query = params.toString();
  const base = `/api/auth/oauth/${provider}`;
  return query ? `${base}?${query}` : base;
}

export function MemberSocialAuth({ mode }: MemberSocialAuthProps) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const oauthError = searchParams.get("oauth_error");

  if (!isMemberSocialAuthConfigured()) {
    return null;
  }

  const googleLabel =
    mode === "register" ? "Continue with Google" : "Sign in with Google";
  const facebookLabel =
    mode === "register" ? "Continue with Facebook" : "Sign in with Facebook";

  return (
    <div className="portal-social-auth">
      <p className="portal-social-auth-label">
        Community members can use email, Google, or Facebook
      </p>
      <div className="portal-social-auth-buttons">
        {isGoogleOAuthConfigured() ? (
          <Link
            href={buildOAuthHref("google", next)}
            className="portal-social-btn portal-social-btn-google"
          >
            <span className="portal-social-btn-icon" aria-hidden="true">
              G
            </span>
            {googleLabel}
          </Link>
        ) : null}
        {isFacebookOAuthConfigured() ? (
          <Link
            href={buildOAuthHref("facebook", next)}
            className="portal-social-btn portal-social-btn-facebook"
          >
            <span
              className="portal-social-btn-icon portal-social-btn-icon-facebook"
              aria-hidden="true"
            >
              f
            </span>
            {facebookLabel}
          </Link>
        ) : null}
      </div>
      {oauthError ? (
        <p
          className="owner-form-message portal-auth-inline-msg"
          data-tone="err"
          role="alert"
        >
          {oauthError}
        </p>
      ) : null}
    </div>
  );
}

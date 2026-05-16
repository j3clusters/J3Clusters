"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { FacebookBrandIcon, GoogleBrandIcon } from "@/components/SocialBrandIcons";
import type { MemberOAuthAvailability } from "@/lib/auth/member-oauth-availability";
import {
  isFacebookOAuthConfigured,
  isGoogleOAuthConfigured,
  isMemberSocialAuthConfigured,
} from "@/lib/auth/oauth-public";
import { isTurnstileConfigured } from "@/lib/auth/turnstile-public";

type MemberSocialAuthProps = {
  mode: "login" | "register";
  variant?: "default" | "member-hub";
  oauthFromPath?: string;
  oauth?: MemberOAuthAvailability;
  /** Required for social sign-in when Turnstile is enabled */
  captchaToken?: string | null;
};

type ResolvedProviders = {
  google: boolean;
  facebook: boolean;
  any: boolean;
  googlePending: boolean;
  facebookPending: boolean;
};

function buildOAuthHref(
  provider: "google" | "facebook",
  next: string | null,
  from: string | undefined,
  captchaToken?: string | null,
): string {
  const params = new URLSearchParams();
  if (next) {
    params.set("next", next);
  }
  if (from) {
    params.set("from", from);
  }
  if (captchaToken) {
    params.set("turnstile", captchaToken);
  }
  const query = params.toString();
  const base = `/api/auth/oauth/${provider}`;
  return query ? `${base}?${query}` : base;
}

function resolveProviders(oauth?: MemberOAuthAvailability): ResolvedProviders {
  if (oauth) {
    return {
      google: oauth.google,
      facebook: oauth.facebook,
      any: oauth.any,
      googlePending: oauth.googleMisconfigured,
      facebookPending: oauth.facebookMisconfigured,
    };
  }
  const google = isGoogleOAuthConfigured();
  const facebook = isFacebookOAuthConfigured();
  return {
    google,
    facebook,
    any: isMemberSocialAuthConfigured(),
    googlePending: false,
    facebookPending: false,
  };
}

export function MemberSocialAuth({
  mode,
  variant = "default",
  oauthFromPath,
  oauth,
  captchaToken = null,
}: MemberSocialAuthProps) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const oauthError = searchParams.get("oauth_error");
  const isMemberHub = variant === "member-hub";
  const from =
    oauthFromPath ?? (isMemberHub ? "/register/member" : undefined);
  const providers = resolveProviders(oauth);
  const captchaRequired = isTurnstileConfigured();
  const captchaOk = !captchaRequired || Boolean(captchaToken);

  if (isMemberHub) {
    return (
      <MemberSocialHub
        mode={mode}
        from={from}
        next={next}
        oauthError={oauthError}
        providers={providers}
        captchaToken={captchaToken}
        captchaOk={captchaOk}
        captchaRequired={captchaRequired}
      />
    );
  }

  const showSocial =
    providers.any ||
    providers.googlePending ||
    providers.facebookPending;

  if (!showSocial) {
    return null;
  }

  const googleLabel =
    mode === "register" ? "Continue with Google" : "Sign in with Google";
  const facebookLabel =
    mode === "register" ? "Continue with Facebook" : "Sign in with Facebook";

  return (
    <div className="portal-social-auth">
      <div className="portal-social-auth-buttons">
        {providers.google ? (
          <Link
            href={buildOAuthHref("google", next, from, captchaToken)}
            className="portal-social-btn portal-social-btn-google"
            aria-disabled={!captchaOk}
            tabIndex={captchaOk ? undefined : -1}
            onClick={(event) => {
              if (!captchaOk) {
                event.preventDefault();
              }
            }}
          >
            <GoogleBrandIcon className="portal-social-btn-svg" />
            {googleLabel}
          </Link>
        ) : providers.googlePending ? (
          <div
            className="portal-social-btn portal-social-btn-google portal-social-btn--pending"
            role="status"
          >
            <GoogleBrandIcon className="portal-social-btn-svg" />
            {googleLabel}
            <span className="portal-social-btn-meta">Add GOOGLE_CLIENT_SECRET</span>
          </div>
        ) : null}
        {providers.facebook ? (
          <Link
            href={buildOAuthHref("facebook", next, from, captchaToken)}
            className="portal-social-btn portal-social-btn-facebook"
            aria-disabled={!captchaOk}
            tabIndex={captchaOk ? undefined : -1}
            onClick={(event) => {
              if (!captchaOk) {
                event.preventDefault();
              }
            }}
          >
            <FacebookBrandIcon className="portal-social-btn-svg" />
            {facebookLabel}
          </Link>
        ) : providers.facebookPending ? (
          <div
            className="portal-social-btn portal-social-btn-facebook portal-social-btn--pending"
            role="status"
          >
            <FacebookBrandIcon className="portal-social-btn-svg" />
            {facebookLabel}
            <span className="portal-social-btn-meta">Add FACEBOOK_APP_SECRET</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type MemberSocialHubProps = {
  mode: "login" | "register";
  from: string | undefined;
  next: string | null;
  oauthError: string | null;
  providers: ResolvedProviders;
  captchaToken: string | null;
  captchaOk: boolean;
  captchaRequired: boolean;
};

function MemberSocialHub({
  mode,
  from,
  next,
  oauthError,
  providers,
  captchaToken,
  captchaOk,
  captchaRequired,
}: MemberSocialHubProps) {
  const actionLabel = mode === "register" ? "Continue" : "Sign in";

  if (!providers.any) {
    return (
      <div className="member-social-connect member-social-connect--empty">
        <div
          className={`member-social-tile${providers.googlePending ? " member-social-tile--pending" : " member-social-tile--disabled"}`}
          role={providers.googlePending ? "status" : undefined}
        >
          <GoogleBrandIcon className="member-social-tile-icon" />
          <span className="member-social-tile-label">Google</span>
          <span className="member-social-tile-meta">
            {providers.googlePending
              ? "Add GOOGLE_CLIENT_SECRET in .env.local"
              : "Not configured"}
          </span>
        </div>
        <div
          className={`member-social-tile${providers.facebookPending ? " member-social-tile--pending" : " member-social-tile--disabled"}`}
          role={providers.facebookPending ? "status" : undefined}
        >
          <FacebookBrandIcon className="member-social-tile-icon member-social-tile-icon--fb" />
          <span className="member-social-tile-label">Facebook</span>
          <span className="member-social-tile-meta">
            {providers.facebookPending
              ? "Add FACEBOOK_APP_SECRET in .env.local"
              : "Not configured"}
          </span>
        </div>
        <p className="member-social-setup-note">
          {providers.googlePending || providers.facebookPending
            ? "Add the OAuth client secret, restart the dev server, then use the provider button."
            : "Social sign-in is being configured — use email registration below."}
        </p>
      </div>
    );
  }

  const tileCount =
    (providers.google ? 1 : 0) + (providers.facebook ? 1 : 0);

  return (
    <div
      className={`member-social-connect${tileCount === 1 ? " member-social-connect--single" : ""}`}
    >
      {captchaRequired && !captchaOk ? (
        <p className="member-social-captcha-hint" role="status">
          Complete the security check above to use social sign-in.
        </p>
      ) : null}

      {providers.google ? (
        <Link
          href={buildOAuthHref("google", next, from, captchaToken)}
          className={`member-social-tile member-social-tile--google${captchaOk ? "" : " member-social-tile--gated"}`}
          aria-disabled={!captchaOk}
          tabIndex={captchaOk ? undefined : -1}
          onClick={(event) => {
            if (!captchaOk) {
              event.preventDefault();
            }
          }}
        >
          <span className="member-social-tile-glow" aria-hidden="true" />
          <GoogleBrandIcon className="member-social-tile-icon" />
          <span className="member-social-tile-label">{actionLabel} with Google</span>
          <span className="member-social-tile-meta">Instant access</span>
        </Link>
      ) : providers.googlePending ? (
        <div className="member-social-tile member-social-tile--pending" role="status">
          <GoogleBrandIcon className="member-social-tile-icon" />
          <span className="member-social-tile-label">Google</span>
          <span className="member-social-tile-meta">Add client secret in .env.local</span>
        </div>
      ) : null}

      {providers.facebook ? (
        <Link
          href={buildOAuthHref("facebook", next, from, captchaToken)}
          className={`member-social-tile member-social-tile--facebook${captchaOk ? "" : " member-social-tile--gated"}`}
          aria-disabled={!captchaOk}
          tabIndex={captchaOk ? undefined : -1}
          onClick={(event) => {
            if (!captchaOk) {
              event.preventDefault();
            }
          }}
        >
          <span className="member-social-tile-glow" aria-hidden="true" />
          <FacebookBrandIcon className="member-social-tile-icon member-social-tile-icon--fb" />
          <span className="member-social-tile-label">{actionLabel} with Facebook</span>
          <span className="member-social-tile-meta">Instant access</span>
        </Link>
      ) : providers.facebookPending ? (
        <div className="member-social-tile member-social-tile--pending" role="status">
          <FacebookBrandIcon className="member-social-tile-icon member-social-tile-icon--fb" />
          <span className="member-social-tile-label">Facebook</span>
          <span className="member-social-tile-meta">Add app secret in .env.local</span>
        </div>
      ) : null}

      {oauthError ? (
        <p
          className="owner-form-message member-social-error"
          data-tone="err"
          role="alert"
        >
          {oauthError}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { FormEvent, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { MemberSocialAuth } from "@/components/MemberSocialAuth";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import {
  consultantRedirectAfterLogin,
  memberRedirectAfterLogin,
} from "@/lib/safe-next-path";
import { AUTH_LOGIN, COMMUNITY_MEMBER, CONSULTANT } from "@/lib/consultant-labels";
import { isTurnstileConfigured } from "@/lib/auth/turnstile-public";
import type { MemberOAuthAvailability } from "@/lib/auth/member-oauth-availability";

type LoginPageClientProps = {
  oauth: MemberOAuthAvailability;
};

export function LoginPageClient({ oauth }: LoginPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const pendingConsultant = searchParams.get("pending") === "consultant";
  const pendingMember = searchParams.get("pending") === "member";
  const oauthError = searchParams.get("oauth_error");

  const captchaRequired = isTurnstileConfigured();
  const captchaOk = !captchaRequired || Boolean(captchaToken);

  const handleCaptchaToken = useCallback((token: string | null) => {
    setCaptchaToken(token);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!captchaOk) {
      setError("Complete the security check before signing in.");
      return;
    }

    setError(null);
    setPending(true);
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const userResponse = await fetch("/api/auth/user-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          password: String(data.get("password") ?? ""),
          turnstileToken: captchaToken,
        }),
      });

      if (userResponse.ok) {
        const payload = await userResponse.json().catch(() => ({}));
        const rawNext = searchParams.get("next");
        const nextDest =
          payload?.accountRole === "MEMBER"
            ? memberRedirectAfterLogin(rawNext)
            : consultantRedirectAfterLogin(rawNext);
        router.push(nextDest);
        router.refresh();
        return;
      }

      const adminResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          password: String(data.get("password") ?? ""),
          turnstileToken: captchaToken,
        }),
      });

      if (adminResponse.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }

      const payload = await userResponse.json().catch(() => ({}));
      setError(typeof payload.error === "string" ? payload.error : "Login failed.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="portal-auth-page">
      <div className="portal-auth-card portal-auth-card--login">
        <header className="portal-auth-header">
          <span className="portal-auth-badge">{AUTH_LOGIN.badge}</span>
          <h1>{AUTH_LOGIN.title}</h1>
          <ul className="portal-auth-role-hints" aria-label="Who can sign in">
            <li>
              <strong>{CONSULTANT.role}</strong>
              <span>{AUTH_LOGIN.agentSignInHint}</span>
            </li>
            <li>
              <strong>{COMMUNITY_MEMBER.role}</strong>
              <span>{AUTH_LOGIN.memberSignInHint}</span>
            </li>
          </ul>
        </header>

        {pendingConsultant ? (
          <p className="owner-form-message portal-auth-inline-msg" data-tone="ok" role="status">
            {AUTH_LOGIN.pendingNote}
          </p>
        ) : null}
        {pendingMember ? (
          <p className="owner-form-message portal-auth-inline-msg" data-tone="ok" role="status">
            {AUTH_LOGIN.memberPendingNote}
          </p>
        ) : null}
        {oauthError ? (
          <p className="owner-form-message portal-auth-inline-msg" data-tone="err" role="alert">
            {oauthError}
          </p>
        ) : null}

        <div className="portal-auth-captcha">
          <TurnstileWidget onToken={handleCaptchaToken} />
          {captchaRequired && !captchaOk ? (
            <p className="portal-auth-captcha-hint">{AUTH_LOGIN.captchaHint}</p>
          ) : null}
        </div>

        <MemberSocialAuth
          mode="login"
          oauthFromPath="/login"
          oauth={oauth}
          captchaToken={captchaToken}
        />
        <p className="portal-auth-divider">
          <span>Or sign in with email</span>
        </p>
        <form className="stacked-form portal-auth-form" onSubmit={onSubmit}>
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Your password"
            />
          </label>
          {error ? (
            <p className="owner-form-message" data-tone="err" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="portal-auth-submit"
            disabled={pending || !captchaOk}
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="portal-auth-alt portal-auth-forgot">
          <Link href="/forgot-password">Forgot password?</Link>
        </p>

        <footer className="portal-auth-footer">
          <p className="portal-auth-footer-lead">{AUTH_LOGIN.needAccount}</p>
          <div className="portal-auth-register-links">
            <Link href="/register/consultant" className="portal-auth-register-link">
              {CONSULTANT.registerLink}
            </Link>
            <Link href="/register/member" className="portal-auth-register-link">
              Join as member
            </Link>
          </div>
          <p className="portal-auth-alt portal-auth-staff">
            {AUTH_LOGIN.staffNote}{" "}
            <Link href="/admin/login">{AUTH_LOGIN.staffLink}</Link> for the operations
            dashboard.
          </p>
        </footer>
      </div>
    </main>
  );
}

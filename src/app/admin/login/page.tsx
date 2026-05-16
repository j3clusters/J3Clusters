"use client";

import { FormEvent, useCallback, useState } from "react";
import Link from "next/link";

import { TurnstileWidget } from "@/components/TurnstileWidget";
import { isTurnstileConfigured } from "@/lib/auth/turnstile-public";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          password: String(data.get("password") ?? ""),
          turnstileToken: captchaToken,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          typeof payload.error === "string"
            ? payload.error
            : "Login failed.",
        );
        setPending(false);
        return;
      }

      window.location.assign("/admin");
    } catch {
      setError("Network error. Try again.");
      setPending(false);
    }
  }

  return (
    <main className="admin-auth-page">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <span className="admin-auth-badge">Administrator</span>
          <h1>Operations sign-in</h1>
          <p className="admin-auth-sub">
            Restricted access. Review submissions, publish listings, and manage
            leads.
          </p>
        </div>
        <form className="stacked-form" onSubmit={onSubmit}>
          <div className="portal-auth-captcha portal-auth-captcha--admin">
            <TurnstileWidget onToken={handleCaptchaToken} />
            {captchaRequired && !captchaOk ? (
              <p className="portal-auth-captcha-hint">
                Complete the security check to continue.
              </p>
            ) : null}
          </div>
          <label>
            Email
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="admin-auth-error">{error}</p> : null}
          <button type="submit" disabled={pending || !captchaOk}>
            {pending ? "Signing in…" : "Enter dashboard"}
          </button>
        </form>
        <div className="admin-auth-back">
          <Link href="/login">← Agent login</Link>
        </div>
      </div>
    </main>
  );
}

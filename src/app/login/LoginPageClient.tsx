"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { MemberSocialAuth } from "@/components/MemberSocialAuth";
import {
  consultantRedirectAfterLogin,
  memberRedirectAfterLogin,
} from "@/lib/safe-next-path";
import { COMMUNITY_MEMBER, CONSULTANT } from "@/lib/consultant-labels";

export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const pendingConsultant = searchParams.get("pending") === "consultant";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      <div className="portal-auth-card">
        <div className="portal-auth-header">
          <span className="portal-auth-badge">Community access</span>
          <h1>Welcome back</h1>
          <p className="portal-auth-sub">
            {COMMUNITY_MEMBER.role}s can sign in with email, Google, or Facebook.{" "}
            {CONSULTANT.role}s use email after admin approval.
          </p>
        </div>
        {pendingConsultant ? (
          <p className="owner-form-message portal-auth-inline-msg" data-tone="ok" role="status">
            Your consultant application is awaiting admin approval. Sign in here once
            approved.
          </p>
        ) : null}
        <MemberSocialAuth mode="login" />
        <p className="portal-auth-divider">
          <span>Or sign in with email</span>
        </p>
        <form className="stacked-form" onSubmit={onSubmit}>
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
          {error ? (
            <p className="owner-form-message" data-tone="err" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="portal-auth-alt portal-auth-forgot">
          <Link href="/forgot-password">Forgot password?</Link>
          <span className="portal-auth-forgot-hint">Recover or reset via email.</span>
        </p>
        <div className="portal-auth-footer">
          Need an account?{" "}
          <Link href="/register/consultant">{CONSULTANT.registerTitle}</Link>
          <span className="portal-auth-alt">
            or <Link href="/register/member">{COMMUNITY_MEMBER.registerTitle}</Link>
          </span>
          <p className="portal-auth-alt">
            Staff: use <Link href="/admin/login">Admin login</Link> for the operations
            dashboard.
          </p>
        </div>
      </div>
    </main>
  );
}

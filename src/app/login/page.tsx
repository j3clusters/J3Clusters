"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { CONSULTANT } from "@/lib/consultant-labels";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
        router.push("/my-properties");
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
      setPending(false);
    } catch {
      setError("Network error. Try again.");
      setPending(false);
    }
  }

  return (
    <main className="portal-auth-page">
      <div className="portal-auth-card">
        <div className="portal-auth-header">
          <span className="portal-auth-badge">{CONSULTANT.loginBadge}</span>
          <h1>Welcome back</h1>
          <p className="portal-auth-sub">
            Sign in as a {CONSULTANT.role.toLowerCase()} to post properties and
            track submissions under My properties.
          </p>
        </div>
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
          New {CONSULTANT.role.toLowerCase()}?{" "}
          <Link href="/register">Register free</Link>
          <p className="portal-auth-alt">
            Staff: use <Link href="/admin/login">Admin login</Link> for the
            operations dashboard.
          </p>
        </div>
      </div>
    </main>
  );
}

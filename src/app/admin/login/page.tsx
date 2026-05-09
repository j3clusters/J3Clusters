"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          password: String(data.get("password") ?? ""),
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          typeof payload.error === "string"
            ? payload.error
            : "Login failed."
        );
        setPending(false);
        return;
      }

      router.push("/admin");
      router.refresh();
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
          <button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Enter dashboard"}
          </button>
        </form>
        <div className="admin-auth-back">
          <Link href="/login">← Owner login</Link>
        </div>
      </div>
    </main>
  );
}

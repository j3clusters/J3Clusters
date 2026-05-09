"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setTone("err");
      setMessage("Missing reset token. Open the link from your email.");
      return;
    }

    setPending(true);
    setMessage(null);
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: String(data.get("password") ?? ""),
          confirmPassword: String(data.get("confirmPassword") ?? ""),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setTone("err");
        const err =
          typeof payload.error === "string"
            ? payload.error
            : "Could not reset password.";
        const details = payload.details as { fieldErrors?: Record<string, string[]> } | undefined;
        const confirmMsg = details?.fieldErrors?.confirmPassword?.[0];
        setMessage(confirmMsg ?? err);
        setPending(false);
        return;
      }

      setTone("ok");
      setMessage(
        typeof payload.message === "string"
          ? payload.message
          : "Password updated. You can sign in now.",
      );
      form.reset();
      setTimeout(() => router.push("/login"), 1200);
    } catch {
      setTone("err");
      setMessage("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return <p className="portal-auth-sub">Loading…</p>;
  }

  if (!token) {
    return (
      <>
        <p className="owner-form-message" data-tone="err" role="alert">
          This page needs a valid reset link. Request a new one from the sign-in
          page.
        </p>
        <div className="portal-auth-footer">
          <Link href="/forgot-password">Request password recovery</Link>
          {" · "}
          <Link href="/login">Sign in</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <form className="stacked-form" onSubmit={onSubmit}>
        <label>
          New password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        <label>
          Confirm new password
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        {message ? (
          <p
            className="owner-form-message"
            data-tone={tone}
            role={tone === "err" ? "alert" : undefined}
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}
        <button type="submit" disabled={pending}>
          {pending ? "Updating…" : "Update password"}
        </button>
      </form>
    </>
  );
}

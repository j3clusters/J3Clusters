"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setTone("err");
        setMessage(
          typeof payload.error === "string" ? payload.error : "Something went wrong.",
        );
        setPending(false);
        return;
      }

      setTone("ok");
      setMessage(
        typeof payload.message === "string"
          ? payload.message
          : "Check your email for the next steps.",
      );
      form.reset();
    } catch {
      setTone("err");
      setMessage("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form className="stacked-form" onSubmit={onSubmit}>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
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
          {pending ? "Sending…" : "Send recovery link"}
        </button>
      </form>
      <div className="portal-auth-footer">
        <Link href="/login">Back to sign in</Link>
      </div>
    </>
  );
}

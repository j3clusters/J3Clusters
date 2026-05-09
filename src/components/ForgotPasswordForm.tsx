"use client";

import { FormEvent, useState } from "react";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [messageMultiline, setMessageMultiline] = useState(false);
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
        setMessageMultiline(false);
        setMessage(
          typeof payload.error === "string" ? payload.error : "Something went wrong.",
        );
        setPending(false);
        return;
      }

      setTone("ok");
      const main =
        typeof payload.message === "string"
          ? payload.message
          : "Check your email for the next steps.";
      const hint =
        typeof payload.setupHint === "string" ? payload.setupHint : null;
      setMessageMultiline(Boolean(hint));
      setMessage(hint ? `${main}\n\n${hint}` : main);
      form.reset();
    } catch {
      setTone("err");
      setMessageMultiline(false);
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
            className={
              messageMultiline
                ? "owner-form-message is-multiline"
                : "owner-form-message"
            }
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
    </>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { COMMUNITY_MEMBER, CONSULTANT } from "@/lib/consultant-labels";

export type AccountRoleParam = "CONSULTANT" | "MEMBER";

type RegisterFormProps = {
  accountRole: AccountRoleParam;
  successRedirect: string;
  /** Compact grid for community member email registration */
  variant?: "default" | "member";
};

type FeedbackTone = "ok" | "err" | null;

export function RegisterForm({
  accountRole,
  successRedirect,
  variant = "default",
}: RegisterFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>(null);
  const [pending, setPending] = useState(false);

  const isConsultant = accountRole === "CONSULTANT";
  const submitLabel = isConsultant
    ? CONSULTANT.registerSubmit
    : COMMUNITY_MEMBER.registerSubmit;
  const submitPendingLabel = isConsultant
    ? CONSULTANT.registerSubmitPending
    : COMMUNITY_MEMBER.registerSubmitPending;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setFeedbackTone(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          city: String(data.get("city") ?? ""),
          password: String(data.get("password") ?? ""),
          confirmPassword: String(data.get("confirmPassword") ?? ""),
          accountRole,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(typeof payload.error === "string" ? payload.error : "Registration failed.");
        setFeedbackTone("err");
        setPending(false);
        return;
      }

      form.reset();

      if (payload.pendingApproval) {
        setMessage(
          isConsultant
            ? CONSULTANT.registrationReceived
            : COMMUNITY_MEMBER.registrationReceived,
        );
        setFeedbackTone("ok");
        setPending(false);
        return;
      }

      setMessage(
        isConsultant
          ? `Registration successful. ${CONSULTANT.canPostAfterLogin}`
          : `Registration successful. ${COMMUNITY_MEMBER.unlockPhone}`,
      );
      setFeedbackTone("ok");
      setTimeout(() => router.push(successRedirect), 700);
    } catch {
      setMessage("Network error. Please try again.");
      setFeedbackTone("err");
    } finally {
      setPending(false);
    }
  }

  const formClass =
    variant === "member"
      ? "stacked-form portal-auth-form portal-auth-form--member"
      : "stacked-form portal-auth-form";

  return (
    <>
      <form className={formClass} onSubmit={onSubmit}>
        <label>
          Full name
          <input name="name" type="text" required autoComplete="name" placeholder="Full legal name" />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" required autoComplete="tel" placeholder="+91 …" />
        </label>
        <label>
          City
          <input name="city" type="text" required autoComplete="address-level2" placeholder="Your city" />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            minLength={6}
            required
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
        </label>
        <label>
          Confirm password
          <input
            name="confirmPassword"
            type="password"
            minLength={6}
            required
            autoComplete="new-password"
            placeholder="Re-enter password"
          />
        </label>
        {message ? (
          <p
            className="owner-form-message"
            data-tone={feedbackTone ?? "err"}
            role={feedbackTone === "ok" ? "status" : "alert"}
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}
        <button type="submit" className="portal-auth-submit" disabled={pending}>
          {pending ? submitPendingLabel : submitLabel}
        </button>
      </form>
    </>
  );
}

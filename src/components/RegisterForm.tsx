"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export type AccountRoleParam = "CONSULTANT" | "MEMBER";

type RegisterFormProps = {
  accountRole: AccountRoleParam;
  successRedirect: string;
};

export function RegisterForm({ accountRole, successRedirect }: RegisterFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

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
        setPending(false);
        return;
      }

      form.reset();
      const okDetail =
        accountRole === "CONSULTANT"
          ? "You can now post properties as a property consultant. Your contact details will prefill on the listing form."
          : "You can browse listings and reveal consultant mobile numbers anytime you’re signed in.";
      setMessage(`Registration successful. ${okDetail}`);
      setTimeout(() => router.push(successRedirect), 700);
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form className="stacked-form" onSubmit={onSubmit}>
        <label>
          Full Name
          <input name="name" type="text" required />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" required />
        </label>
        <label>
          City
          <input name="city" type="text" required />
        </label>
        <label>
          Password
          <input name="password" type="password" minLength={6} required />
        </label>
        <label>
          Confirm password
          <input name="confirmPassword" type="password" minLength={6} required />
        </label>
        <button type="submit" disabled={pending}>
          {pending ? "Registering..." : "Register"}
        </button>
      </form>
      {message ? (
        <p
          className="owner-form-message portal-auth-inline-msg"
          data-tone={message.includes("successful") ? "ok" : "err"}
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </>
  );
}

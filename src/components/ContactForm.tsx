"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const form = event.currentTarget;
    const data = new FormData(form);

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(data.get("name") ?? ""),
        phone: String(data.get("phone") ?? ""),
        email: String(data.get("email") ?? ""),
        message: String(data.get("message") ?? "") || undefined,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(
        typeof payload.error === "string" ? payload.error : "Submit failed."
      );
      return;
    }

    form.reset();
    setMessage("Thank you — our team will contact you shortly.");
  }

  return (
    <>
      <form className="stacked-form" onSubmit={onSubmit}>
        <label>
          Full Name
          <input name="name" type="text" required />
        </label>
        <label>
          Mobile Number
          <input name="phone" type="tel" required />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Requirement
          <textarea
            name="message"
            rows={4}
            placeholder="Apartment in Gachibowli, 2 BHK, budget 80L"
          />
        </label>
        <button type="submit">Submit inquiry</button>
      </form>
      {message ? <p aria-live="polite">{message}</p> : null}
    </>
  );
}

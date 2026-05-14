import "server-only";

export function isResendConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim(),
  );
}

export type ResendSendResult = { ok: true } | { ok: false; reason: string };

export async function sendResendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<ResendSendResult> {
  if (!isResendConfigured()) {
    return {
      ok: false,
      reason: "RESEND_API_KEY or RESEND_FROM_EMAIL is not set.",
    };
  }

  const apiKey = process.env.RESEND_API_KEY!.trim();
  const from = process.env.RESEND_FROM_EMAIL!.trim();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
    });

    const raw = await res.text();
    let detail: unknown = raw;
    try {
      detail = raw ? JSON.parse(raw) : {};
    } catch {
      /* keep raw string */
    }

    if (!res.ok) {
      console.error("[resend] API error", { status: res.status, detail });
      return {
        ok: false,
        reason:
          typeof detail === "object" &&
          detail !== null &&
          "message" in detail &&
          typeof (detail as { message: unknown }).message === "string"
            ? (detail as { message: string }).message
            : `Resend returned ${res.status}`,
      };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    console.error("[resend] Failed to call Resend", message);
    return { ok: false, reason: message };
  }
}

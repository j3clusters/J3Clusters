import "server-only";

export function isPasswordEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim(),
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

type SendResult = { ok: true } | { ok: false; reason: string };

/**
 * Sends password reset email via Resend when RESEND_API_KEY and RESEND_FROM_EMAIL are set.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<SendResult> {
  if (!isPasswordEmailConfigured()) {
    return { ok: false, reason: "RESEND_API_KEY or RESEND_FROM_EMAIL is not set." };
  }

  const apiKey = process.env.RESEND_API_KEY!.trim();
  const from = process.env.RESEND_FROM_EMAIL!.trim();

  const text = [
    "You requested a password reset for your J3 Clusters account.",
    "",
    `Open this link to set a new password (expires in one hour):`,
    resetUrl,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Reset your J3 Clusters password",
        text,
        html: `<p>You requested a password reset.</p><p><a href="${escapeHtml(resetUrl)}">Set a new password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this email.</p><p style="color:#666;font-size:12px;word-break:break-all">${escapeHtml(resetUrl)}</p>`,
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
      console.error("[password-reset] Resend API error", {
        status: res.status,
        detail,
      });
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
    console.error("[password-reset] Failed to call Resend", message);
    return { ok: false, reason: message };
  }
}

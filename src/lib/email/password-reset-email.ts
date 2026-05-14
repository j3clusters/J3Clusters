import "server-only";

import { sendResendEmail, isResendConfigured } from "@/lib/email/resend-client";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

type SendResult = { ok: true } | { ok: false; reason: string };

/** True when outbound email can be sent (same Resend config as other app emails). */
export function isPasswordEmailConfigured(): boolean {
  return isResendConfigured();
}

/**
 * Sends password reset email via Resend when RESEND_API_KEY and RESEND_FROM_EMAIL are set.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<SendResult> {
  if (!isResendConfigured()) {
    return { ok: false, reason: "RESEND_API_KEY or RESEND_FROM_EMAIL is not set." };
  }

  const text = [
    "You requested a password reset for your J3 Clusters account.",
    "",
    `Open this link to set a new password (expires in one hour):`,
    resetUrl,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `<p>You requested a password reset.</p><p><a href="${escapeHtml(resetUrl)}">Set a new password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this email.</p><p style="color:#666;font-size:12px;word-break:break-all">${escapeHtml(resetUrl)}</p>`;

  return sendResendEmail({
    to,
    subject: "Reset your J3 Clusters password",
    text,
    html,
  });
}

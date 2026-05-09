import "server-only";

/**
 * Sends password reset email via Resend when RESEND_API_KEY and RESEND_FROM_EMAIL are set.
 * Returns whether the provider accepted the message.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    return false;
  }

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
      html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Set a new password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this email.</p><p style="color:#666;font-size:12px">${resetUrl}</p>`,
    }),
  });

  return res.ok;
}

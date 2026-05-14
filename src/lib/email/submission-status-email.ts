import "server-only";

import { getAppBaseUrl } from "@/lib/app-base-url";
import { isResendConfigured, sendResendEmail } from "@/lib/email/resend-client";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

export function isSubmissionEmailConfigured(): boolean {
  return isResendConfigured();
}

type SendResult = { ok: true } | { ok: false; reason: string };

export async function sendSubmissionApprovedEmail(input: {
  to: string;
  ownerName: string;
  summary: string;
  listingPath: string;
}): Promise<SendResult> {
  const base = getAppBaseUrl();
  const url = `${base}${input.listingPath.startsWith("/") ? "" : "/"}${input.listingPath}`;
  const subject = `Your property listing is live — ${input.summary}`;

  const text = [
    `Hi ${input.ownerName},`,
    "",
    `Good news: your submission "${input.summary}" has been approved and is now published on J3 Clusters.`,
    "",
    `View your listing: ${url}`,
    "",
    "You can also track submissions anytime when signed in under My properties.",
    "",
    "If you did not submit this property, please contact support.",
  ].join("\n");

  const html = `<p>Hi ${escapeHtml(input.ownerName)},</p>
<p>Good news: your submission <strong>${escapeHtml(input.summary)}</strong> has been approved and is now published on J3 Clusters.</p>
<p><a href="${escapeHtml(url)}">View your listing</a></p>
<p style="color:#666;font-size:12px;word-break:break-all">${escapeHtml(url)}</p>
<p>You can also track submissions when signed in under <strong>My properties</strong>.</p>`;

  return sendResendEmail({ to: input.to, subject, text, html });
}

export async function sendSubmissionRejectedEmail(input: {
  to: string;
  ownerName: string;
  summary: string;
}): Promise<SendResult> {
  const base = getAppBaseUrl();
  const myPropertiesUrl = `${base}/my-properties`;
  const subject = `Update on your property submission — ${input.summary}`;

  const text = [
    `Hi ${input.ownerName},`,
    "",
    `Thank you for your interest. We are not able to publish your submission "${input.summary}" at this time.`,
    "",
    `For questions, reply to this thread or use the contact options on the site. You can review status when signed in: ${myPropertiesUrl}`,
    "",
    "If you did not submit this property, you can ignore this email.",
  ].join("\n");

  const html = `<p>Hi ${escapeHtml(input.ownerName)},</p>
<p>Thank you for your interest. We are not able to publish your submission <strong>${escapeHtml(input.summary)}</strong> at this time.</p>
<p><a href="${escapeHtml(myPropertiesUrl)}">Open My properties</a></p>
<p style="color:#666;font-size:12px;word-break:break-all">${escapeHtml(myPropertiesUrl)}</p>`;

  return sendResendEmail({ to: input.to, subject, text, html });
}

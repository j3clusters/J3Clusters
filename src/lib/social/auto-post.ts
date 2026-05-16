import { createHmac } from "node:crypto";

import type { ListingPurpose, ListingType } from "@prisma/client";

import { getAppBaseUrl } from "@/lib/app-base-url";

export type ListingPublishedPayload = {
  event: "listing.published";
  listingId: string;
  submissionId: string | null;
  title: string;
  city: string;
  purpose: ListingPurpose;
  type: ListingType;
  priceInr: number;
  formattedPriceInr: string;
  listingUrl: string;
  heroImageAbsoluteUrl: string | null;
  summaryText: string;
  publishedAt: string;
  /** Only present when AUTO_POST_INCLUDE_INTERNAL_METADATA=1 (for private automations). */
  approvedByEmail?: string;
};

function envFlag(name: string): boolean {
  return process.env[name]?.trim() === "1" || process.env[name]?.toLowerCase() === "true";
}

function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function toAbsoluteMediaUrl(
  pathOrUrl: string | null | undefined,
  baseUrl: string,
): string | null {
  const raw = pathOrUrl?.trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const base = baseUrl.replace(/\/$/, "");
  const p = raw.startsWith("/") ? raw : `/${raw}`;
  return `${base}${p}`;
}

export function buildListingPublishedPayload(input: {
  listingId: string;
  submissionId: string | null;
  type: ListingType;
  city: string;
  purpose: ListingPurpose;
  price: number;
  description: string;
  imageUrl: string;
  imageUrls: string[];
  approvedAt: Date;
  approvedByEmail?: string;
}): ListingPublishedPayload {
  const base = getAppBaseUrl();
  const listingPath = `/property/${input.listingId}`;
  const listingUrl = `${base}${listingPath}`;
  const hero =
    toAbsoluteMediaUrl(
      input.imageUrls[0] ?? input.imageUrl,
      base,
    ) ?? toAbsoluteMediaUrl(input.imageUrl, base);

  const title = `${input.type} in ${input.city}`;
  const formattedPriceInr = `₹${input.price.toLocaleString("en-IN")}`;

  const payload: ListingPublishedPayload = {
    event: "listing.published",
    listingId: input.listingId,
    submissionId: input.submissionId,
    title,
    city: input.city,
    purpose: input.purpose,
    type: input.type,
    priceInr: input.price,
    formattedPriceInr,
    listingUrl,
    heroImageAbsoluteUrl: hero,
    summaryText: truncate(input.description, 480),
    publishedAt: input.approvedAt.toISOString(),
  };

  if (envFlag("AUTO_POST_INCLUDE_INTERNAL_METADATA") && input.approvedByEmail) {
    payload.approvedByEmail = input.approvedByEmail;
  }

  return payload;
}

function postStatusLine(p: ListingPublishedPayload): string {
  const purposeLabel = p.purpose === "Sale" ? "For sale" : "For rent";
  return `${purposeLabel}: ${p.type} in ${p.city} — ${p.formattedPriceInr}\n${p.listingUrl}`;
}

async function postGenericWebhook(p: ListingPublishedPayload): Promise<void> {
  const url = process.env.AUTO_POST_WEBHOOK_URL?.trim();
  if (!url) return;

  const body = JSON.stringify(p);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "user-agent": "J3Clusters-AutoPost/1.0",
  };

  const secret = process.env.AUTO_POST_WEBHOOK_SECRET?.trim();
  if (secret) {
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    headers["x-j3clusters-signature"] = `sha256=${sig}`;
  }

  const res = await fetch(url, { method: "POST", headers, body });
  if (!res.ok) {
    const snippet = await res.text().catch(() => "");
    throw new Error(`webhook ${res.status}: ${snippet.slice(0, 240)}`);
  }
}

async function postDiscordWebhook(p: ListingPublishedPayload): Promise<void> {
  const url = process.env.AUTO_POST_DISCORD_WEBHOOK_URL?.trim();
  if (!url) return;

  const embed = {
    title: p.title,
    description: truncate(`${postStatusLine(p)}\n\n${p.summaryText}`, 3800),
    url: p.listingUrl,
    color: 0x32cd32,
    timestamp: p.publishedAt,
    ...(p.heroImageAbsoluteUrl
      ? { image: { url: p.heroImageAbsoluteUrl } }
      : {}),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: "J3 Clusters",
      embeds: [embed],
    }),
  });

  if (!res.ok) {
    const snippet = await res.text().catch(() => "");
    throw new Error(`discord ${res.status}: ${snippet.slice(0, 240)}`);
  }
}

async function postSlackWebhook(p: ListingPublishedPayload): Promise<void> {
  const url = process.env.AUTO_POST_SLACK_WEBHOOK_URL?.trim();
  if (!url) return;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text: postStatusLine(p),
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${p.title}*\n${p.formattedPriceInr} · ${p.purpose}\n<_${p.listingUrl}|View listing>`,
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const snippet = await res.text().catch(() => "");
    throw new Error(`slack ${res.status}: ${snippet.slice(0, 240)}`);
  }
}

async function postTelegram(p: ListingPublishedPayload): Promise<void> {
  const token = process.env.AUTO_POST_TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.AUTO_POST_TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return;

  const text =
    `<b>${escapeHtml(p.title)}</b>\n` +
    `${escapeHtml(postStatusLine(p))}\n` +
    `\n<i>${escapeHtml(truncate(p.summaryText, 300))}</i>`;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    }),
  });

  const json = (await res.json().catch(() => null)) as
    | { ok?: boolean; description?: string }
    | null;
  if (!res.ok || !json?.ok) {
    throw new Error(
      `telegram: ${json?.description ?? res.status}`,
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function postFacebookPageFeed(p: ListingPublishedPayload): Promise<void> {
  const pageId = process.env.AUTO_POST_FACEBOOK_PAGE_ID?.trim();
  const token = process.env.AUTO_POST_FACEBOOK_PAGE_ACCESS_TOKEN?.trim();
  if (!pageId || !token) return;

  const message = truncate(postStatusLine(p), 5000);
  const params = new URLSearchParams({
    message,
    link: p.listingUrl,
    access_token: token,
  });

  const endpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(pageId)}/feed`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      // Graph accepts query or form — use POST body as form-ish via URLSearchParams in URL length limits; POST body safer
      "content-type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    id?: string;
  };
  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `facebook ${res.status}`);
  }
}

/** Fire configured channels without blocking admins on failure (logs errors). */
export async function dispatchListingPublishedAutoPost(
  payload: ListingPublishedPayload,
): Promise<void> {
  const runners: Array<[string, () => Promise<void>]> = [
    ["webhook", () => postGenericWebhook(payload)],
    ["discord", () => postDiscordWebhook(payload)],
    ["slack", () => postSlackWebhook(payload)],
    ["telegram", () => postTelegram(payload)],
    ["facebook", () => postFacebookPageFeed(payload)],
  ];

  const results = await Promise.allSettled(runners.map(([, fn]) => fn()));
  results.forEach((out, i) => {
    if (out.status === "rejected") {
      console.error("[auto-post]", runners[i][0], out.reason);
    }
  });
}

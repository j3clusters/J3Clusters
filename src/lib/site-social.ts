/**
 * Public-facing contact and optional social profile links.
 * Credentials (passwords, API secrets) must never be stored here—use OAuth or
 * provider dashboards for official integrations.
 */

import {
  buildWhatsAppUrl,
  SITE_GENERAL_WHATSAPP_MESSAGE,
} from "@/lib/site-contact";

const DEFAULT_PUBLIC_EMAIL = "j3clusters@gmail.com";
const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/j3clusters2026/";
const DEFAULT_FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=100092451301908";
const DEFAULT_YOUTUBE_URL =
  "https://www.youtube.com/channel/UCX3jPFtRTYzb6X8SgsxMWog";
/** J3Clusters on Google Maps (Chennai) — public “write a review” link. */
const DEFAULT_GOOGLE_REVIEWS_URL =
  "https://search.google.com/local/writereview?placeid=ChIJCaHaellfUjoRkAk0YwHEfns";

function safeHttpUrl(raw: string | undefined): string | null {
  const u = raw?.trim();
  if (!u) return null;
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return u;
  } catch {
    return null;
  }
}

/** Visible contact address for mailto:, social “email” chip, and footer. */
export function getSiteContactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || DEFAULT_PUBLIC_EMAIL;
}

export function buildMailtoInquiryHref(email: string): string {
  const q = new URLSearchParams({
    subject: "Inquiry via J3 Clusters website",
  });
  return `mailto:${email}?${q.toString()}`;
}

export type SocialNetworkId =
  | "instagram"
  | "facebook"
  | "whatsapp"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "google_reviews";

export type SocialNavItem = {
  id: SocialNetworkId;
  /** Accessibility + title */
  label: string;
  href: string;
};

const SOCIAL_NETWORK_ORDER: SocialNetworkId[] = [
  "instagram",
  "facebook",
  "whatsapp",
  "tiktok",
  "youtube",
  "linkedin",
  "google_reviews",
];

const SOCIAL_ENV_KEYS: Record<
  Exclude<SocialNetworkId, "whatsapp">,
  string
> = {
  instagram: "NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL",
  facebook: "NEXT_PUBLIC_SOCIAL_FACEBOOK_URL",
  tiktok: "NEXT_PUBLIC_SOCIAL_TIKTOK_URL",
  youtube: "NEXT_PUBLIC_SOCIAL_YOUTUBE_URL",
  linkedin: "NEXT_PUBLIC_SOCIAL_LINKEDIN_URL",
  google_reviews: "NEXT_PUBLIC_SOCIAL_GOOGLE_REVIEWS_URL",
};

const SOCIAL_DISPLAY_NAMES: Record<SocialNetworkId, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  google_reviews: "Google Reviews",
};

function resolveSocialHref(id: SocialNetworkId): string | null {
  if (id === "whatsapp") {
    return buildWhatsAppUrl(SITE_GENERAL_WHATSAPP_MESSAGE);
  }
  const fromEnv = safeHttpUrl(process.env[SOCIAL_ENV_KEYS[id]]);
  if (fromEnv) return fromEnv;
  if (id === "instagram") return DEFAULT_INSTAGRAM_URL;
  if (id === "facebook") return DEFAULT_FACEBOOK_URL;
  if (id === "youtube") return DEFAULT_YOUTUBE_URL;
  if (id === "google_reviews") return DEFAULT_GOOGLE_REVIEWS_URL;
  return null;
}

/** Social profile links in display order (WhatsApp always included). */
export function getSocialNavItems(): SocialNavItem[] {
  const items: SocialNavItem[] = [];

  for (const id of SOCIAL_NETWORK_ORDER) {
    const href = resolveSocialHref(id);
    if (!href) continue;
    const name = SOCIAL_DISPLAY_NAMES[id];
    items.push({
      id,
      label: `J3 Clusters on ${name} (opens in a new tab)`,
      href,
    });
  }

  return items;
}

/** All supported networks (for icon UI); includes entries without a configured URL. */
export function getSocialPlatformSlots(): Array<{
  id: SocialNetworkId;
  label: string;
  href: string | null;
}> {
  return SOCIAL_NETWORK_ORDER.map((id) => ({
    id,
    label: SOCIAL_DISPLAY_NAMES[id],
    href: resolveSocialHref(id),
  }));
}

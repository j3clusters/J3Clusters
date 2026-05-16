/**
 * Public-facing contact and optional social profile links.
 * Credentials (passwords, API secrets) must never be stored here—use OAuth or
 * provider dashboards for official integrations.
 */

const DEFAULT_PUBLIC_EMAIL = "j3clusters@gmail.com";

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
  | "email"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "x"
  | "youtube";

export type SocialNavItem = {
  id: SocialNetworkId;
  /** Accessibility + title */
  label: string;
  href: string;
};

export function getSocialNavItems(): SocialNavItem[] {
  const email = getSiteContactEmail();
  const items: SocialNavItem[] = [
    {
      id: "email",
      label: `Email ${email}`,
      href: buildMailtoInquiryHref(email),
    },
  ];

  const add = (
    id: Exclude<SocialNetworkId, "email">,
    envKey: string,
    networkName: string,
  ) => {
    const href = safeHttpUrl(process.env[envKey]);
    if (!href) return;
    items.push({
      id,
      label: `J3 Clusters on ${networkName} (opens in a new tab)`,
      href,
    });
  };

  add("instagram", "NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL", "Instagram");
  add("facebook", "NEXT_PUBLIC_SOCIAL_FACEBOOK_URL", "Facebook");
  add("linkedin", "NEXT_PUBLIC_SOCIAL_LINKEDIN_URL", "LinkedIn");
  add("x", "NEXT_PUBLIC_SOCIAL_X_URL", "X");
  add("youtube", "NEXT_PUBLIC_SOCIAL_YOUTUBE_URL", "YouTube");

  return items;
}

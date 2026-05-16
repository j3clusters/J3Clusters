import {
  getSocialNavItems,
  getSocialPlatformSlots,
  type SocialNetworkId,
} from "@/lib/site-social";

function SocialIcon({ id }: { id: SocialNetworkId }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "currentColor" as const,
    "aria-hidden": true as const,
  };

  switch (id) {
    case "instagram":
      return (
        <svg {...common}>
          <path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9A4.5 4.5 0 0 1 16.5 21h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm0 2A2.5 2.5 0 0 0 5 7.5v9A2.5 2.5 0 0 0 7.5 19h9a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 16.5 5h-9ZM12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5.25-3.25a1 1 0 1 1 1 1 1 1 0 0 1-1-1Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99h-2.54V12h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99C18.34 21.12 22 16.99 22 12Z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...common}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07Z" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M18.244 3H21.5l-7.5 8.573L22.5 21h-6.594l-5.156-6.737L4.75 21H1.5l8.063-9.218L1.5 3h6.75l4.656 6.175L18.244 3Zm-2.313 16.2h1.7L7.82 4.65H6.016l9.915 14.55Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M21.6 7.2s-.2-1.6-.9-2.3c-.8-.9-1.7-.9-2.1-1C15.6 3.5 12 3.5 12 3.5h0s-3.6 0-6.6.4c-.4 0-1.3.1-2.1 1-.7.7-.9 2.3-.9 2.3S2 9.1 2 11v1c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.8.9 1.9.9 2.4 1 1.8.2 7.5.2 7.5.2s3.6 0 6.6-.4c.4 0 1.3-.1 2.1-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8v-1c0-1.9-.2-3.8-.2-3.8ZM10 14.5v-5l5 2.5-5 2.5Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <path d="M6.5 8.5h-3V21h3V8.5Zm-1.53-4.5A1.72 1.72 0 0 0 3.3 5.7 1.71 1.71 0 0 0 5 7.4a1.7 1.7 0 0 0 1.72-1.7A1.71 1.71 0 0 0 4.97 4ZM21 21h-3v-5.8c0-1.38-.5-2.32-1.73-2.32-.94 0-1.5.64-1.75 1.25-.09.22-.11.52-.11.83V21h-3s.04-9.5 0-10.5h3v1.48a3.2 3.2 0 0 1 2.88-1.6c2.1 0 3.71 1.38 3.71 4.35V21Z" />
        </svg>
      );
    case "google_reviews":
      return (
        <svg {...common}>
          <path d="M12.48 10.92v3.28h4.92c-.2 1.16-1.56 3.4-4.92 3.4-2.96 0-5.38-2.45-5.38-5.48s2.42-5.48 5.38-5.48c1.68 0 2.81.72 3.46 1.34l2.36-2.28C16.16 2.94 14.36 2 12.48 2 6.96 2 2.5 6.44 2.5 12s4.46 10 9.98 10c5.76 0 9.56-4.04 9.56-9.74 0-.66-.07-1.16-.15-1.66h-9.41Z" />
        </svg>
      );
    default:
      return null;
  }
}

function networkShortLabel(id: SocialNetworkId): string {
  if (id === "google_reviews") return "Google Reviews";
  if (id === "linkedin") return "LinkedIn";
  if (id === "youtube") return "YouTube";
  if (id === "tiktok") return "TikTok";
  if (id === "x") return "X";
  return id.charAt(0).toUpperCase() + id.slice(1);
}

type SocialLinksProps = {
  /** Light icons on the blue footer / header strip */
  variant?: "page" | "footer" | "header";
  /** Circular icons only (no text labels) */
  iconOnly?: boolean;
  /** Show every platform; inactive ones are hidden when no URL is set */
  showAllPlatforms?: boolean;
  /** Omit platforms already shown elsewhere (e.g. WhatsApp in the header strip) */
  excludeIds?: SocialNetworkId[];
  className?: string;
};

export function SocialLinks({
  variant = "page",
  iconOnly = false,
  showAllPlatforms = false,
  excludeIds = [],
  className,
}: SocialLinksProps) {
  const slots = showAllPlatforms ? getSocialPlatformSlots() : null;
  const linkedItems = getSocialNavItems();
  const excluded = new Set(excludeIds);

  const groupClass = [
    "social-links",
    variant === "page"
      ? "social-links--page"
      : variant === "header"
        ? "social-links--header"
        : "social-links--footer",
    iconOnly ? "social-links--icons-only" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const entries = (
    showAllPlatforms
      ? slots!
          .filter((slot) => slot.href)
          .map((slot) => ({
            id: slot.id,
            label: `J3 Clusters on ${slot.label} (opens in a new tab)`,
            href: slot.href!,
          }))
      : linkedItems.map((item) => ({
          id: item.id,
          label: item.label,
          href: item.href,
        }))
  ).filter((item) => !excluded.has(item.id));

  if (entries.length === 0) {
    return null;
  }

  return (
    <nav className={groupClass} aria-label="Social media">
      <ul className="social-links-list">
        {entries.map((item) => (
          <li key={item.id}>
            <a
              className={`social-links-anchor social-links-anchor--${item.id}`}
              href={item.href!}
              aria-label={item.label}
              title={item.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="social-links-icon" aria-hidden="true">
                <SocialIcon id={item.id} />
              </span>
              {!iconOnly ? (
                <span className="social-links-text">
                  {networkShortLabel(item.id)}
                </span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

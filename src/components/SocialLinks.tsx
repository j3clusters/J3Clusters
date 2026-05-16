import {
  getSocialNavItems,
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
    case "email":
      return (
        <svg {...common}>
          <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z" />
        </svg>
      );
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
    case "linkedin":
      return (
        <svg {...common}>
          <path d="M6.5 8.5h-3V21h3V8.5Zm-1.53-4.5A1.72 1.72 0 0 0 3.3 5.7 1.71 1.71 0 0 0 5 7.4a1.7 1.7 0 0 0 1.72-1.7A1.71 1.71 0 0 0 4.97 4ZM21 21h-3v-5.8c0-1.38-.5-2.32-1.73-2.32-.94 0-1.5.64-1.75 1.25-.09.22-.11.52-.11.83V21h-3s.04-9.5 0-10.5h3v1.48a3.2 3.2 0 0 1 2.88-1.6c2.1 0 3.71 1.38 3.71 4.35V21Z" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M13.9 10.5 20.6 3h-1.6l-5.8 6.5L8.5 3H3.5l7 9.8L3.5 21h1.6l6.1-6.8 4.9 6.8h5l-7.2-10.5Zm-2.2 2.5-.7-1L5.3 4.3h2.2l4.5 6.3.7 1 5.8 8.1h-2.2l-4.7-6.6Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M21.6 7.2s-.2-1.6-.9-2.3c-.8-.9-1.7-.9-2.1-1C15.6 3.5 12 3.5 12 3.5h0s-3.6 0-6.6.4c-.4 0-1.3.1-2.1 1-.7.7-.9 2.3-.9 2.3S2 9.1 2 11v1c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.8.9 1.9.9 2.4 1 1.8.2 7.5.2 7.5.2s3.6 0 6.6-.4c.4 0 1.3-.1 2.1-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8v-1c0-1.9-.2-3.8-.2-3.8ZM10 14.5v-5l5 2.5-5 2.5Z" />
        </svg>
      );
    default:
      return null;
  }
}

function networkShortLabel(item: { id: SocialNetworkId }): string {
  if (item.id === "email") return "Email";
  if (item.id === "linkedin") return "LinkedIn";
  if (item.id === "youtube") return "YouTube";
  if (item.id === "x") return "X";
  return item.id.charAt(0).toUpperCase() + item.id.slice(1);
}

type SocialLinksProps = {
  /** Light icons on the blue footer strip */
  variant?: "page" | "footer";
  className?: string;
};

export function SocialLinks({ variant = "page", className }: SocialLinksProps) {
  const items = getSocialNavItems();
  const groupClass =
    variant === "footer"
      ? "social-links social-links--footer"
      : "social-links social-links--page";

  return (
    <nav className={`${groupClass} ${className ?? ""}`.trim()} aria-label="Social and email">
      <ul className="social-links-list">
        {items.map((item) => {
          const external = item.id !== "email";
          return (
            <li key={`${item.id}-${item.href}`}>
              <a
                className="social-links-anchor"
                href={item.href}
                aria-label={item.label}
                title={item.label}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <span className="social-links-icon" aria-hidden="true">
                  <SocialIcon id={item.id} />
                </span>
                <span className="social-links-text">
                  {networkShortLabel(item)}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

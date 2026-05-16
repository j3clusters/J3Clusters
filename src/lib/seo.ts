import type { Metadata } from "next";

import { getAppBaseUrl } from "@/lib/app-base-url";
import type { Listing } from "@/types/listing";
import { formatPrice } from "@/lib/format";

export const SITE_NAME = "J3 Clusters";

export const DEFAULT_DESCRIPTION =
  "Browse verified apartments, villas, plots, and PG rentals across India. J3 Clusters connects buyers and renters with property agents through transparent listings.";

export const SITE_KEYWORDS = [
  "property for sale India",
  "property for rent India",
  "apartments for sale",
  "villas for rent",
  "plots for sale",
  "PG accommodation",
  "verified property listings",
  "real estate marketplace India",
  "J3 Clusters",
  "Chennai properties",
  "Tamil Nadu real estate",
];

export function absoluteUrl(path: string): string {
  const base = getAppBaseUrl();
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function resolveImageUrl(image: string | undefined): string | undefined {
  const trimmed = image?.trim();
  if (!trimmed) {
    return undefined;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return absoluteUrl(trimmed.startsWith("/") ? trimmed : `/${trimmed}`);
}

type BuildPageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  ogImage,
  ogType = "website",
  noIndex = false,
}: BuildPageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const image = resolveImageUrl(ogImage) ?? absoluteUrl("/opengraph-image");

  return {
    title,
    description,
    keywords: keywords ?? SITE_KEYWORDS,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      type: ogType,
      locale: "en_IN",
      siteName: SITE_NAME,
      title: `${title} · ${SITE_NAME}`,
      description,
      url: canonical,
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
      images: [image],
    },
  };
}

export function buildListingsMetadata(options: {
  purpose: "buy" | "rent" | "all";
  city?: string;
}): Metadata {
  const { purpose, city } = options;
  const cityPart = city ? ` in ${city}` : "";

  if (purpose === "buy") {
    const path = city
      ? `/listings/buy?city=${encodeURIComponent(city)}`
      : "/listings/buy";
    return buildPageMetadata({
      title: city ? `Properties for sale${cityPart}` : "Properties for sale",
      description: city
        ? `Explore verified homes, apartments, villas, and plots for sale${cityPart}. Filter by type and budget on J3 Clusters.`
        : "Explore verified homes, apartments, villas, and plots for sale across India. Filter by city, type, and budget.",
      path,
      keywords: [
        "property for sale",
        "buy apartment",
        "buy villa",
        "plots for sale",
        ...(city ? [`property for sale ${city}`] : []),
      ],
    });
  }

  if (purpose === "rent") {
    const path = city
      ? `/listings/rent?city=${encodeURIComponent(city)}`
      : "/listings/rent";
    return buildPageMetadata({
      title: city ? `Properties for rent${cityPart}` : "Properties for rent",
      description: city
        ? `Find rental apartments, villas, and PG stays${cityPart}. Verified agent listings on J3 Clusters.`
        : "Find rental apartments, villas, and PG stays. Browse verified listings and connect with agents.",
      path,
      keywords: [
        "property for rent",
        "rent apartment",
        "PG for rent",
        ...(city ? [`property for rent ${city}`] : []),
      ],
    });
  }

  return buildPageMetadata({
    title: "Property listings",
    description:
      "Search verified properties for sale and rent. Filter by city, property type, and budget.",
    path: "/listings",
  });
}

export function buildPropertyMetadata(listing: Listing): Metadata {
  const isRent = listing.purpose === "Rent" || listing.type === "PG";
  const purposeLabel = isRent ? "for rent" : "for sale";
  const title = `${listing.title} — ${listing.type} ${purposeLabel} in ${listing.city}`;
  const priceText = formatPrice(listing.price);
  const description = [
    `${listing.type} ${purposeLabel} in ${listing.city}.`,
    `${priceText}${isRent ? " per month" : ""}.`,
    listing.areaSqft > 0 ? `${listing.areaSqft.toLocaleString("en-IN")} sq.ft.` : null,
    listing.beds > 0 ? `${listing.beds} bed` : null,
    truncateText(stripHtml(listing.description), 120),
  ]
    .filter(Boolean)
    .join(" ");

  return buildPageMetadata({
    title,
    description,
    path: `/property/${listing.id}`,
    ogImage: listing.image,
    ogType: "article",
    keywords: [
      listing.title,
      `${listing.type} ${listing.city}`,
      `property ${purposeLabel} ${listing.city}`,
      listing.city,
    ],
  });
}

function truncateText(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) {
    return clean;
  }
  return `${clean.slice(0, max - 1).trim()}…`;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "");
}

export function buildOrganizationJsonLd() {
  const base = getAppBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: base,
    logo: absoluteUrl("/opengraph-image"),
    description: DEFAULT_DESCRIPTION,
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };
}

export function buildWebSiteJsonLd() {
  const base = getAppBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: base,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/listings?city={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildListingJsonLd(listing: Listing) {
  const isRent = listing.purpose === "Rent" || listing.type === "PG";
  const images = (listing.imageUrls.length ? listing.imageUrls : [listing.image])
    .map((url) => resolveImageUrl(url))
    .filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: stripHtml(listing.description).slice(0, 500),
    url: absoluteUrl(`/property/${listing.id}`),
    image: images,
    datePosted: listing.postedAt,
    dateModified: listing.updatedAt,
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.city,
      streetAddress: listing.address || undefined,
      addressCountry: "IN",
    },
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      businessFunction: isRent
        ? "http://purl.org/goodrelations/v1#LeaseOut"
        : "http://purl.org/goodrelations/v1#Sell",
    },
    numberOfRooms: listing.beds > 0 ? listing.beds : undefined,
    floorSize:
      listing.areaSqft > 0
        ? {
            "@type": "QuantitativeValue",
            value: listing.areaSqft,
            unitCode: "FTK",
          }
        : undefined,
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  const base = getAppBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${base}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}

export function buildFaqPageJsonLd(
  faqs: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** Pages that should not appear in search indexes */
export const NOINDEX_AUTH_METADATA = buildPageMetadata({
  title: "Sign in",
  description: "Sign in to your J3 Clusters account.",
  path: "/login",
  noIndex: true,
});

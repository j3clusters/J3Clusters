export type ListingPurpose = "Sale" | "Rent";

const PURPOSE_RE = /(?:^|\n)\s*Listing Purpose:\s*(Sale|Rent)\s*$/i;

export function parseListingPurpose(
  description: string,
): ListingPurpose | null {
  const match = description.match(PURPOSE_RE);
  if (!match) {
    return null;
  }
  return match[1].toLowerCase() === "rent" ? "Rent" : "Sale";
}

export function stripListingPurpose(description: string): string {
  return description.replace(PURPOSE_RE, "").trimEnd();
}

export function withListingPurpose(
  description: string,
  purpose: ListingPurpose,
): string {
  const base = stripListingPurpose(description);
  return `${base}\n\nListing Purpose: ${purpose}`;
}

export function listingPurposeFor(listing: {
  purpose?: string | null;
  type: string;
  description: string;
}): ListingPurpose {
  if (listing.purpose === "Sale" || listing.purpose === "Rent") {
    return listing.purpose;
  }
  return (
    parseListingPurpose(listing.description) ??
    (listing.type === "PG" ? "Rent" : "Sale")
  );
}

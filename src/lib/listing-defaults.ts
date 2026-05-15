import type { Listing } from "@/types/listing";

export const LISTING_FIELD_DEFAULTS: Pick<
  Listing,
  | "purpose"
  | "address"
  | "balconies"
  | "parkingSpots"
  | "furnishing"
  | "propertyAgeYears"
  | "availableFrom"
  | "ownerName"
  | "ownerEmail"
  | "ownerPhone"
  | "ownerPhotoUrl"
  | "isFeatured"
  | "postedAt"
  | "updatedAt"
> = {
  purpose: "Sale",
  address: "",
  balconies: 0,
  parkingSpots: 0,
  furnishing: "Unfurnished",
  propertyAgeYears: 0,
  availableFrom: "",
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  ownerPhotoUrl: "",
  isFeatured: false,
  postedAt: "",
  updatedAt: "",
};

type ListingSeedInput = Omit<Listing, keyof typeof LISTING_FIELD_DEFAULTS> &
  Partial<typeof LISTING_FIELD_DEFAULTS>;

export function withListingDefaults(listing: ListingSeedInput): Listing {
  return { ...LISTING_FIELD_DEFAULTS, ...listing };
}

export type ListingType = "Apartment" | "Villa" | "Plot" | "PG";

export type ListingPurpose = "Sale" | "Rent";

export type Listing = {
  id: string;
  title: string;
  type: ListingType;
  purpose: ListingPurpose;
  city: string;
  address: string;
  beds: number;
  baths: number;
  balconies: number;
  parkingSpots: number;
  furnishing: string;
  propertyAgeYears: number;
  availableFrom: string;
  areaSqft: number;
  price: number;
  image: string;
  imageUrls: string[];
  description: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  /** Consultant / agent photo (path or URL). */
  ownerPhotoUrl: string;
  isFeatured: boolean;
  postedAt: string;
  updatedAt: string;
};

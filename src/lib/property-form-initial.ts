import type { FurnishingType, ListingPurpose, ListingType } from "@prisma/client";

import { listingPurposeFor, stripListingPurpose } from "@/lib/listing-purpose";

export type PropertyFormInitial = {
  submissionId?: string;
  listingId?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  purpose: "Sale" | "Rent";
  type: "Apartment" | "Villa" | "Plot" | "PG";
  city: string;
  address: string;
  areaSqft: number;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  parkingSpots: number;
  furnishing: "Unfurnished" | "SemiFurnished" | "Furnished";
  propertyAgeYears: number;
  availableFrom: string;
  legalClearance: boolean;
  price: number;
  description: string;
  imageUrls: string[];
  ownerPhotoUrl?: string;
};

function formatDateInput(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toISOString().slice(0, 10);
}

export function propertyFormInitialFromSubmission(submission: {
  id: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  purpose: ListingPurpose;
  type: ListingType;
  city: string;
  address: string;
  areaSqft: number;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  parkingSpots: number;
  furnishing: FurnishingType;
  propertyAgeYears: number;
  availableFrom: string;
  legalClearance: boolean;
  price: number;
  description: string;
  imageUrl: string;
  imageUrls: string[];
  ownerPhotoUrl: string;
}): PropertyFormInitial {
  return {
    submissionId: submission.id,
    ownerName: submission.ownerName,
    ownerEmail: submission.ownerEmail,
    ownerPhone: submission.ownerPhone,
    purpose: submission.purpose,
    type: submission.type,
    city: submission.city,
    address: submission.address,
    areaSqft: submission.areaSqft,
    bedrooms: submission.bedrooms,
    bathrooms: submission.bathrooms,
    balconies: submission.balconies,
    parkingSpots: submission.parkingSpots,
    furnishing: submission.furnishing,
    propertyAgeYears: submission.propertyAgeYears,
    availableFrom: formatDateInput(submission.availableFrom),
    legalClearance: submission.legalClearance,
    price: submission.price,
    description: stripListingPurpose(submission.description),
    imageUrls:
      submission.imageUrls.length > 0 ? submission.imageUrls : [submission.imageUrl],
    ownerPhotoUrl: submission.ownerPhotoUrl || undefined,
  };
}

export function propertyFormInitialFromListing(listing: {
  id: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  purpose: ListingPurpose | null;
  type: ListingType;
  city: string;
  address: string;
  areaSqft: number;
  beds: number;
  baths: number;
  balconies: number;
  parkingSpots: number;
  furnishing: FurnishingType;
  propertyAgeYears: number;
  availableFrom: string;
  legalClearance: boolean;
  price: number;
  description: string;
  image: string;
  imageUrls: string[];
  ownerPhotoUrl: string;
  sourceSubmissionId: string | null;
}): PropertyFormInitial {
  const purpose = listingPurposeFor(listing);
  return {
    submissionId: listing.sourceSubmissionId ?? undefined,
    listingId: listing.id,
    ownerName: listing.ownerName,
    ownerEmail: listing.ownerEmail,
    ownerPhone: listing.ownerPhone,
    purpose,
    type: listing.type,
    city: listing.city,
    address: listing.address,
    areaSqft: listing.areaSqft,
    bedrooms: listing.beds,
    bathrooms: listing.baths,
    balconies: listing.balconies,
    parkingSpots: listing.parkingSpots,
    furnishing: listing.furnishing,
    propertyAgeYears: listing.propertyAgeYears,
    availableFrom: formatDateInput(listing.availableFrom),
    legalClearance: listing.legalClearance,
    price: listing.price,
    description: stripListingPurpose(listing.description),
    imageUrls: listing.imageUrls.length > 0 ? listing.imageUrls : [listing.image],
    ownerPhotoUrl: listing.ownerPhotoUrl || undefined,
  };
}

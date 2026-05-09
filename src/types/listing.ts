export type ListingType = "Apartment" | "Villa" | "Plot" | "PG";

export type Listing = {
  id: string;
  title: string;
  type: ListingType;
  city: string;
  beds: number;
  baths: number;
  areaSqft: number;
  price: number;
  image: string;
  imageUrls: string[];
  description: string;
};

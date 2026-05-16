export function parsePropertySubmissionFields(formData: FormData) {
  return {
    ownerName: String(formData.get("ownerName") ?? ""),
    ownerEmail: String(formData.get("ownerEmail") ?? ""),
    ownerPhone: String(formData.get("ownerPhone") ?? ""),
    purpose: String(formData.get("purpose") ?? ""),
    type: String(formData.get("type") ?? ""),
    address: String(formData.get("address") ?? ""),
    city: String(formData.get("city") ?? ""),
    areaSqft: String(formData.get("areaSqft") ?? ""),
    bedrooms: String(formData.get("bedrooms") ?? ""),
    bathrooms: String(formData.get("bathrooms") ?? ""),
    balconies: String(formData.get("balconies") ?? ""),
    parkingSpots: String(formData.get("parkingSpots") ?? ""),
    furnishing: String(formData.get("furnishing") ?? ""),
    propertyAgeYears: String(formData.get("propertyAgeYears") ?? ""),
    availableFrom: String(formData.get("availableFrom") ?? ""),
    legalClearance: formData.get("legalClearance") === "on",
    price: String(formData.get("price") ?? ""),
    description: String(formData.get("description") ?? ""),
  };
}

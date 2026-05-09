export function listingTypeLabel(value: string): string {
  switch (value) {
    case "Apartment":
      return "Apartment";
    case "Villa":
      return "Villa";
    case "Plot":
      return "Plot";
    case "PG":
      return "PG";
    default:
      return value;
  }
}

export function furnishingLabel(value: string): string {
  switch (value) {
    case "Unfurnished":
      return "Unfurnished";
    case "SemiFurnished":
      return "Semi-furnished";
    case "Furnished":
      return "Furnished";
    default:
      return value;
  }
}

export function submissionStatusLabel(value: string): string {
  switch (value) {
    case "PENDING":
      return "Pending";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return value;
  }
}

export function submissionStatusTone(
  value: string,
): "warning" | "success" | "danger" | "neutral" {
  switch (value) {
    case "PENDING":
      return "warning";
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "danger";
    default:
      return "neutral";
  }
}

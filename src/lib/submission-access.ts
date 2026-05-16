export function submissionOwnerWhere(userId: string, userEmail: string) {
  return {
    OR: [
      { appUserId: userId },
      { ownerEmail: { equals: userEmail, mode: "insensitive" as const } },
    ],
  };
}

export function listingOwnerWhere(userEmail: string) {
  return {
    ownerEmail: { equals: userEmail, mode: "insensitive" as const },
  };
}

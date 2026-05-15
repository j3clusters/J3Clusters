import { cookies } from "next/headers";

import { USER_SESSION_COOKIE_NAME } from "@/lib/auth/jwt-cookies";
import { verifyUserJwt } from "@/lib/auth/verify-session-token";
import type { Listing } from "@/types/listing";

/** Registered community members (logged-in users) may view consultant contact details. */
export async function canViewListingContactDetails(): Promise<boolean> {
  const token = (await cookies()).get(USER_SESSION_COOKIE_NAME)?.value;
  const session = await verifyUserJwt(token);
  return Boolean(session);
}

export function redactListingContact(
  listing: Listing,
  canViewContact: boolean,
): Listing {
  return {
    ...listing,
    ownerEmail: "",
    ownerPhone: canViewContact ? listing.ownerPhone : "",
  };
}

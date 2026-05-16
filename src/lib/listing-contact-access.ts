import { cookies } from "next/headers";

import { isAccountApproved } from "@/lib/app-user-account";
import { USER_SESSION_COOKIE_NAME } from "@/lib/auth/jwt-cookies";
import { verifyUserJwt } from "@/lib/auth/verify-session-token";
import { prisma } from "@/lib/prisma";
import type { Listing } from "@/types/listing";

/** Approved, signed-in members (and approved agents) may view agent mobile on listings. */
export async function canViewListingContactDetails(): Promise<boolean> {
  const token = (await cookies()).get(USER_SESSION_COOKIE_NAME)?.value;
  const session = await verifyUserJwt(token);
  if (!session) {
    return false;
  }

  const user = await prisma.appUser.findUnique({
    where: { id: session.sub },
    select: { accountStatus: true },
  });

  return Boolean(user && isAccountApproved(user.accountStatus));
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

import { SignJWT } from "jose";

import { getAdminJwtSecretBytes, getUserJwtSecretBytes } from "@/lib/auth/jwt-secret";

/** Matches `AppUserRole` in Prisma; kept here to avoid coupling to generated client resolution. */
export type UserJwtRole = "CONSULTANT" | "MEMBER";

export async function signAdminJwt(payload: { sub: string; email: string }) {
  return await new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAdminJwtSecretBytes());
}

export async function signUserJwt(payload: {
  sub: string;
  email: string;
  role: UserJwtRole;
}) {
  return await new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getUserJwtSecretBytes());
}

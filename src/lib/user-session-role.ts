import type { VerifiedJwtAccountRole } from "@/lib/auth/jwt-verify-hs256";

export type UserJwtSession = {
  sub: string;
  email: string;
  role?: VerifiedJwtAccountRole;
};

/** Tokens issued before roles were introduced are treated as consultants. */
export function effectiveAccountRole(
  session: UserJwtSession | null,
): VerifiedJwtAccountRole | null {
  if (!session) return null;
  return session.role === "MEMBER" ? "MEMBER" : "CONSULTANT";
}

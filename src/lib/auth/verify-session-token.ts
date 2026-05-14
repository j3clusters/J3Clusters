import { getAdminJwtSecretBytes, getUserJwtSecretBytes } from "@/lib/auth/jwt-secret";
import { verifyJwtHs256Claims } from "@/lib/auth/jwt-verify-hs256";

export async function verifyAdminJwt(token: string | undefined) {
  if (!token) {
    return null;
  }
  try {
    return await verifyJwtHs256Claims(token, getAdminJwtSecretBytes());
  } catch {
    return null;
  }
}

export async function verifyUserJwt(token: string | undefined) {
  if (!token) {
    return null;
  }
  try {
    return await verifyJwtHs256Claims(token, getUserJwtSecretBytes());
  } catch {
    return null;
  }
}

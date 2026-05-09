import { SignJWT, jwtVerify } from "jose";

import { getAdminJwtSecretBytes, getUserJwtSecretBytes } from "@/lib/auth/jwt-secret";

const COOKIE_NAME = "j3_admin";
const USER_COOKIE_NAME = "j3_user";

export { COOKIE_NAME as ADMIN_SESSION_COOKIE_NAME };
export { USER_COOKIE_NAME as USER_SESSION_COOKIE_NAME };

export async function signAdminJwt(payload: { sub: string; email: string }) {
  return await new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAdminJwtSecretBytes());
}

export async function verifyAdminJwt(token: string | undefined) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getAdminJwtSecretBytes());
    const sub = typeof payload.sub === "string" ? payload.sub : null;
    const email =
      typeof payload.email === "string" ? payload.email : null;

    if (!sub || !email) {
      return null;
    }

    return { sub, email };
  } catch {
    return null;
  }
}

export async function signUserJwt(payload: { sub: string; email: string }) {
  return await new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getUserJwtSecretBytes());
}

export async function verifyUserJwt(token: string | undefined) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getUserJwtSecretBytes());
    const sub = typeof payload.sub === "string" ? payload.sub : null;
    const email =
      typeof payload.email === "string" ? payload.email : null;

    if (!sub || !email) {
      return null;
    }

    return { sub, email };
  } catch {
    return null;
  }
}

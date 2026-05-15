import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { USER_SESSION_COOKIE_NAME, verifyUserJwt } from "@/lib/auth/session";

export async function requireUser(options?: { redirect?: string }) {
  const token = (await cookies()).get(USER_SESSION_COOKIE_NAME)?.value;
  const session = await verifyUserJwt(token);
  if (!session) {
    redirect(options?.redirect ?? "/login");
  }
  return session;
}

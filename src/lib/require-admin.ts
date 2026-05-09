import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminJwt,
} from "@/lib/auth/session";

export async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const session = await verifyAdminJwt(token);
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { isConsultantApproved } from "@/lib/app-user-account";
import { USER_SESSION_COOKIE_NAME, verifyUserJwt } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { effectiveAccountRole } from "@/lib/user-session-role";

export async function requireUser(options?: { redirect?: string }) {
  const token = (await cookies()).get(USER_SESSION_COOKIE_NAME)?.value;
  const session = await verifyUserJwt(token);
  if (!session) {
    redirect(options?.redirect ?? "/login");
  }
  return session;
}

export async function requireConsultant() {
  const session = await requireUser();
  if (effectiveAccountRole(session) !== "CONSULTANT") {
    redirect("/community/member");
  }

  const user = await prisma.appUser.findUnique({
    where: { id: session.sub },
    select: { accountStatus: true },
  });

  if (!user || !isConsultantApproved(user.accountStatus)) {
    redirect("/login?pending=consultant");
  }

  return session;
}

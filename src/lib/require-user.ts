import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppUserRole } from "@prisma/client";

import { isConsultantApproved } from "@/lib/app-user-account";
import { USER_SESSION_COOKIE_NAME, verifyUserJwt } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function requireUser(options?: { redirect?: string }) {
  const token = (await cookies()).get(USER_SESSION_COOKIE_NAME)?.value;
  const session = await verifyUserJwt(token);
  if (!session) {
    redirect(options?.redirect ?? "/login");
  }
  return session;
}

/** Current account from the database (JWT role can be stale after admin updates). */
export async function requireAppUser(session: { sub: string }) {
  const user = await prisma.appUser.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      role: true,
      accountStatus: true,
      name: true,
      phone: true,
      city: true,
    },
  });
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireConsultant() {
  const session = await requireUser();
  const user = await requireAppUser(session);

  if (user.role !== AppUserRole.CONSULTANT) {
    redirect("/community/member");
  }

  if (!isConsultantApproved(user.accountStatus)) {
    redirect("/login?pending=consultant");
  }

  return { session, user };
}

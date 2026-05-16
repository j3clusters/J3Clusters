import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { accountStatusForNewUser } from "@/lib/app-user-account";
import {
  USER_SESSION_COOKIE_NAME,
  signUserJwt,
} from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { registrationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, email, phone, city, password, accountRole } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();
  const accountStatus = accountStatusForNewUser(accountRole);
  const requiresApproval = accountRole === "CONSULTANT";

  let user: { id: string; email: string; role: "CONSULTANT" | "MEMBER" };
  try {
    const existing = await prisma.appUser.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user = await prisma.appUser.create({
      data: {
        name,
        email: normalizedEmail,
        phone,
        city,
        passwordHash,
        role: accountRole,
        accountStatus,
        authProvider: "email",
      },
      select: { id: true, email: true, role: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 409 },
      );
    }
    console.error("[register] Database error:", error);
    return NextResponse.json(
      { error: "Unable to complete registration. Please try again later." },
      { status: 500 },
    );
  }

  if (requiresApproval) {
    return NextResponse.json({
      ok: true,
      pendingApproval: true,
      accountRole: user.role,
    });
  }

  let token: string;
  try {
    token = await signUserJwt({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  } catch {
    await prisma.appUser.delete({ where: { id: user.id } }).catch(() => {});
    return NextResponse.json(
      {
        error:
          "Server misconfigured: set USER_JWT_SECRET or ADMIN_JWT_SECRET (32+ chars) in your environment.",
      },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ ok: true, accountRole: user.role });
  response.cookies.set(USER_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

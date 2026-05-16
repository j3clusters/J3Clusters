import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import {
  canSignInWithPassword,
  loginBlockedMessage,
} from "@/lib/app-user-account";
import { requireTurnstileForLogin } from "@/lib/auth/turnstile";
import {
  signUserJwt,
  USER_SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const captchaFailure = await requireTurnstileForLogin(request, body);
    if (captchaFailure) {
      return captchaFailure;
    }

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const user = await prisma.appUser.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        accountStatus: true,
        authProvider: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    if (!canSignInWithPassword(user)) {
      return NextResponse.json(
        {
          error:
            "This account uses social sign-in. Continue with Google or Facebook on the member login page.",
        },
        { status: 401 },
      );
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash!);
    if (!passwordOk) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const blocked = loginBlockedMessage(user.accountStatus, user.role);
    if (blocked) {
      return NextResponse.json({ error: blocked }, { status: 403 });
    }

    let token: string;
    try {
      token = await signUserJwt({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
    } catch {
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
  } catch (err) {
    console.error("[user-login]", err);
    const message =
      err instanceof Error &&
      (err.message.includes("accountStatus") ||
        err.message.includes("Authentication failed") ||
        err.message.includes("connect"))
        ? "Login is temporarily unavailable. The database needs to be updated — run npm run db:sync, then try again."
        : "Login failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

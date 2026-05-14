import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import {
  signUserJwt,
  USER_SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
    });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    let token: string;
    try {
      token = await signUserJwt({ sub: user.id, email: user.email });
    } catch {
      return NextResponse.json(
        {
          error:
            "Server misconfigured: set USER_JWT_SECRET or ADMIN_JWT_SECRET (32+ chars) in your environment.",
        },
        { status: 503 },
      );
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(USER_SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}

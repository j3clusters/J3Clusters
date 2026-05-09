import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE_NAME,
  signAdminJwt,
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
        { status: 400 }
      );
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    let token: string;
    try {
      token = await signAdminJwt({ sub: user.id, email: user.email });
    } catch {
      return NextResponse.json(
        {
          error:
            "Server misconfigured: set ADMIN_JWT_SECRET (32+ chars) in your environment.",
        },
        { status: 503 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, {
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

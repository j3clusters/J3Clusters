import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

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

  const { name, email, phone, city, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

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
  const user = await prisma.appUser.create({
    data: {
      name,
      email: normalizedEmail,
      phone,
      city,
      passwordHash,
    },
  });

  const token = await signUserJwt({ sub: user.id, email: user.email });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(USER_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

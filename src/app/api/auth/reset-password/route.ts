import { createHash } from "node:crypto";

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { passwordResetConfirmSchema } from "@/lib/validators";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = passwordResetConfirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { token, password } = parsed.data;
  const tokenHash = createHash("sha256").update(token).digest("hex");

  try {
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true } } },
    });

    if (
      !record ||
      record.usedAt != null ||
      record.expiresAt.getTime() < Date.now()
    ) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Request a new one." },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.appUser.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    return NextResponse.json({ ok: true, message: "Your password has been updated." });
  } catch {
    return NextResponse.json({ error: "Could not reset password." }, { status: 500 });
  }
}

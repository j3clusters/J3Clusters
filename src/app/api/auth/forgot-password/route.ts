import { createHash, randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { getAppBaseUrl } from "@/lib/app-base-url";
import { prisma } from "@/lib/prisma";
import {
  isPasswordEmailConfigured,
  sendPasswordResetEmail,
} from "@/lib/password-reset-email";
import { passwordResetRequestSchema } from "@/lib/validators";

const GENERIC_MESSAGE =
  "If an account exists for this email, you will receive password recovery instructions shortly.";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = passwordResetRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();

  try {
    if (process.env.NODE_ENV === "production" && !isPasswordEmailConfigured()) {
      await delay(350);
      return NextResponse.json(
        {
          error:
            "Password recovery email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL on the server, then try again.",
        },
        { status: 503 },
      );
    }

    const user = await prisma.appUser.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    const emailConfigured = isPasswordEmailConfigured();
    let setupHint: string | undefined;

    if (!emailConfigured && process.env.NODE_ENV !== "production") {
      setupHint =
        "Email is not configured (add RESEND_API_KEY and RESEND_FROM_EMAIL to .env.local). For a registered account, the reset link is also printed in the terminal where the dev server runs.";
    }

    if (user) {
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

      const rawToken = randomBytes(32).toString("base64url");
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: { tokenHash, userId: user.id, expiresAt },
      });

      const resetUrl = `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;
      const sendResult = await sendPasswordResetEmail(user.email, resetUrl);

      if (!sendResult.ok) {
        if (process.env.NODE_ENV !== "production") {
          console.info(
            `[password-reset] ${sendResult.reason} Recovery link for ${user.email}: ${resetUrl}`,
          );
        } else {
          await prisma.passwordResetToken.delete({ where: { tokenHash } });
          console.error("[password-reset] Email not sent:", sendResult.reason);
        }
      }
    }

    await delay(350);
    return NextResponse.json({
      ok: true,
      message: GENERIC_MESSAGE,
      ...(setupHint ? { setupHint } : {}),
    });
  } catch {
    await delay(350);
    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  }
}

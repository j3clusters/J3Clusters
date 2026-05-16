import "server-only";

import { NextResponse } from "next/server";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileServerConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim(),
  );
}

export function extractTurnstileToken(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  const record = body as { turnstileToken?: unknown };
  const token = record.turnstileToken;
  return typeof token === "string" && token.trim() ? token.trim() : null;
}

export function clientIpFromRequest(request: Request): string | undefined {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) {
    return cf;
  }
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) {
    return undefined;
  }
  return forwarded.split(",")[0]?.trim() || undefined;
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    return true;
  }

  const params = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteIp) {
    params.set("remoteip", remoteIp);
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      cache: "no-store",
    });
    const payload = (await response.json()) as { success?: boolean };
    return payload.success === true;
  } catch {
    return false;
  }
}

/** Returns an error response when CAPTCHA is required but missing/invalid; null if OK. */
export async function requireTurnstileForLogin(
  request: Request,
  body: unknown,
): Promise<NextResponse | null> {
  if (!isTurnstileServerConfigured()) {
    return null;
  }

  const token = extractTurnstileToken(body);
  if (!token) {
    return NextResponse.json(
      { error: "Complete the security check before signing in." },
      { status: 400 },
    );
  }

  const valid = await verifyTurnstileToken(token, clientIpFromRequest(request));
  if (!valid) {
    return NextResponse.json(
      { error: "Security verification failed. Please try again." },
      { status: 403 },
    );
  }

  return null;
}

export async function requireTurnstileQueryParam(
  request: Request,
  token: string | null,
  errorReturnPath = "/login",
): Promise<NextResponse | null> {
  if (!isTurnstileServerConfigured()) {
    return null;
  }

  const returnTo = errorReturnPath.startsWith("/")
    ? errorReturnPath
    : "/login";

  if (!token?.trim()) {
    return NextResponse.redirect(
      new URL(
        `${returnTo}?oauth_error=Complete+the+security+check+before+signing+in`,
        request.url,
      ),
    );
  }

  const valid = await verifyTurnstileToken(
    token.trim(),
    clientIpFromRequest(request),
  );
  if (!valid) {
    return NextResponse.redirect(
      new URL(
        `${returnTo}?oauth_error=Security+verification+failed.+Please+try+again`,
        request.url,
      ),
    );
  }

  return null;
}

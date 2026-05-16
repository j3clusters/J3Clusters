import { createHash, randomBytes } from "crypto";

export type OAuthState = {
  nonce: string;
  next: string;
  errorPath?: string;
};

export function createOAuthState(next: string, errorPath?: string): OAuthState {
  return {
    nonce: randomBytes(24).toString("hex"),
    next,
    ...(errorPath ? { errorPath } : {}),
  };
}

export function encodeOAuthState(state: OAuthState): string {
  return Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
}

export function decodeOAuthState(raw: string): OAuthState | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as OAuthState;
    if (typeof parsed.nonce !== "string" || typeof parsed.next !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function oauthStateCookieName() {
  return "j3_oauth_state";
}

export function hashOAuthNonce(nonce: string): string {
  return createHash("sha256").update(nonce).digest("hex");
}

export function parseCookie(header: string, name: string): string | null {
  const parts = header.split(";").map((part) => part.trim());
  const prefix = `${name}=`;
  const match = parts.find((part) => part.startsWith(prefix));
  if (!match) {
    return null;
  }
  return decodeURIComponent(match.slice(prefix.length));
}

export function readOAuthStateFromRequest(
  request: Request,
  stateRaw: string | null,
): OAuthState | null {
  if (!stateRaw) {
    return null;
  }
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }
  const state = decodeOAuthState(stateRaw);
  const storedPayload = parseCookie(cookieHeader, `${oauthStateCookieName()}_payload`);
  const storedNonceHash = parseCookie(cookieHeader, oauthStateCookieName());
  if (!state || !storedPayload || stateRaw !== storedPayload) {
    return null;
  }
  if (!storedNonceHash || storedNonceHash !== hashOAuthNonce(state.nonce)) {
    return null;
  }
  return state;
}

export function setOAuthStateCookies(
  response: { cookies: { set: (name: string, value: string, options: object) => void } },
  state: OAuthState,
) {
  response.cookies.set(oauthStateCookieName(), hashOAuthNonce(state.nonce), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
    secure: process.env.NODE_ENV === "production",
  });
  response.cookies.set(`${oauthStateCookieName()}_payload`, encodeOAuthState(state), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearOAuthStateCookies(response: {
  cookies: { set: (name: string, value: string, options: object) => void };
}) {
  response.cookies.set(oauthStateCookieName(), "", { path: "/", maxAge: 0 });
  response.cookies.set(`${oauthStateCookieName()}_payload`, "", {
    path: "/",
    maxAge: 0,
  });
}

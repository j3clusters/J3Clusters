import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  accountStatusForOAuthMember,
  loginBlockedMessage,
} from "@/lib/app-user-account";
import { clearOAuthStateCookies, type OAuthState } from "@/lib/auth/oauth-state";
import {
  signUserJwt,
  USER_SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  memberRedirectAfterLogin,
  oauthErrorReturnPath,
} from "@/lib/safe-next-path";

export type MemberOAuthProvider = "google" | "facebook";

export type MemberOAuthProfile = {
  provider: MemberOAuthProvider;
  providerId: string;
  email: string;
  name?: string;
};

function providerIdWhere(profile: MemberOAuthProfile) {
  if (profile.provider === "google") {
    return { googleId: profile.providerId };
  }
  return { facebookId: profile.providerId };
}

export function redirectOAuthError(
  request: Request,
  message: string,
  path?: string,
  state?: { errorPath?: string },
) {
  const targetPath = path ?? oauthErrorReturnPath(state?.errorPath);
  const target = new URL(targetPath, request.url);
  target.searchParams.set("oauth_error", message);
  return NextResponse.redirect(target);
}

export async function completeMemberOAuthSignIn(
  request: Request,
  profile: MemberOAuthProfile,
  state: OAuthState,
): Promise<NextResponse> {
  const normalizedEmail = profile.email.trim().toLowerCase();
  const displayName =
    profile.name?.trim() || normalizedEmail.split("@")[0] || "Member";

  let user = await prisma.appUser.findFirst({
    where: {
      OR: [providerIdWhere(profile), { email: normalizedEmail }],
    },
    select: {
      id: true,
      email: true,
      role: true,
      accountStatus: true,
      googleId: true,
      facebookId: true,
      authProvider: true,
    },
  });

  if (user && user.role === "CONSULTANT") {
    const blocked = loginBlockedMessage(user.accountStatus, user.role);
    return redirectOAuthError(
      request,
      blocked ??
        "Property agents must register with email and await admin approval.",
      "/register/consultant",
    );
  }

  if (!user) {
    const createData =
      profile.provider === "google"
        ? {
            name: displayName,
            email: normalizedEmail,
            phone: "",
            city: "",
            role: "MEMBER" as const,
            accountStatus: accountStatusForOAuthMember(),
            authProvider: "google",
            googleId: profile.providerId,
            passwordHash: null,
          }
        : {
            name: displayName,
            email: normalizedEmail,
            phone: "",
            city: "",
            role: "MEMBER" as const,
            accountStatus: accountStatusForOAuthMember(),
            authProvider: "facebook",
            facebookId: profile.providerId,
            passwordHash: null,
          };

    try {
      user = await prisma.appUser.create({
        data: createData,
        select: {
          id: true,
          email: true,
          role: true,
          accountStatus: true,
          googleId: true,
          facebookId: true,
          authProvider: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        user = await prisma.appUser.findUnique({
          where: { email: normalizedEmail },
          select: {
            id: true,
            email: true,
            role: true,
            accountStatus: true,
            googleId: true,
            facebookId: true,
            authProvider: true,
          },
        });
      } else {
        return redirectOAuthError(
          request,
          "Could not create your account.",
          undefined,
          state,
        );
      }
    }
  }

  if (!user || user.role !== "MEMBER") {
    const label = profile.provider === "google" ? "Google" : "Facebook";
    return redirectOAuthError(
      request,
      `Unable to sign in with this ${label} account.`,
      undefined,
      state,
    );
  }

  const blocked = loginBlockedMessage(user.accountStatus, user.role);
  if (blocked) {
    return redirectOAuthError(request, blocked, undefined, state);
  }

  const linkData =
    profile.provider === "google" && !user.googleId
      ? { googleId: profile.providerId, authProvider: user.authProvider ?? "google" }
      : profile.provider === "facebook" && !user.facebookId
        ? {
            facebookId: profile.providerId,
            authProvider: user.authProvider ?? "facebook",
          }
        : null;

  if (linkData) {
    await prisma.appUser.update({
      where: { id: user.id },
      data: linkData,
    });
  }

  let token: string;
  try {
    token = await signUserJwt({
      sub: user.id,
      email: user.email,
      role: "MEMBER",
    });
  } catch {
    return redirectOAuthError(
      request,
      "Server sign-in configuration error.",
      undefined,
      state,
    );
  }

  const destination = memberRedirectAfterLogin(state.next);
  const response = NextResponse.redirect(new URL(destination, request.url));
  clearOAuthStateCookies(response);
  response.cookies.set(USER_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

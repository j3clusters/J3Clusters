import type { AppUserAccountStatus, AppUserRole } from "@prisma/client";

/** Email/password registration — agents and email-based members await admin approval. */
export function accountStatusForNewUser(role: AppUserRole): AppUserAccountStatus {
  return role === "CONSULTANT" || role === "MEMBER" ? "PENDING" : "APPROVED";
}

/** Google/Facebook sign-in — verified identity, immediate member access. */
export function accountStatusForOAuthMember(): AppUserAccountStatus {
  return "APPROVED";
}

export function isAccountApproved(status: AppUserAccountStatus): boolean {
  return status === "APPROVED";
}

export function canSignInWithPassword(user: {
  passwordHash: string | null;
  authProvider: string | null;
}): boolean {
  return Boolean(user.passwordHash);
}

export function loginBlockedMessage(
  status: AppUserAccountStatus,
  role: AppUserRole,
): string | null {
  if (status === "PENDING") {
    if (role === "MEMBER") {
      return "Your community member registration is awaiting admin approval. Sign in after approval to view agent mobile numbers.";
    }
    return "Your property agent account is awaiting admin approval. You will be able to sign in after approval.";
  }
  if (status === "REJECTED") {
    if (role === "MEMBER") {
      return "Your community member registration was not approved. Please contact support if you have questions.";
    }
    return "Your agent registration was not approved. Please contact support if you have questions.";
  }
  return null;
}

/** @deprecated Use isAccountApproved */
export function isConsultantApproved(status: AppUserAccountStatus): boolean {
  return isAccountApproved(status);
}

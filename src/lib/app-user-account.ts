import type { AppUserAccountStatus, AppUserRole } from "@prisma/client";

export function accountStatusForNewUser(role: AppUserRole): AppUserAccountStatus {
  return role === "CONSULTANT" ? "PENDING" : "APPROVED";
}

export function canSignInWithPassword(user: {
  passwordHash: string | null;
  authProvider: string | null;
}): boolean {
  return Boolean(user.passwordHash);
}

export function loginBlockedMessage(status: AppUserAccountStatus): string | null {
  if (status === "PENDING") {
    return "Your property consultant account is awaiting admin approval. You will be able to sign in after approval.";
  }
  if (status === "REJECTED") {
    return "Your consultant registration was not approved. Please contact support if you have questions.";
  }
  return null;
}

export function isConsultantApproved(status: AppUserAccountStatus): boolean {
  return status === "APPROVED";
}

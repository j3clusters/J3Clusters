import { Suspense } from "react";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/ResetPasswordForm";

function ResetFallback() {
  return (
    <main className="portal-auth-page">
      <div className="portal-auth-card">
        <p className="portal-auth-sub">Loading…</p>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetFallback />}>
      <main className="portal-auth-page">
        <div className="portal-auth-card">
          <div className="portal-auth-header">
            <span className="portal-auth-badge">Owner</span>
            <h1>Set a new password</h1>
            <p className="portal-auth-sub">
              Choose a strong password you have not used elsewhere.
            </p>
          </div>
          <ResetPasswordForm />
          <p className="portal-auth-alt portal-auth-forgot">
            <span className="portal-auth-forgot-hint">Wrong place?</span>
            <Link href="/login">Sign in</Link>
          </p>
        </div>
      </main>
    </Suspense>
  );
}

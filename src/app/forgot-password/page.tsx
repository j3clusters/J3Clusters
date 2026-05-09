import Link from "next/link";

import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="portal-auth-page">
      <div className="portal-auth-card">
        <div className="portal-auth-header">
          <span className="portal-auth-badge">Owner</span>
          <h1>Password recovery</h1>
          <p className="portal-auth-sub">
            Enter the email you used to register. We will send you a link to reset
            your password.
          </p>
        </div>
        <ForgotPasswordForm />
        <p className="portal-auth-alt">
          Remember your password? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="portal-auth-page">
      <div className="portal-auth-card">
        <div className="portal-auth-header">
          <span className="portal-auth-badge">Owner</span>
          <h1>Register to post for free</h1>
          <p className="portal-auth-sub">
            Create your account to list apartments, villas, or plots. No listing
            fees.
          </p>
        </div>
        <RegisterForm />
        <div className="portal-auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </main>
  );
}

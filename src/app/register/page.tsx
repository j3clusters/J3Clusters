import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import { CONSULTANT } from "@/lib/consultant-labels";

export default function RegisterPage() {
  return (
    <main className="portal-auth-page">
      <div className="portal-auth-card">
        <header className="portal-auth-header">
          <span className="portal-auth-badge">{CONSULTANT.registerBadge}</span>
          <h1>{CONSULTANT.registerTitle}</h1>
          <p className="portal-auth-sub">{CONSULTANT.registerSub}</p>
        </header>
        <RegisterForm />
        <footer className="portal-auth-footer">
          Already registered? <Link href="/login">Sign in</Link>
        </footer>
      </div>
    </main>
  );
}

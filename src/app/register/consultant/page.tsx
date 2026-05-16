import Link from "next/link";

import { RegisterForm } from "@/components/RegisterForm";
import { CONSULTANT } from "@/lib/consultant-labels";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Register as property consultant",
  description: CONSULTANT.registerSub,
  path: "/register/consultant",
});

export default function RegisterConsultantPage() {
  return (
    <main className="portal-auth-page">
      <div className="portal-auth-card">
        <header className="portal-auth-header">
          <span className="portal-auth-badge">{CONSULTANT.registerBadge}</span>
          <h1>{CONSULTANT.registerTitle}</h1>
          <p className="portal-auth-sub">{CONSULTANT.registerSub}</p>
        </header>
        <RegisterForm accountRole="CONSULTANT" successRedirect="/post-property" />
        <footer className="portal-auth-footer">
          Not listing properties?{" "}
          <Link href="/register/member">Register as a community member</Link>
          <p className="portal-auth-alt">
            <Link href="/register">All registration options</Link>
            {" · "}
            <Link href="/login">Sign in</Link>
          </p>
        </footer>
      </div>
    </main>
  );
}

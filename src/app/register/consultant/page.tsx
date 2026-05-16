import Link from "next/link";

import { RegisterForm } from "@/components/RegisterForm";
import { COMMUNITY_MEMBER, CONSULTANT } from "@/lib/consultant-labels";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Register as property agent",
  description: `${CONSULTANT.registerSub} Approval is required before you can sign in.`,
  path: "/register/consultant",
});

const APPROVAL_STEPS = [
  { title: "Submit registration", detail: "Complete the form below" },
  { title: "Admin review", detail: "We verify your application" },
  { title: "Sign in & post", detail: "After approval, list properties" },
] as const;

export default function RegisterConsultantPage() {
  return (
    <main className="portal-auth-page">
      <div className="portal-auth-card portal-auth-card--register">
        <header className="portal-auth-header">
          <span className="portal-auth-badge">{CONSULTANT.registerBadge}</span>
          <h1>{CONSULTANT.registerTitle}</h1>
          <p className="portal-auth-sub">{CONSULTANT.registerSub}</p>
          <ol className="portal-auth-register-steps" aria-label="Registration process">
            {APPROVAL_STEPS.map((step, index) => (
              <li key={step.title}>
                <span className="portal-auth-register-steps-num">{index + 1}</span>
                <span>
                  <strong>{step.title}</strong>
                  <span>{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </header>
        <RegisterForm accountRole="CONSULTANT" successRedirect="/post-property" />
        <footer className="portal-auth-footer">
          <p className="portal-auth-footer-lead">Already have an account?</p>
          <Link href="/login" className="portal-auth-register-link portal-auth-register-link--solo">
            Sign in
          </Link>
          <p className="portal-auth-alt portal-auth-staff">
            Browsing only?{" "}
            <Link href="/register/member">{COMMUNITY_MEMBER.joinLink}</Link>
            {" · "}
            <Link href="/register">All options</Link>
          </p>
        </footer>
      </div>
    </main>
  );
}

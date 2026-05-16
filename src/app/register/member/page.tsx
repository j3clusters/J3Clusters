import Link from "next/link";
import { Suspense } from "react";

import { MemberSocialAuth } from "@/components/MemberSocialAuth";
import { RegisterForm } from "@/components/RegisterForm";
import { COMMUNITY_MEMBER, CONSULTANT } from "@/lib/consultant-labels";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Register as community member",
  description: COMMUNITY_MEMBER.registerSub,
  path: "/register/member",
});

export default function RegisterMemberPage() {
  return (
    <main className="portal-auth-page">
      <div className="portal-auth-card">
        <header className="portal-auth-header">
          <span className="portal-auth-badge">{COMMUNITY_MEMBER.badge}</span>
          <h1>{COMMUNITY_MEMBER.registerTitle}</h1>
          <p className="portal-auth-sub">{COMMUNITY_MEMBER.registerSub}</p>
        </header>
        <Suspense fallback={null}>
          <MemberSocialAuth mode="register" />
        </Suspense>
        <p className="portal-auth-divider">
          <span>Or register with email</span>
        </p>
        <RegisterForm accountRole="MEMBER" successRedirect="/listings/buy" />
        <footer className="portal-auth-footer">
          Want to publish listings instead?{" "}
          <Link href="/register/consultant">Register as a {CONSULTANT.role.toLowerCase()}</Link>
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

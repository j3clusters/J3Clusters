import Link from "next/link";

import { COMMUNITY_MEMBER, CONSULTANT } from "@/lib/consultant-labels";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Create an account",
  description:
    "Register as a property agent to list homes after admin approval, or join as a community member to view agent mobile numbers after sign-in.",
  path: "/register",
});

export default function RegisterHubPage() {
  return (
    <main className="community-page">
      <div className="container">
        <header className="community-page-hero">
          <p className="pill">Join J3 Clusters</p>
          <h1>Choose how you want to participate</h1>
          <p className="community-page-lead">
            Agents list and manage properties. Community members unlock
            agent contact details while they search.
          </p>
        </header>

        <div className="register-hub-grid">
          <section className="register-hub-card">
            <span className="portal-auth-badge">{CONSULTANT.registerBadge}</span>
            <h2>{CONSULTANT.registerTitle}</h2>
            <p className="register-hub-desc">{CONSULTANT.registerSub}</p>
            <div className="register-hub-actions">
              <Link href="/register/consultant" className="primary-nav-cta">
                Register as agent
              </Link>
            </div>
          </section>

          <section className="register-hub-card">
            <span className="portal-auth-badge">{COMMUNITY_MEMBER.badge}</span>
            <h2>{COMMUNITY_MEMBER.registerTitle}</h2>
            <p className="register-hub-desc">{COMMUNITY_MEMBER.registerSub}</p>
            <div className="register-hub-actions">
              <Link href="/register/member" className="primary-nav-cta">
                Join with Google or Facebook
              </Link>
              <Link href="/community/member">About the member community</Link>
            </div>
          </section>
        </div>

        <p className="register-hub-foot">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";

import {
  COMMUNITY_MEMBER,
  CONSULTANT,
  CONSULTANT_COMMUNITY,
} from "@/lib/consultant-labels";

export default function RegisterHubPage() {
  return (
    <main className="community-page">
      <div className="container">
        <header className="community-page-hero">
          <p className="pill">Join J3 Clusters</p>
          <h1>Choose how you want to participate</h1>
          <p className="community-page-lead">
            Consultants list and manage properties. Community members unlock
            consultant contact details while they search.
          </p>
        </header>

        <div className="register-hub-grid">
          <section className="register-hub-card">
            <span className="portal-auth-badge">{CONSULTANT.registerBadge}</span>
            <h2>{CONSULTANT.registerTitle}</h2>
            <p className="register-hub-desc">{CONSULTANT.registerSub}</p>
            <div className="register-hub-actions">
              <Link href="/register/consultant" className="primary-nav-cta">
                Register as consultant
              </Link>
              <Link href="/community/consultant">About the consultant community</Link>
            </div>
          </section>

          <section className="register-hub-card">
            <span className="portal-auth-badge">{COMMUNITY_MEMBER.badge}</span>
            <h2>{COMMUNITY_MEMBER.registerTitle}</h2>
            <p className="register-hub-desc">{COMMUNITY_MEMBER.registerSub}</p>
            <div className="register-hub-actions">
              <Link href="/register/member" className="primary-nav-cta">
                Register as member
              </Link>
              <Link href="/community/member">About the member community</Link>
            </div>
          </section>
        </div>

        <p className="register-hub-foot">
          Already have an account? <Link href="/login">Sign in</Link>
          <span className="register-hub-foot-sep" aria-hidden="true">
            ·
          </span>
          <Link href="/community/consultant">{CONSULTANT_COMMUNITY.title}</Link>
        </p>
      </div>
    </main>
  );
}

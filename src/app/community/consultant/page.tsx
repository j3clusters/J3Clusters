import Link from "next/link";

import {
  COMMUNITY_MEMBER,
  CONSULTANT,
  CONSULTANT_COMMUNITY,
} from "@/lib/consultant-labels";

export default function ConsultantCommunityPage() {
  return (
    <main className="community-page">
      <div className="container community-page-inner">
        <header className="community-page-hero">
          <p className="pill">{CONSULTANT.registerBadge}</p>
          <h1>{CONSULTANT_COMMUNITY.title}</h1>
          <p className="community-page-lead">{CONSULTANT_COMMUNITY.sub}</p>
        </header>

        <ul className="community-page-points">
          <li>Submit verified sale and rental listings with photos and structured details.</li>
          <li>Track approvals and edits from your <strong>My properties</strong> page after sign-in.</li>
          <li>Your verified contact stays attached to listings buyers and renters trust.</li>
        </ul>

        <div className="community-page-actions">
          <Link href="/register/consultant" className="primary-nav-cta">
            {CONSULTANT.registerTitle}
          </Link>
          <Link href="/login">Already registered? Sign in</Link>
        </div>

        <p className="community-page-crosslink">
          Browsing only?{" "}
          <Link href="/community/member">{COMMUNITY_MEMBER.hubTitle}</Link> explains the free
          member experience.
        </p>
      </div>
    </main>
  );
}

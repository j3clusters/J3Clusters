import Link from "next/link";

import {
  COMMUNITY_MEMBER,
  CONSULTANT,
} from "@/lib/consultant-labels";

export default function MemberCommunityPage() {
  return (
    <main className="community-page">
      <div className="container community-page-inner">
        <header className="community-page-hero">
          <p className="pill">{COMMUNITY_MEMBER.badge}</p>
          <h1>{COMMUNITY_MEMBER.hubTitle}</h1>
          <p className="community-page-lead">{COMMUNITY_MEMBER.hubSub}</p>
        </header>

        <ul className="community-page-points">
          <li>Reveal property consultant phone numbers on published listings after you sign in.</li>
          <li>Keep one account for both buying and renting across the marketplace.</li>
          <li>Listing and verification tools stay reserved for {CONSULTANT.rolePlural.toLowerCase()}.</li>
        </ul>

        <div className="community-page-actions">
          <Link href="/register/member" className="primary-nav-cta">
            {COMMUNITY_MEMBER.registerTitle}
          </Link>
          <Link href="/login">Already registered? Sign in</Link>
        </div>

        <p className="community-page-crosslink">
          Ready to list properties?{" "}
          <Link href="/register/consultant">Register as a property consultant</Link>.
        </p>
      </div>
    </main>
  );
}

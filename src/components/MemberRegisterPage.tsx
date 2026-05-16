"use client";

import Link from "next/link";
import { Suspense, useId, useState } from "react";

import { MemberSocialAuth } from "@/components/MemberSocialAuth";
import { RegisterForm } from "@/components/RegisterForm";
import { COMMUNITY_MEMBER, CONSULTANT } from "@/lib/consultant-labels";
import type { MemberOAuthAvailability } from "@/lib/auth/member-oauth-availability";

type MemberRegisterPageProps = {
  oauth: MemberOAuthAvailability;
};

function MemberSocialFallback() {
  return (
    <div className="member-social-connect member-social-connect--loading" aria-hidden="true">
      <span className="member-social-tile member-social-tile--skeleton" />
      <span className="member-social-tile member-social-tile--skeleton" />
    </div>
  );
}

export function MemberRegisterPage({ oauth }: MemberRegisterPageProps) {
  const emailDetailsId = useId();
  const [emailOpen, setEmailOpen] = useState(false);

  return (
    <main className="member-social-page">
      <div className="member-social-bg" aria-hidden="true">
        <span className="member-social-orb member-social-orb--google" />
        <span className="member-social-orb member-social-orb--facebook" />
        <span className="member-social-orb member-social-orb--brand" />
      </div>

      <div className="member-social-shell">
        <article className="member-social-card">
          <header className="member-social-hero">
            <span className="member-social-badge">{COMMUNITY_MEMBER.badge}</span>
            <h1>{COMMUNITY_MEMBER.registerTitle}</h1>
            <p className="member-social-lead">{COMMUNITY_MEMBER.registerSub}</p>
          </header>

          <section
            className="member-social-connect-wrap"
            aria-label="Sign in with Google or Facebook"
          >
            <Suspense fallback={<MemberSocialFallback />}>
              <MemberSocialAuth
                mode="register"
                variant="member-hub"
                oauthFromPath="/register/member"
                oauth={oauth}
              />
            </Suspense>
          </section>

          <div className="member-social-email">
            <button
              type="button"
              className="member-social-email-trigger"
              aria-expanded={emailOpen}
              aria-controls={emailDetailsId}
              onClick={() => setEmailOpen((open) => !open)}
            >
              <span className="member-social-email-trigger-icon" aria-hidden="true">
                ✉
              </span>
              {emailOpen ? "Hide email form" : COMMUNITY_MEMBER.emailDivider}
            </button>
            {emailOpen ? (
              <div id={emailDetailsId} className="member-social-email-panel">
                <p className="member-social-email-note">{COMMUNITY_MEMBER.emailApprovalNote}</p>
                <RegisterForm
                  accountRole="MEMBER"
                  successRedirect="/listings/buy"
                  variant="member"
                />
              </div>
            ) : null}
          </div>

          <footer className="member-social-footer">
            <p>
              Already registered?{" "}
              <Link href="/login">{COMMUNITY_MEMBER.emailSignInLink}</Link>
            </p>
            <p className="member-social-footer-alt">
              <Link href="/listings/buy">Browse without signing in</Link>
              {" · "}
              <Link href="/register/consultant">{CONSULTANT.registerLink}</Link>
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}

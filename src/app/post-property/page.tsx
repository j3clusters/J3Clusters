import Link from "next/link";

import { ConsultantPortfolioHeroPanel } from "@/components/ConsultantPortfolioHeroPanel";
import { MyPropertiesHeroActions } from "@/components/MyPropertiesHeroActions";
import { PostPropertyHeroMarquee } from "@/components/PostPropertyHeroMarquee";
import { PostPropertyForm } from "@/components/PostPropertyForm";
import { CONSULTANT } from "@/lib/consultant-labels";
import { getConsultantPortfolioSnapshot } from "@/lib/consultant-portfolio-snapshot";
import { requireConsultant } from "@/lib/require-user";

export default async function PostPropertyPage() {
  const { session, user } = await requireConsultant();
  const portfolio = await getConsultantPortfolioSnapshot(session.sub, user.email);
  const accountProfile = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
  };

  return (
    <div className="owner-portal post-property-page">
      <header className="mp-hero consultant-portal-hero">
        <div className="mp-hero-bg" aria-hidden="true">
          <span className="mp-hero-orb mp-hero-orb--a" />
          <span className="mp-hero-orb mp-hero-orb--b" />
        </div>
        <div className="container mp-hero-inner">
          <div className="mp-hero-copy">
            <span className="owner-portal-badge">{CONSULTANT.role}</span>
            <h1>Post your property</h1>
            <div className="mp-hero-marquee" aria-label="Posting benefits and steps">
              <div className="post-property-hero-steps-track">
                <PostPropertyHeroMarquee />
                <PostPropertyHeroMarquee hidden />
              </div>
            </div>
            <MyPropertiesHeroActions
              page="post"
              liveCount={portfolio.liveCount}
              pendingCount={portfolio.pendingCount}
            />
          </div>
          <ConsultantPortfolioHeroPanel {...portfolio} />
        </div>
      </header>

      <main className="container mp-layout section">
        <div className="mp-main">
          <div className="owner-portal-cards post-property-benefits">
            <article className="owner-info-card post-property-benefit">
              <span className="post-property-benefit-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <div>
                <strong>Verified listings</strong>
                Each submission is checked before it appears on the public site.
              </div>
            </article>
            <article className="owner-info-card post-property-benefit">
              <span className="post-property-benefit-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </span>
              <div>
                <strong>Track progress</strong>
                See approval status anytime under{" "}
                <Link href="/my-properties">My properties</Link>.
              </div>
            </article>
            <article className="owner-info-card post-property-benefit">
              <span className="post-property-benefit-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </span>
              <div>
                <strong>Rich photos</strong>
                Upload up to 13 images — we optimize them automatically.
              </div>
            </article>
          </div>
          <PostPropertyForm accountProfile={accountProfile} />
        </div>
      </main>
    </div>
  );
}

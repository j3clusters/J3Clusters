import Link from "next/link";
import { OwnerPortalNav } from "@/components/OwnerPortalNav";
import { PostPropertyForm } from "@/components/PostPropertyForm";
import { UserLogoutButton } from "@/components/UserLogoutButton";
import { prisma } from "@/lib/prisma";
import { requireConsultant } from "@/lib/require-user";

export default async function PostPropertyPage() {
  const session = await requireConsultant();
  const user = await prisma.appUser.findUnique({
    where: { id: session.sub },
    select: { name: true, email: true, phone: true, city: true },
  });
  const accountProfile = user
    ? {
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
      }
    : null;

  return (
    <div className="owner-portal post-property-page">
      <header className="owner-portal-hero post-property-hero">
        <div className="container owner-portal-hero-inner">
          <div className="post-property-hero-copy">
            <span className="owner-portal-badge">Property consultant portal</span>
            <h1>Post your property</h1>
            <p>
              Share photos and details once — we review every listing so buyers
              see accurate, trustworthy homes on J3 Clusters.
            </p>
            <p className="owner-portal-highlight">
              <span className="post-property-hero-pill" aria-hidden="true">
                Free
              </span>
              No listing fees · Verified before publish
            </p>
            <ol className="post-property-hero-steps" aria-label="How posting works">
              <li>
                <span>1</span>
                Fill the form
              </li>
              <li>
                <span>2</span>
                Team review
              </li>
              <li>
                <span>3</span>
                Go live
              </li>
            </ol>
          </div>
          <UserLogoutButton className="secondary-btn portal-btn-ghost" />
        </div>
      </header>

      <main className="container owner-portal-layout section">
        <OwnerPortalNav active="post" />
        <div className="owner-portal-main">
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
                Upload up to 10 images — we optimize them automatically.
              </div>
            </article>
          </div>
          <PostPropertyForm accountProfile={accountProfile} />
        </div>
      </main>
    </div>
  );
}

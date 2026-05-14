import Link from "next/link";
import { OwnerPortalNav } from "@/components/OwnerPortalNav";
import { PostPropertyForm } from "@/components/PostPropertyForm";
import { UserLogoutButton } from "@/components/UserLogoutButton";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

export default async function PostPropertyPage() {
  const session = await requireUser();
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
    <div className="owner-portal">
      <header className="owner-portal-hero">
        <div className="container owner-portal-hero-inner">
          <div>
            <span className="owner-portal-badge">Owner</span>
            <h1>Post your property</h1>
            <p>
              Add full details and photos. Our team verifies submissions before
              they go live on J3 Clusters.
            </p>
            <p className="owner-portal-highlight">
              Posting your property is completely free.
            </p>
          </div>
          <UserLogoutButton className="secondary-btn portal-btn-ghost" />
        </div>
      </header>

      <div className="container owner-portal-layout section">
        <OwnerPortalNav active="post" />
        <div className="owner-portal-main">
          <div className="owner-portal-cards">
            <div className="owner-info-card">
              <strong>How it works</strong>
              Submit your details and photos here. Our team verifies each
              submission before it appears on the public listings page.
            </div>
            <div className="owner-info-card">
              <strong>New here?</strong>
              <Link href="/register">Create a free account</Link> if you have not
              registered yet.
            </div>
          </div>
          <PostPropertyForm accountProfile={accountProfile} />
        </div>
      </div>
    </div>
  );
}

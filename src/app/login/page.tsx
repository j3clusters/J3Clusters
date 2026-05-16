import { Suspense } from "react";

import { LoginPageClient } from "./LoginPageClient";
import { getMemberOAuthAvailability } from "@/lib/auth/member-oauth-availability";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Sign in",
  description: "Sign in to your J3 Clusters account as a property agent or community member.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  const oauth = getMemberOAuthAvailability();

  return (
    <Suspense
      fallback={
        <main className="portal-auth-page">
          <div className="portal-auth-card portal-auth-suspense-fallback" aria-busy="true">
            <div className="portal-auth-header portal-auth-header--skeleton" />
            <p className="portal-auth-sub">Loading sign-in…</p>
          </div>
        </main>
      }
    >
      <LoginPageClient oauth={oauth} />
    </Suspense>
  );
}

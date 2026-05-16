import { Suspense } from "react";

import { LoginPageClient } from "./LoginPageClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Sign in",
  description: "Sign in to your J3 Clusters account as a property consultant or community member.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="portal-auth-page">
          <div className="portal-auth-card">
            <p className="portal-auth-sub">Loading sign-in…</p>
          </div>
        </main>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}

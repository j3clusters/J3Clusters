import { Suspense } from "react";

import { LoginPageClient } from "./LoginPageClient";

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

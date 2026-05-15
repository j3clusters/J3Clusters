"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container section">
      <div className="owner-form-card" style={{ maxWidth: "28rem", margin: "0 auto" }}>
        <h1 className="owner-my-section-title" style={{ marginBottom: "0.5rem" }}>
          Something went wrong
        </h1>
        <p className="owner-my-section-intro" style={{ marginBottom: "1rem" }}>
          This page hit an unexpected error. You can try again or return home.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => reset()}
            style={{ borderColor: "#0369a1", color: "#0369a1", fontWeight: 700 }}
          >
            Try again
          </button>
          <Link href="/" className="secondary-btn">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}

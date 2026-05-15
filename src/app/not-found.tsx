import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="container section">
      <div className="owner-form-card" style={{ maxWidth: "28rem", margin: "0 auto" }}>
        <h1 className="owner-my-section-title" style={{ marginBottom: "0.5rem" }}>
          Page not found
        </h1>
        <p className="owner-my-section-intro" style={{ marginBottom: "1rem" }}>
          We could not find what you were looking for.
        </p>
        <Link href="/" className="secondary-btn">
          Back to home
        </Link>
      </div>
    </main>
  );
}

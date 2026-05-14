import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">J3 Clusters</p>
          <p className="footer-copy">
            <strong>About us:</strong> J3 Clusters is committed to delivering a
            reliable and transparent property experience for buyers, renters,
            and sellers. We maintain high standards through verified listings,
            clear communication, and consistent customer support. Our objective
            is to simplify decision-making and build long-term trust across
            growing Indian cities. We continuously improve our platform to meet
            evolving market expectations. Integrity, accountability, and service
            excellence remain central to everything we do.
          </p>
        </div>
        <div>
          <p className="footer-heading">Explore</p>
          <p>
            <Link href="/listings/buy">Buy a home</Link>
          </p>
          <p>
            <Link href="/listings/rent">Rent a property</Link>
          </p>
          <p>
            <Link href="/register">Sell property</Link>
          </p>
        </div>
        <div>
          <p className="footer-heading">Support</p>
          <p>
            <Link href="/contact">Contact us</Link>
          </p>
          <p>
            <Link href="/admin/login">Partner login</Link>
          </p>
          <p>
            <Link href="/register">Register</Link>
          </p>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>Copyright 2026 J3 Clusters. All rights reserved.</p>
      </div>
    </footer>
  );
}

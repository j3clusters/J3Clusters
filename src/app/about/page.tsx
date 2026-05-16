import Link from "next/link";

import { SiteArticlePage } from "@/components/SiteArticlePage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "About us",
  description:
    "Learn how J3 Clusters connects buyers and renters with property agents through verified listings and transparent workflows.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <SiteArticlePage
      title="About J3 Clusters"
      eyebrow="About us"
      intro={
        <p className="site-article-lead">
          We operate a curated property marketplace focused on clarity, verified
          listing workflows, and direct access to agents when you need it.
        </p>
      }
    >
      <h2>Our purpose</h2>
      <p>
        J3 Clusters brings together buyers, tenants, and property agents so
        that serious housing decisions are supported by accurate information,
        responsive communication, and tools that reflect how people actually search
        in Indian cities—from apartments and villas to plots and PG stays.
      </p>

      <h2>What we prioritise</h2>
      <ul className="site-article-list">
        <li>
          <strong>Verified listings pathway</strong> — agent submissions move
          through review before appearing publicly, encouraging consistent quality on
          the platform.
        </li>
        <li>
          <strong>Transparency</strong> — we aim to reduce friction by showing purpose
          (sale versus rent), key facts, and—where appropriate—agent contact
          access for authenticated community members.
        </li>
        <li>
          <strong>Support</strong> — whether you browse as a visitor, join as a
          community member, or list properties as a agent, we aim to respond
          helpfully via our contact channels and documented policies.
        </li>
      </ul>

      <h2>Governance & operations</h2>
      <p>
        Operational decisions—including marketplace rules, moderator review, fraud
        prevention, product changes, and data handling practices—are communicated
        through our{" "}
        <Link href="/terms">Terms &amp; Conditions</Link>,{" "}
        <Link href="/privacy">Privacy Policy</Link>, and platform notices where material
        changes affect how you use the service.
      </p>

      <h2>Contact</h2>
      <p>
        For partnership or press enquiries—or if something on the platform does not
        look right—please reach us via our{" "}
        <Link href="/contact">Contact</Link> page.
      </p>
    </SiteArticlePage>
  );
}

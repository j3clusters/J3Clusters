import Link from "next/link";

import { SiteArticlePage } from "@/components/SiteArticlePage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How J3 Clusters collects, uses, retains, and protects personal information across our property marketplace.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <SiteArticlePage
      title="Privacy Policy"
      eyebrow="Trust & transparency"
      intro={
        <p className="site-article-lead site-article-meta">
          Last updated <time dateTime="2026-05-16">16 May 2026</time>. Describes how
          we handle personal data when you browse, join, submit listings, or contact
          us.
        </p>
      }
    >
      <h2>Who we are</h2>
      <p>
        This Policy applies to the J3 Clusters website and related online services
        (the &ldquo;Platform&rdquo;). References to &ldquo;we&rdquo;, &ldquo;us&rdquo;,
        or &ldquo;our&rdquo; mean J3 Clusters operating the Platform.
      </p>

      <h2>What we collect</h2>
      <p>Depending on how you interact with us we may collect:</p>
      <ul className="site-article-list">
        <li>
          <strong>Account identifiers</strong> — name, email address, hashed
          passwords, telephone number, preferred city where you volunteer it during
          registration.
        </li>
        <li>
          <strong>Listing-related content</strong> — property narratives, uploads,
          optional consultant portrait photos supplied with submissions or editing
          flows.
        </li>
        <li>
          <strong>Operational telemetry</strong> — server logs, approximate device
          and network diagnostics, security signals, and cookies or similar
          technologies required for sessions and fraud prevention.
        </li>
        <li>
          <strong>Support communications</strong> — messages you send via contact
          forms, email, or WhatsApp where you choose to engage us.
        </li>
      </ul>

      <h2>Why we use information</h2>
      <ul className="site-article-list">
        <li>Deliver accounts, authentication, password recovery, and role-specific features.</li>
        <li>Publish, moderate, and improve listings and marketplace trust signals.</li>
        <li>Respond to enquiries, detect abuse, secure infrastructure, and enforce our Terms.</li>
        <li>Meet legal, audit, or regulatory duties where applicable in India.</li>
      </ul>

      <h2>Legal bases (summary)</h2>
      <p>
        We process personal data to perform our contract with you (account + listed
        services), pursue legitimate interests (security, analytics, product
        improvement that does not override your rights), and comply with law. Where
        consent is required for optional communications, we will ask separately.
      </p>

      <h2>Cookies &amp; similar technologies</h2>
      <p>
        We rely on strictly necessary cookies (for example administrator and
        consultant session tokens) plus functional cookies where required by our tech
        stack. Optional marketing trackers are outside the baseline implementation;
        updates will be surfaced if introduced.
      </p>

      <h2>Sharing</h2>
      <p>We disclose information only as needed:</p>
      <ul className="site-article-list">
        <li>
          <strong>Service providers</strong> — hosting, email delivery (for example,
          transactional providers configured to send password resets), storage, and
          security vendors under contract.
        </li>
        <li>
          <strong>Consultant-to-member exposure</strong> — contact details you place
          on live listings can be visible to authenticated community members as
          described in product surface copy.
        </li>
        <li>
          <strong>Legal &amp; safety</strong> — when required by court order,
          subpoena, or to protect rights, property, users, or the public.
        </li>
      </ul>

      <h2>Retention</h2>
      <p>
        We retain information only as long as needed for the purposes above, subject
        to backup cycles, dispute timelines, regulatory minimums, and fraud
        monitoring. Deleted listings may persist in aggregated analytics without
        direct identifiers where technically feasible.
      </p>

      <h2>Security</h2>
      <p>
        We employ administrative, technical, and organisational safeguards
        appropriate to risk; no transmission or storage method is perfectly secure,
        but we routinely review access privileges and patching posture.
      </p>

      <h2>Your choices &amp; rights</h2>
      <p>You may:</p>
      <ul className="site-article-list">
        <li>Request access or correction where applicable privacy law affords those rights.</li>
        <li>Withdraw consent for optional processing where consent formed the lawful basis.</li>
        <li>Object to certain processing impacting your statutory rights.</li>
        <li>Lodge complaints with supervisory authorities if remedies are unsatisfactory.</li>
      </ul>
      <p>
        Operational requests—such as correcting listing photos—may be honoured via{" "}
        <Link href="/contact">support</Link> flows so we can verify identity proportionately.
      </p>

      <h2>Children</h2>
      <p>
        Our Platform targets adults navigating property transactions and is not
        directed at children under 13 (or minors unable to legally contract).
        Accounts attributable to barred ages may be discontinued.
      </p>

      <h2>Cross-border transfers</h2>
      <p>
        Infrastructure vendors may operate in multiple regions. Where data leaves
        India we implement contractual or technical protections consistent with
        applicable law.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this Policy to reflect product, legal, or regulatory changes.
        Material updates will be announced through the Platform or email when
        appropriate. Continued use after the effective date constitutes acceptance
        unless law requires stricter consent.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions? Write to us through the{" "}
        <Link href="/contact">Contact</Link> page with &ldquo;Privacy&rdquo; in the subject
        line for faster triage.
      </p>
    </SiteArticlePage>
  );
}

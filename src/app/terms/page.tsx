import Link from "next/link";

import { SiteArticlePage } from "@/components/SiteArticlePage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Terms & Conditions",
  description:
    "General terms governing use of the J3 Clusters property marketplace, including accounts, listings, acceptable use, and disclaimers.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <SiteArticlePage
      title="General Terms &amp; Conditions"
      eyebrow="Legal"
      intro={
        <p className="site-article-lead site-article-meta">
          Last updated <time dateTime="2026-05-16">16 May 2026</time>. Please read
          these Terms together with our <Link href="/privacy">Privacy Policy</Link>{" "}
          and <Link href="/faq">FAQ</Link>.
        </p>
      }
    >
      <h2>1. Agreement</h2>
      <p>
        By accessing or using J3 Clusters (the &ldquo;Platform&rdquo;), you confirm
        that you can legally enter a binding agreement in India, that your
        participation is truthful, and that you will follow these Terms, our Privacy
        Policy, and any posted supplemental rules we make available.
      </p>

      <h2>2. Accounts &amp; roles</h2>
      <p>
        Consultants may publish inventory subject to moderator review prior to—or
        after—general availability. Community members may browse publicly available
        content and reveal consultant phone fields where gated by authenticated
        session state. Administrators maintain operational dashboards separate from
        public accounts. Credentials must remain confidential; you notify us promptly
        of unauthorised use.
      </p>

      <h2>3. Listings, accuracy &amp; compliance</h2>
      <p>
        Consultants represent that submissions are materially accurate regarding
        status, lawful authority to advertise, zoning awareness, approvals, occupancy,
        fixtures, defects they know about, and pricing indicative fields. Concealing
        encumbrances, forged documents, or impersonating another brokerage is a
        material breach. We may suspend, edit, refuse, archive, deprioritize, or
        remove submissions without prior notice where risk, fraud suspicion, hate
        speech, discriminatory exclusions, unlawful content, or technical abuse is
        involved.
      </p>

      <h2>4. Intellectual property licence you grant</h2>
      <p>
        You grant J3 Clusters a non-exclusive, transferable, royalty-free licence
        to host, reproduce, adapt (for example normalising image formats), display,
        distribute, and promote your submitted content so the Platform can function,
        market itself, and secure listings. You remain responsible for securing
        underlying rights in photos and copy.
      </p>

      <h2>5. Acceptable use</h2>
      <p>You will not:</p>
      <ul className="site-article-list">
        <li>Attempt to breach authentication, scrape private phone numbers at scale, or overload systems.</li>
        <li>Upload malware, mine cryptocurrency, or probe vulnerabilities without prior written authorisation.</li>
        <li>Harass users, staff, or moderators; nor deploy violent, hateful, or sexually exploitative material.</li>
        <li>Misrepresent identity, listing ownership, or regulatory credentials.</li>
      </ul>

      <h2>6. Third parties &amp; transactions</h2>
      <p>
        The Platform facilitates discovery; final contracts, due diligence, stamp
        duty, registration, advances, handovers, and dispute resolution occur directly
        between parties (and their consultants, lawyers, banks, or municipal
        authorities). J3 Clusters is not a broker, bank, insurer, RERA authority, or
        guarantor of deal completion unless we explicitly sign a separate written
        instrument.
      </p>

      <h2>7. Disclaimers</h2>
      <p>
        To the maximum extent permitted by law, the Platform is provided &ldquo;as
        is&rdquo; and &ldquo;as available&rdquo; without warranties of
        merchantability, fitness for a particular purpose, or non-infringement. We do
        not warrant uninterrupted operation, error-free listings, or that every
        consultant is licensed in your jurisdiction.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        Neither party limits liability for death, personal injury caused by
        negligence, fraud, or other categories that cannot be excluded under the
        Indian Contract Act, 1872 or consumer protection instruments. Otherwise, to
        the extent permitted, our aggregate liability arising from or related to the
        Platform (per claim or series) is limited to the greater of (a) INR 5,000 or
        (b) amounts you paid us in fees for premium services specifically
        attributable to the claim within the preceding three months—{" "}
        <em>excluding</em> government charges, escrow, or pass-through brokerage
        splits that we may never custody. Some jurisdictions disallow certain
        caps—those overrides apply.
      </p>

      <h2>9. Indemnity</h2>
      <p>
        You indemnify and hold harmless J3 Clusters and its officers, contractors, and
        moderators against third-party claims, damages, liabilities, costs, and
        reasonable legal fees arising from your content, account misuse, statutory
        violation, or breach of these Terms—except where solely caused by our gross
        negligence or wilful misconduct.
      </p>

      <h2>10. Suspension &amp; termination</h2>
      <p>
        We may suspend or terminate access for risk management, Terms breach, court
        order, inactive accounts following notice, or business wind-down planning. Key
        provisions (liability caps to the extent allowed, licences granted, dispute
        resolution) survive cessation.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may amend these Terms; material revisions will be posted with updated
        effective dates. Continued use after posting constitutes acceptance unless
        mandatory law demands opt-in consent.
      </p>

      <h2>12. Governing law &amp; disputes</h2>
      <p>
        These Terms are governed by the laws of India. Subject to statutory
        protections, courts at Chennai (Tamil Nadu) shall have exclusive
        jurisdiction—unless another forum is mandated for consumer disputes in your
        state. You may first attempt good-faith informal resolution via our{" "}
        <Link href="/contact">Contact</Link> channel.
      </p>

      <h2>13. Entire agreement</h2>
      <p>
        These Terms, the Privacy Policy, and expressly referenced exhibits form the
        entire agreement concerning the Platform and supersede prior oral or
        conflicting understandings except where statute requires written forms.
      </p>
    </SiteArticlePage>
  );
}

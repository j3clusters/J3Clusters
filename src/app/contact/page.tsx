import type { Metadata } from "next";

import { ContactForm } from "@/components/ContactForm";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact us",
  description:
    "Get in touch with J3 Clusters for property enquiries, agent support, and listing questions. WhatsApp and contact form available.",
  path: "/contact",
  keywords: ["contact J3 Clusters", "property enquiry", "real estate support"],
});
import { SocialLinks } from "@/components/SocialLinks";
import {
  buildWhatsAppUrl,
  SITE_GENERAL_WHATSAPP_MESSAGE,
  SITE_WHATSAPP,
} from "@/lib/site-contact";
export default function ContactPage() {
  const whatsappHref = buildWhatsAppUrl(SITE_GENERAL_WHATSAPP_MESSAGE);

  return (
    <main className="container section narrow">
      <h1>Contact J3 Clusters</h1>
      <p>
        Share your requirement and our team will help you shortlist suitable
        properties.
      </p>
      <div className="contact-social-block">
        <p className="contact-social-label">Social links</p>
        <SocialLinks variant="page" iconOnly showAllPlatforms />
      </div>
      <p className="contact-whatsapp-intro">
        Prefer instant chat?{" "}
        <a
          href={whatsappHref}
          className="contact-whatsapp-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Message us on WhatsApp ({SITE_WHATSAPP.display})
        </a>
        .
      </p>
      <ContactForm />
    </main>
  );
}

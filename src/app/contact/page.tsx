import { ContactForm } from "@/components/ContactForm";
import { SocialLinks } from "@/components/SocialLinks";
import {
  buildWhatsAppUrl,
  SITE_GENERAL_WHATSAPP_MESSAGE,
  SITE_WHATSAPP,
} from "@/lib/site-contact";
import { buildMailtoInquiryHref, getSiteContactEmail } from "@/lib/site-social";

export default function ContactPage() {
  const whatsappHref = buildWhatsAppUrl(SITE_GENERAL_WHATSAPP_MESSAGE);
  const email = getSiteContactEmail();
  const mailHref = buildMailtoInquiryHref(email);

  return (
    <main className="container section narrow">
      <h1>Contact J3 Clusters</h1>
      <p>
        Share your requirement and our team will help you shortlist suitable
        properties.
      </p>
      <p className="contact-email-intro">
        Prefer email? Send a message to{" "}
        <a href={mailHref} className="contact-email-link">
          {email}
        </a>
        .
      </p>
      <div className="contact-social-block">
        <p className="contact-social-label">Social links</p>
        <SocialLinks variant="page" />
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

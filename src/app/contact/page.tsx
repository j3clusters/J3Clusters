import { ContactForm } from "@/components/ContactForm";
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

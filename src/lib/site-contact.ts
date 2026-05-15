/** J3 Clusters WhatsApp support line. */
export const SITE_WHATSAPP = {
  display: "+91-9965051051",
  waId: "919965051051",
} as const;

/** Prefill for global CTAs (header, footer, floating button)—not tied to a listing ref. */
export const SITE_GENERAL_WHATSAPP_MESSAGE =
  "Hi J3 Clusters — I am on your website and would like help with properties." as const;

export function buildWhatsAppUrl(message: string) {
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${SITE_WHATSAPP.waId}?${params.toString()}`;
}

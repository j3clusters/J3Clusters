/** User-facing copy: "owner" role is presented as property consultant across the site. */
export const CONSULTANT = {
  role: "Property consultant",
  rolePlural: "Property consultants",
  portal: "Property consultant portal",
  portalBadge: "Consultant portal",
  name: "Property consultant name",
  nameShort: "Consultant name",
  contactSection: "Consultant contact",
  listedBy: "Property consultant",
  login: "Consultant login",
  loginBadge: "Consultant access",
  registerBadge: "Property consultant",
  registerTitle: "Register as a property consultant",
  registerSub:
    "Create your free account to list apartments, villas, plots, and PG stays. Registrations are reviewed by our team before you can sign in and post.",
  contactHiddenHint:
    "Register as a community member to view the consultant mobile number.",
  contactHiddenCta: "Join as community member",
} as const;

export const COMMUNITY_MEMBER = {
  role: "Community member",
  badge: "Community member",
  hubTitle: "Member hub",
  hubSub:
    "Access consultant phone numbers while you browse and keep your property search moving without friction.",
  registerTitle: "Register as a community member",
  registerSub:
    "Create a free account with your email, Google, or Facebook to unlock consultant phone numbers on verified listings.",
} as const;

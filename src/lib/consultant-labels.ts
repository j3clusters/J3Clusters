/** User-facing copy: owner role is presented as property agent across the site. */
export const CONSULTANT = {
  role: "Property agent",
  rolePlural: "Property agents",
  portal: "Property agent portal",
  portalBadge: "Agent portal",
  name: "Property agent name",
  nameShort: "Agent name",
  contactSection: "Agent contact",
  contactSectionLong: "Property agent contact",
  listedBy: "Property agent",
  detailsTitle: "Property agent details",
  photo: "Agent photo",
  login: "Agent login",
  loginBadge: "Agent access",
  registerBadge: "Property agent",
  registerTitle: "Register as a property agent",
  registerSub:
    "Create your free account to list apartments, villas, plots, and PG stays on J3 Clusters.",
  registerSubmit: "Submit registration",
  registerSubmitPending: "Submitting…",
  registerLink: "Register as agent",
  listLink: "List as agent",
  pagesGroup: "Agent pages",
  navigation: "Property agent navigation",
  contactHiddenHint:
    "Sign in as an approved community member to view the agent mobile number.",
  contactHiddenCta: "Join or sign in",
  pendingApproval:
    "Your agent application is awaiting admin approval. Sign in here once approved.",
  accountPending:
    "Your property agent account is awaiting admin approval. You will be able to sign in after approval.",
  accountRejected:
    "Your agent registration was not approved. Please contact support if you have questions.",
  registrationReceived:
    "Registration received. We will email you when your application is approved — then sign in to post listings.",
  canPostAfterLogin: "You can now post properties as a property agent.",
  apiOnlyAgents: "Only property agent accounts can submit listings.",
  apiOnlyAgentsEdit: "Only property agent accounts can edit listings.",
} as const;

export const AUTH_LOGIN = {
  badge: "Sign in",
  title: "Welcome back",
  agentSignInHint:
    "Sign in with email after your registration is approved",
  memberSignInHint:
    "Google, Facebook, or email — sign in after your application is approved",
  pendingNote:
    "Your registration is awaiting approval. You can sign in here once the process is complete.",
  memberPendingNote:
    "Your member registration is awaiting approval. You can sign in here once approved.",
  needAccount: "Need an account?",
  captchaHint: "Complete the security check to continue.",
  staffNote: "Staff:",
  staffLink: "Admin login",
} as const;

export const COMMUNITY_MEMBER = {
  role: "Community member",
  badge: "Community member",
  hubTitle: "Member hub",
  hubSub:
    "Access agent phone numbers while you browse and keep your property search moving without friction.",
  registerTitle: "Join as a community member",
  registerSub:
    "Create a free account with Google, Facebook, or email. You can browse listings without signing in.",
  emailDivider: "No social account? Register with email",
  emailApprovalNote:
    "Email applications are reviewed before you can sign in.",
  emailSignInLink: "Sign in with email instead",
  registerSubmit: "Create member account",
  registerSubmitPending: "Creating account…",
  joinLink: "Join as member",
  registrationReceived:
    "Registration received. We will notify you when approved — then you can sign in here.",
  accountPending:
    "Your community member registration is awaiting admin approval. Sign in after approval.",
  unlockPhone:
    "Approved members can reveal property agent phone numbers on published listings.",
  registerAgentLink: "Register as a property agent",
} as const;

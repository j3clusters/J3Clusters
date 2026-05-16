import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { SiteArticlePage } from "@/components/SiteArticlePage";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about browsing properties, memberships, consultants, submissions, privacy, and support on J3 Clusters.",
};

const faqs: { question: string; answer: ReactNode }[] = [
  {
    question: "What is J3 Clusters?",
    answer:
      "J3 Clusters is a property marketplace where you can explore verified sale and rental listings published by consultants, with optional membership features that simplify reaching consultants when you’re ready.",
  },
  {
    question: "What is the difference between a consultant and a community member?",
    answer:
      "Consultants can submit and manage listings (subject to review and approval before going live). Community members can browse the marketplace and—with an active membership account—unlock consultant phone numbers displayed on listings, without posting inventory themselves.",
  },
  {
    question: "How do I register?",
    answer: (
      <>
        Choose{" "}
        <Link href="/register/consultant">consultant registration</Link> to list properties
        after sign-in, or{" "}
        <Link href="/register/member">member registration</Link> if you are primarily
        buying or renting. The{" "}
        <Link href="/register">registration hub</Link> summarises both paths.
      </>
    ),
  },
  {
    question: "Why does a listing show without a phone number until I sign in?",
    answer:
      "We balance public discovery with consultant privacy. Mobile numbers are revealed to signed-in community members so we can discourage automated scraping while still enabling serious callers to proceed quickly.",
  },
  {
    question: "How long does consultant listing approval take?",
    answer:
      "Timing depends on backlog and completeness of submission. Incomplete photos or contradictory details typically delay review; use the messaging on submission screens and check your consultant portal for queue status.",
  },
  {
    question: "Can I advertise any property?",
    answer:
      "You must comply with Indian law (including prohibition of discriminatory exclusions and misrepresentation). You agree that listing content is truthful to the best of your knowledge—see Terms for responsibilities and disclaimers.",
  },
  {
    question: "How do password recovery and emails work?",
    answer:
      "Account holders who use email-based password recovery can request a reset link when our mail provider is configured. If transactional email is unavailable in development, reset links may be logged for testing—never share production credentials casually.",
  },
  {
    question: "Who can see my profile data?",
    answer: (
      <>
        See our <Link href="/privacy">Privacy Policy</Link> for categories of personal
        data, retention, cookies, and your choices. In short: we use account data to
        operate authentication, listings, support, and safety work.
      </>
    ),
  },
  {
    question: "How do I report a problem?",
    answer: (
      <>
        Reach us via <Link href="/contact">Contact</Link> describing the listing URL or
        account-related issue. Fraudulent impersonation or obvious scams submitted
        with evidence help us escalate faster.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <SiteArticlePage
      title="Frequently asked questions"
      eyebrow="Help centre"
      intro={
        <p className="site-article-lead">
          Quick answers about memberships, consultants, listings, privacy, and
          support—plus links to deeper policy pages where needed.
        </p>
      }
    >
      <div className="faq-accordion">
        {faqs.map((item) => (
          <details key={item.question} className="faq-item">
            <summary>{item.question}</summary>
            <div className="faq-answer">{item.answer}</div>
          </details>
        ))}
      </div>
      <p className="faq-footnote meta">
        These FAQs are illustrative and informational. Binding language is defined in
        the <Link href="/terms">Terms &amp; Conditions</Link>.
      </p>
    </SiteArticlePage>
  );
}

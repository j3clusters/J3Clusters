import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-sans",
});
import { AnimatedFavicon } from "@/components/AnimatedFavicon";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";
import { JsonLd } from "@/components/JsonLd";
import { getAppBaseUrl } from "@/lib/app-base-url";
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  DEFAULT_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(getAppBaseUrl()),
  title: {
    default: `${SITE_NAME} — Verified property marketplace in India`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: getAppBaseUrl() }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "real estate",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: getAppBaseUrl(),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <body className={inter.className}>
        <AnimatedFavicon />
        <JsonLd data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]} />
        <Header />
        {children}
        <Footer />
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}

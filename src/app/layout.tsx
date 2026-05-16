import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";
import { getAppBaseUrl } from "@/lib/app-base-url";

export const metadata: Metadata = {
  metadataBase: new URL(getAppBaseUrl()),
  title: {
    default: "J3 Clusters",
    template: "%s · J3 Clusters",
  },
  description:
    "Find verified properties across apartments and villas with J3 Clusters.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "J3 Clusters",
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
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}

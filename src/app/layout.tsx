import type { Metadata } from "next";

import "@/app/globals.css";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}

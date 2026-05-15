// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://policytracker.nz"),

  title: {
    default: "NZ Policy Tracker",
    template: "%s | NZ Policy Tracker",
  },

  description:
    "A macroeconomic dashboard tracking RBNZ monetary policy, OCR decisions, and Taylor Rule estimates for New Zealand.",

  applicationName: "NZ Policy Tracker",

  keywords: [
    "RBNZ",
    "OCR",
    "New Zealand interest rates",
    "Taylor Rule",
    "monetary policy NZ",
    "inflation NZ",
    "macro dashboard",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "NZ Policy Tracker",
    description:
      "Track New Zealand monetary policy, OCR decisions, and Taylor Rule benchmarks.",
    url: "https://policytracker.nz",
    siteName: "NZ Policy Tracker",
    locale: "en_NZ",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "NZ Policy Tracker",
    description:
      "Macroeconomic dashboard for NZ monetary policy and OCR analysis.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NZ Policy Tracker",
  url: "https://policytracker.nz",
  description:
    "Macroeconomic dashboard tracking RBNZ OCR and Taylor Rule estimates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      </body>
    </html>
  );
}

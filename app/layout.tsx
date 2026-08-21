import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://janadhikar.in";

export const viewport: Viewport = {
  themeColor: "#881337",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JanAdhikar — File RTI & Legal Grievance Online in India",
    template: "%s | JanAdhikar",
  },
  description:
    "Autonomous legal assistant for Indian citizens. Draft high-success Section 6(1) RTI applications, consumer dispute notices, and CPGRAMS grievances with zero bureaucracy.",
  keywords: [
    "RTI application online",
    "File RTI India",
    "Right to Information Act 2005",
    "Consumer court complaint draft",
    "CPGRAMS grievance notice",
    "Section 6 1 RTI format",
    "Tenant security deposit legal notice",
    "Indian legal drafting AI",
    "Civic rights India",
  ],
  authors: [{ name: "JanAdhikar Civic Tech" }],
  creator: "JanAdhikar",
  publisher: "JanAdhikar",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    title: "JanAdhikar — Claim Your Civic Rights. Zero Bureaucracy.",
    description:
      "Transform plain civic issues into legally binding RTI petitions, consumer notices, and statutory appeals instantly.",
    siteName: "JanAdhikar",
    images: [
      {
        url: "/janadhikar-logo-v2.png",
        width: 1200,
        height: 630,
        alt: "JanAdhikar Legal Engine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JanAdhikar — Indian Civic & Legal Drafting Engine",
    description:
      "Draft court-ready RTI applications and legal grievance notices in minutes.",
    images: ["/janadhikar-logo-v2.png"],
  },
  verification: {
    // Paste your Google Search Console Verification String here (or via environment variable)
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "YOUR_GOOGLE_VERIFICATION_CODE_HERE",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "JanAdhikar",
    url: siteUrl,
    applicationCategory: "LegalApplication",
    operatingSystem: "All",
    description:
      "An autonomous legal engine translating civic complaints into structured RTI applications and consumer notices under Indian law.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };

  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#FAF8F5] text-slate-900 selection:bg-slate-900 selection:text-slate-100">
        {children}
      </body>
    </html>
  );
}

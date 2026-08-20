import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JanAdhikar — Institutional Legal Engine for Civic Rights",
  description: "An autonomous, local-first legal engine that translates everyday civic problems into legally binding RTI applications and Grievance appeals.",
  icons: {
    icon: {
      url: "/favicon.png",
      type: "image/svg+xml",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#FAF8F5] text-slate-900 selection:bg-slate-900 selection:text-slate-100">
        {children}
      </body>
    </html>
  );
}

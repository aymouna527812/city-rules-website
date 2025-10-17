
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { Analytics, RouteAnalytics } from "@/components/Analytics";
import { Suspense } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TimeFormatProvider } from "@/components/TimeFormatProvider";
import { buildBaseMetadata, buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = buildBaseMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}
      >
        <ThemeProvider>
          <TimeFormatProvider>
          <SiteHeader />
          <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6">
            {children}
          </main>
          <SiteFooter />
          <Analytics />
          <Suspense fallback={null}>
            <RouteAnalytics />
          </Suspense>
          <Script
            id="website-json-ld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: buildWebsiteJsonLd() }}
          />
          <Script
            id="organization-json-ld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: buildOrganizationJsonLd() }}
          />
        </TimeFormatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

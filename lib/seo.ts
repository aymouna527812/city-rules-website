import type { Metadata } from "next";

import type { QuietHoursRecord } from "@/lib/types";
import { getCountryName } from "@/lib/utils";

const SITE_NAME = "Quiet Hours & Noise Rules";
const DEFAULT_DESCRIPTION =
  "Understand residential quiet hours, noise bylaws, and enforcement guidance for cities across North America.";

export function getSiteUrl(): string {
  const url = process.env.SITE_URL ?? "https://quiet-hours.example.com";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function buildCanonicalPath(pathname: string): string {
  const siteUrl = getSiteUrl();
  if (!pathname.startsWith("/")) {
    return `${siteUrl}/${pathname}`;
  }
  return `${siteUrl}${pathname}`;
}

export function buildBaseMetadata(): Metadata {
  const canonical = buildCanonicalPath("/");
  return {
    metadataBase: new URL(getSiteUrl()),
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    alternates: {
      canonical,
    },
    openGraph: {
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
    },
  };
}

export function buildCityTitle(record: QuietHoursRecord): string {
  const countryName = getCountryName(record.country);
  return `Quiet Hours & Noise Rules in ${record.city}, ${record.region} (${countryName})`;
}

export function buildCityDescription(record: QuietHoursRecord): string {
  const countryName = getCountryName(record.country);
  return [
    `Plan your peace and quiet in ${record.city}, ${record.region}, ${countryName}.`,
    `Default quiet hours run ${record.default_quiet_hours}`,
    record.weekend_quiet_hours
      ? `weekends adjust to ${record.weekend_quiet_hours}`
      : undefined,
    record.construction_hours_weekday
      ? `construction hours ${record.construction_hours_weekday}`
      : undefined,
    `Learn reporting steps, fines, and verified bylaws.`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildCityMetadata(
  record: QuietHoursRecord,
  pathname: string,
): Metadata {
  const canonical = buildCanonicalPath(pathname);
  const title = buildCityTitle(record);
  const description = buildCityDescription(record);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export type BreadcrumbItem = {
  name?: string;
  label?: string;
  url?: string;
  href?: string;
};

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): string {
  const siteUrl = getSiteUrl();
  const itemListElement = items.reduce<Array<Record<string, unknown>>>((acc, item) => {
    const name = item.name ?? item.label;
    const rawUrl = item.url ?? item.href;
    if (!name || !rawUrl) {
      return acc;
    }
    const normalizedUrl = rawUrl.startsWith("http") ? rawUrl : `${siteUrl}${rawUrl}`;
    acc.push({
      "@type": "ListItem",
      position: acc.length + 1,
      name,
      item: normalizedUrl,
    });
    return acc;
  }, []);

  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
  return JSON.stringify(json);
}

export type FAQItem = {
  question: string;
  answer: string;
};

export function buildFaqJsonLd(faqs: FAQItem[]): string {
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
  return JSON.stringify(json);
}

export function buildWebsiteJsonLd(): string {
  const siteUrl = getSiteUrl();
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  });
}

export function buildOrganizationJsonLd(): string {
  const siteUrl = getSiteUrl();
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
    sameAs: [
      "https://www.linkedin.com/",
      "https://twitter.com/",
    ],
  });
}

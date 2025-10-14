import type { Metadata } from "next";

import type {
  BulkTrashRecord,
  FireworksRecord,
  ParkingRulesRecord,
  QuietHoursRecord,
} from "@/lib/types";
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

export function buildParkingTitle(record: ParkingRulesRecord): string {
  const countryName = getCountryName(record.country);
  return `Overnight Parking & Winter Bans in ${record.city}, ${record.region} (${countryName})`;
}

export function buildParkingDescription(record: ParkingRulesRecord): string {
  return [
    `Overnight parking guidance for ${record.city}, ${record.region}.`,
    record.overnight_parking_allowed === "varies"
      ? "Signed streets and winter bans control overnight access."
      : record.overnight_parking_allowed
        ? "Overnight parking is generally allowed when no bans are active."
        : "Overnight parking is prohibited on local streets.",
    record.winter_ban
      ? `Seasonal bans run ${record.winter_ban_months} with nightly restrictions ${record.winter_ban_hours}.`
      : "No seasonal winter ban is currently listed.",
    record.permit_required ? "Residential permits are required." : "No residential permit is required.",
    record.towing_enforced ? "Towing is enforced on ban routes and during snow emergencies." : undefined,
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildParkingMetadata(
  record: ParkingRulesRecord,
  pathname: string,
): Metadata {
  const canonical = buildCanonicalPath(pathname);
  const title = buildParkingTitle(record);
  const description = buildParkingDescription(record);
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

export function buildBulkTrashTitle(record: BulkTrashRecord): string {
  const countryName = getCountryName(record.country);
  return `Bulk Trash & Large-Item Pickup in ${record.city}, ${record.region} (${countryName})`;
}

export function buildBulkTrashDescription(record: BulkTrashRecord): string {
  return [
    `Bulk trash pickup rules for ${record.city}, ${record.region}.`,
    `Service type: ${record.service_type}.`,
    `Schedule: ${record.schedule_pattern}.`,
    `Limits: ${record.limits}.`,
    `Fees: ${record.fees}.`,
  ].join(" ");
}

export function buildBulkTrashMetadata(
  record: BulkTrashRecord,
  pathname: string,
): Metadata {
  const canonical = buildCanonicalPath(pathname);
  const title = buildBulkTrashTitle(record);
  const description = buildBulkTrashDescription(record);
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

export function buildFireworksTitle(record: FireworksRecord): string {
  const countryName = getCountryName(record.country);
  const location = record.city ? `${record.city}, ${record.region}` : record.region;
  return `Fireworks Legality in ${location} (${countryName})`;
}

export function buildFireworksDescription(record: FireworksRecord): string {
  const allowed =
    typeof record.allowed_consumer_fireworks === "boolean"
      ? record.allowed_consumer_fireworks
        ? "Consumer fireworks are permitted with local limits."
        : "Consumer fireworks are not permitted."
      : "Consumer fireworks are restricted to limited device types.";
  return [
    allowed,
    `Sale periods: ${record.sale_periods}.`,
    `Use hours: ${record.use_hours}.`,
    record.permit_required ? "Permits are required from local authorities." : "No permit required for general use.",
    record.fine_range ? `Fines: ${record.fine_range}.` : undefined,
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildFireworksMetadata(
  record: FireworksRecord,
  pathname: string,
): Metadata {
  const canonical = buildCanonicalPath(pathname);
  const title = buildFireworksTitle(record);
  const description = buildFireworksDescription(record);
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


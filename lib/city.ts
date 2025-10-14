import type { FAQItem } from "@/lib/seo";
import type { QuietHoursRecord } from "@/lib/types";
import { buildMailtoLink, formatDate, getCountryName } from "@/lib/utils";

export function buildFaqItems(record: QuietHoursRecord): FAQItem[] {
  const countryName = getCountryName(record.country);
  const items: FAQItem[] = [
    {
      question: `What are the residential quiet hours in ${record.city}?`,
      answer: `${record.city} enforces residential quiet hours from ${record.default_quiet_hours}. ${
        record.weekend_quiet_hours
          ? `Weekends and holidays are extended to ${record.weekend_quiet_hours}. `
          : ""
      }These hours apply to amplified sound, loud conversations, and parties.`,
    },
    {
      question: `How do I file a noise complaint in ${record.city}?`,
      answer: `Report ongoing noise issues by contacting ${record.complaint_channel}. The city recommends gathering times, dates, and recordings where possible before submitting your complaint via ${record.complaint_url}.`,
    },
    {
      question: `What are the fines for violating quiet hours in ${record.city}?`,
      answer: `Expect fines ranging ${record.fine_range}. ${
        record.first_offense_fine
          ? `First offenses typically start around $${record.first_offense_fine}. `
          : ""
      }Fines may increase for repeat violations or commercial properties.`,
    },
    {
      question: `When can construction operate in ${record.city}?`,
      answer: `Construction may operate weekdays during ${record.construction_hours_weekday}. Weekend work is limited to ${record.construction_hours_weekend} unless special permits are granted.`,
    },
    {
      question: `Are there decibel limits for residential noise in ${record.city}?`,
      answer:
        record.residential_decibel_limit_day || record.residential_decibel_limit_night
          ? `Yes. Daytime limits are ${
              record.residential_decibel_limit_day ?? "city-specified"
            } dBA and nighttime limits are ${
              record.residential_decibel_limit_night ?? "city-specified"
            } dBA inside neighbouring dwellings.`
          : `Yes. ${record.city} enforces qualitative limits on plainly audible noise inside neighbouring dwellings, even without published decibel thresholds.`,
    },
    {
      question: `When were these noise rules last verified?`,
      answer: `This page was last fact-checked ${formatDate(
        record.last_verified,
      )} against ${record.bylaw_title} for ${record.city}, ${countryName}.`,
    },
  ];

  if (items.length > 8) {
    return items.slice(0, 8);
  }
  return items;
}

export function buildPoliteNeighborEmail(record: QuietHoursRecord, pageUrl: string): string {
  const subject = `Noise after quiet hours in ${record.city}`;
  const body = [
    `Hi there,`,
    "",
    `I hope you're well. I wanted to share that our local quiet hours in ${record.city} run ${record.default_quiet_hours}${
      record.weekend_quiet_hours ? ` (weekends: ${record.weekend_quiet_hours})` : ""
    }.`,
    "Would you mind helping keep things a little quieter during that time?",
    "",
    `Thanks for understanding!`,
    "",
    `Reference: ${pageUrl}`,
  ].join("\n");
  return buildMailtoLink("hello@quiet-hours.app", subject, body);
}

export function buildSuggestUpdateEmail(record: QuietHoursRecord, pageUrl: string): string {
  const subject = `Feedback for ${record.city}, ${record.region} quiet hours`;
  const body = [
    `Hi Quiet Hours team,`,
    "",
    `I spotted a detail to update for ${record.city}, ${record.region}.`,
    "",
    `Page: ${pageUrl}`,
    "",
    "Suggested change:",
    "",
  ].join("\n");
  return buildMailtoLink("updates@quiet-hours.app", subject, body);
}

export type RelatedLink = {
  href: string;
  title: string;
};

export function buildRelatedLinks(record: QuietHoursRecord): RelatedLink[] {
  return [
    {
      href: `/${record.country_slug}/${record.region_slug}/${record.city_slug}#construction-hours`,
      title: `Construction hours in ${record.city}`,
    },
    {
      href: `/${record.country_slug}/${record.region_slug}/${record.city_slug}#lawn-equipment`,
      title: `Lawn-mowing hours across ${record.region}`,
    },
    {
      href: `/quiet-hours`,
      title: `Quiet hours directory for ${getCountryName(record.country)}`,
    },
  ];
}

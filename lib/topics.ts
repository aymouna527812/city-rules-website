import type { FAQItem } from "@/lib/seo";
import type { BulkTrashRecord, FireworksRecord, ParkingRulesRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function buildParkingFaqItems(record: ParkingRulesRecord): FAQItem[] {
  const allowedText =
    record.overnight_parking_allowed === "varies"
      ? "Overnight parking varies by signed streets and winter months."
      : record.overnight_parking_allowed
        ? "Yes, overnight parking is generally allowed when no bans are declared."
        : "No, overnight street parking is prohibited.";

  return [
    {
      question: `Is overnight street parking allowed in ${record.city}?`,
      answer: `${allowedText} Current posted restrictions list ${record.overnight_hours}.`,
    },
    {
      question: `What months is the winter parking ban in effect?`,
      answer: record.winter_ban
        ? `Winter parking bans run ${record.winter_ban_months} with nightly restrictions ${record.winter_ban_hours}. Snow emergencies can trigger ${record.snow_emergency_rules}.`
        : "No seasonal winter ban is currently listed, but snow emergencies may still trigger temporary restrictions.",
    },
    {
      question: `Do I need a permit for overnight parking?`,
      answer: record.permit_required
        ? `Yes. Overnight parking permits are required for many residential streets. Apply online at ${record.permit_url ?? "the municipal permit portal"}.`
        : "Permits are not required for overnight parking unless otherwise posted.",
    },
    {
      question: `What are the towing and ticket rules in ${record.city}?`,
      answer: `Typical enforcement includes ${record.ticket_amounts}. ${
        record.towing_enforced ? "Vehicles may be towed during ban hours or snow emergencies." : ""
      } Check posted signage before leaving your car overnight.`,
    },
    {
      question: `Where can I review official maps or notices?`,
      answer: record.tow_zones_map_url
        ? `Use the official tow-zone map at ${record.tow_zones_map_url} to confirm winter ban routes and snow emergency corridors.`
        : "Consult municipal notices and posted signage to confirm coverage areas for the winter ban.",
    },
    {
      question: `When were these parking rules last verified?`,
      answer: `The winter parking and towing summary was last checked ${formatDate(record.last_verified)}.`,
    },
  ];
}

export function buildBulkTrashFaqItems(record: BulkTrashRecord): FAQItem[] {
  return [
    {
      question: `How do I schedule bulk trash pickup in ${record.city}?`,
      answer: record.service_type === "appointment"
        ? `Schedule pickup via ${record.request_url ?? "the city request portal"}; ${record.schedule_pattern.toLowerCase()}.`
        : `Service is offered as ${record.service_type} with the following pattern: ${record.schedule_pattern}.`,
    },
    {
      question: `What items are accepted or not accepted?`,
      answer: `Accepted items include ${record.eligible_items.join(", ")}. Not accepted: ${record.not_accepted_items.join(", ")}.`,
    },
    {
      question: `Are there limits or fees for bulk pickup?`,
      answer: `${record.limits}. Fees: ${record.fees}.`,
    },
    {
      question: `Do holiday schedules change pickup dates?`,
      answer: record.holiday_shifts,
    },
    {
      question: `How do I report illegal dumping?`,
      answer: `Report issues via ${record.illegal_dumping_reporting}.`,
    },
    {
      question: `When were these guidelines last verified?`,
      answer: `These bulk service rules were last reviewed ${formatDate(record.last_verified)}.`,
    },
  ];
}

export function buildFireworksFaqItems(record: FireworksRecord): FAQItem[] {
  const jurisdiction = record.city ? `${record.city}, ${record.region}` : record.region;
  const allowed =
    typeof record.allowed_consumer_fireworks === "boolean"
      ? record.allowed_consumer_fireworks
        ? "Consumer fireworks are permitted with restrictions."
        : "Consumer fireworks are not permitted."
      : "Consumer fireworks are restricted to devices permitted by local ordinance.";

  return [
    {
      question: `Are consumer fireworks legal in ${jurisdiction}?`,
      answer: `${allowed} Check local bylaws for additional limitations${
        record.city_overrides || record.county_overrides ? ", especially where local overrides apply." : "."
      }`,
    },
    {
      question: `When can fireworks be sold or used?`,
      answer: `Sale periods: ${record.sale_periods}. Use hours: ${record.use_hours}.`,
    },
    {
      question: `Do I need a permit to use fireworks?`,
      answer: record.permit_required
        ? "Yes, a fireworks permit is required. Contact the local fire authority before purchasing or using fireworks."
        : "Permits are not required for general consumer use, though professional displays still need authorization.",
    },
    {
      question: `What fines or enforcement applies?`,
      answer: `${record.fine_range ?? "Fines vary by jurisdiction."} ${record.enforcement_notes}`,
    },
    {
      question: `Are there county or city-level overrides?`,
      answer:
        record.county_overrides || record.city_overrides
          ? [
              record.county_overrides
                ? `County overrides: ${record.county_overrides
                    .map((item) => `${item.county} — ${item.rules}`)
                    .join("; ")}`
                : null,
              record.city_overrides
                ? `City overrides: ${record.city_overrides
                    .map((item) => `${item.city} — ${item.rules}`)
                    .join("; ")}`
                : null,
            ]
              .filter(Boolean)
              .join(" ")
          : "No additional local overrides were listed at the time of verification.",
    },
    {
      question: `When were these fireworks rules last verified?`,
      answer: `Details confirmed ${formatDate(record.last_verified)} from ${record.source_title}.`,
    },
  ];
}

export function buildParkingTemplates(record: ParkingRulesRecord, pageUrl: string): {
  snowEmergency: string;
} {
  const snowEmergency = [
    `Hello property manager,`,
    "",
    `The city has a winter parking ban from ${record.winter_ban_months} and restricts overnight parking ${record.winter_ban_hours}.`,
    `During snow emergencies, the city instructs drivers: ${record.snow_emergency_rules}.`,
    "",
    `Could you share a reminder with residents so we can avoid towing or tickets?`,
    "",
    `Reference: ${pageUrl}`,
  ].join("\n");

  return { snowEmergency };
}

export function buildBulkTrashTemplates(record: BulkTrashRecord, pageUrl: string): {
  appointmentRequest: string;
} {
  const appointmentRequest = [
    `Hello Public Works,`,
    "",
    `I'd like to arrange a bulk trash pickup at my address in ${record.city}, ${record.region}.`,
    `Your service is listed as "${record.service_type}" with this schedule: ${record.schedule_pattern}.`,
    "",
    `Accepted items: ${record.eligible_items.join(", ")}.`,
    `Not accepted: ${record.not_accepted_items.join(", ")}.`,
    "",
    "Please confirm the next available pickup window and any paperwork needed.",
    "",
    `Reference: ${pageUrl}`,
  ].join("\n");

  return { appointmentRequest };
}

export function buildFireworksTemplates(record: FireworksRecord, pageUrl: string): {
  politeNotice: string;
} {
  const location = record.city ? `${record.city}, ${record.region}` : record.region;
  const politeNotice = [
    `Hi neighbour,`,
    "",
    `Just a quick reminder that consumer fireworks in ${location} are ${
      record.allowed_consumer_fireworks === false
        ? "not permitted"
        : record.allowed_consumer_fireworks === "restricted"
          ? "restricted to specific devices and hours"
          : "permitted only during the published windows"
    }.`,
    `Listed hours: ${record.use_hours}.`,
    "",
    "Could we stick to the permitted schedule so everyone stays safe and compliant?",
    "",
    `Reference: ${pageUrl}`,
  ].join("\n");

  return { politeNotice };
}

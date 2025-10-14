import chalk from "chalk";

import {
  getBulkTrashDataset,
  getDataset,
  getFireworksDataset,
  getParkingDataset,
} from "@/lib/dataClient";
import { buildSlugKey, slugify } from "@/lib/slug";
import type {
  BulkTrashRecord,
  DataSource,
  FireworksRecord,
  ParkingRulesRecord,
  QuietHoursRecord,
} from "@/lib/types";

type TopicRecord = QuietHoursRecord | ParkingRulesRecord | BulkTrashRecord | FireworksRecord;

type TopicDefinition = {
  name: string;
  requireCitySlug: boolean;
  load: () => Promise<{ records: readonly TopicRecord[]; source: DataSource }>;
};

type ValidationIssue = {
  topic: string;
  country: string;
  region: string;
  city?: string;
  issue: string;
};

const supportedTimeZones = new Set<string>(
  typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [],
);

const countryDisplayNames =
  typeof Intl.DisplayNames !== "undefined"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function resolveCountryName(iso2: string): string {
  if (!countryDisplayNames) {
    return iso2;
  }
  return countryDisplayNames.of(iso2) ?? iso2;
}

const TOPICS: TopicDefinition[] = [
  {
    name: "quiet_hours",
    requireCitySlug: true,
    load: async () => {
      const { records, source } = await getDataset();
      return { records: records as readonly TopicRecord[], source };
    },
  },
  {
    name: "parking_rules",
    requireCitySlug: true,
    load: async () => {
      const { records, source } = await getParkingDataset();
      return { records: records as readonly TopicRecord[], source };
    },
  },
  {
    name: "bulk_trash",
    requireCitySlug: true,
    load: async () => {
      const { records, source } = await getBulkTrashDataset();
      return { records: records as readonly TopicRecord[], source };
    },
  },
  {
    name: "fireworks",
    requireCitySlug: false,
    load: async () => {
      const { records, source } = await getFireworksDataset();
      return { records: records as readonly TopicRecord[], source };
    },
  },
];

function isFutureDate(value: string): boolean {
  return value > new Date().toISOString().slice(0, 10);
}

async function validateTopic(topic: TopicDefinition): Promise<{
  issues: ValidationIssue[];
  count: number;
  source: DataSource;
}> {
  const { records, source } = await topic.load();
  const issues: ValidationIssue[] = [];
  const slugCollisions = new Set<string>();
  const locationDuplicates = new Set<string>();

  for (const record of records) {
    const key = buildSlugKey(record.country_slug, record.region_slug, record.city_slug);
    if (slugCollisions.has(key)) {
      issues.push({
        topic: topic.name,
        country: record.country,
        region: record.region,
        city: record.city,
        issue: `Duplicate slug combination detected for ${key}`,
      });
    } else {
      slugCollisions.add(key);
    }

    if (topic.requireCitySlug && !record.city) {
      issues.push({
        topic: topic.name,
        country: record.country,
        region: record.region,
        issue: "city is required but missing for this dataset",
      });
    }

    if (record.city) {
      const computedCitySlug = slugify(record.city);
      if (computedCitySlug !== record.city_slug) {
        issues.push({
          topic: topic.name,
          country: record.country,
          region: record.region,
          city: record.city,
          issue: `city_slug mismatch: expected ${computedCitySlug}`,
        });
      }
    }

    const computedRegionSlug = slugify(record.region);
    if (computedRegionSlug !== record.region_slug) {
      issues.push({
        topic: topic.name,
        country: record.country,
        region: record.region,
        city: record.city,
        issue: `region_slug mismatch: expected ${computedRegionSlug}`,
      });
    }

    const countrySlugFromCode = slugify(resolveCountryName(record.country));
    if (countrySlugFromCode !== record.country_slug) {
      issues.push({
        topic: topic.name,
        country: record.country,
        region: record.region,
        city: record.city,
        issue: `country_slug mismatch: expected ${countrySlugFromCode}`,
      });
    }

    if (supportedTimeZones.size && !supportedTimeZones.has(record.timezone)) {
      issues.push({
        topic: topic.name,
        country: record.country,
        region: record.region,
        city: record.city,
        issue: `Unknown IANA timezone "${record.timezone}"`,
      });
    }

    if (isFutureDate(record.last_verified)) {
      issues.push({
        topic: topic.name,
        country: record.country,
        region: record.region,
        city: record.city,
        issue: "last_verified is in the future",
      });
    }

    const duplicateKey = `${record.country}__${record.region}__${
      record.city ?? "<region>"
    }`.toLowerCase();
    if (locationDuplicates.has(duplicateKey)) {
      issues.push({
        topic: topic.name,
        country: record.country,
        region: record.region,
        city: record.city,
        issue: "Duplicate location detected (country, region, city combination must be unique)",
      });
    } else {
      locationDuplicates.add(duplicateKey);
    }
  }

  return { issues, count: records.length, source };
}

async function main(): Promise<void> {
  const allIssues: ValidationIssue[] = [];
  for (const topic of TOPICS) {
    const { issues, count, source } = await validateTopic(topic);
    const prefix = chalk.bold(`[${topic.name}]`);
    console.log(`${prefix} Validated ${count} record(s) from ${source.toUpperCase()} source.`);

    if (issues.length > 0) {
      allIssues.push(...issues);
      console.error(chalk.red(`${prefix} Found ${issues.length} validation issue(s).`));
      console.table(
        issues.map((issue) => ({
          country: issue.country,
          region: issue.region,
          city: issue.city ?? "—",
          issue: issue.issue,
        })),
      );
    } else {
      console.log(chalk.green(`${prefix} All records passed validation.`));
    }
  }

  if (allIssues.length > 0) {
    process.exitCode = 1;
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

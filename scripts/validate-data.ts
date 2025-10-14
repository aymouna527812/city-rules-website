import chalk from "chalk";

import { getDataset } from "@/lib/dataClient";
import { buildSlugKey, slugify } from "@/lib/slugify";

type ValidationIssue = {
  city: string;
  region: string;
  country: string;
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

async function main(): Promise<void> {
  const issues: ValidationIssue[] = [];
  const duplicates = new Set<string>();
  const slugCollisions = new Set<string>();

  const { records, source } = await getDataset();

  for (const record of records) {
    const key = buildSlugKey(record.country_slug, record.region_slug, record.city_slug);
    if (slugCollisions.has(key)) {
      issues.push({
        city: record.city,
        region: record.region,
        country: record.country,
        issue: `Duplicate slug combination detected for ${key}`,
      });
    } else {
      slugCollisions.add(key);
    }

    const computedCitySlug = slugify(record.city);
    if (computedCitySlug !== record.city_slug) {
      issues.push({
        city: record.city,
        region: record.region,
        country: record.country,
        issue: `city_slug mismatch: expected ${computedCitySlug}`,
      });
    }

    const computedRegionSlug = slugify(record.region);
    if (computedRegionSlug !== record.region_slug) {
      issues.push({
        city: record.city,
        region: record.region,
        country: record.country,
        issue: `region_slug mismatch: expected ${computedRegionSlug}`,
      });
    }

    const countrySlugFromCode = slugify(resolveCountryName(record.country));
    if (countrySlugFromCode !== record.country_slug) {
      issues.push({
        city: record.city,
        region: record.region,
        country: record.country,
        issue: `country_slug mismatch: expected ${countrySlugFromCode}`,
      });
    }

    if (supportedTimeZones.size && !supportedTimeZones.has(record.timezone)) {
      issues.push({
        city: record.city,
        region: record.region,
        country: record.country,
        issue: `Unknown IANA timezone "${record.timezone}"`,
      });
    }

    if (record.last_verified > new Date().toISOString().slice(0, 10)) {
      issues.push({
        city: record.city,
        region: record.region,
        country: record.country,
        issue: "last_verified is in the future",
      });
    }

    if (duplicates.has(`${record.country}-${record.region}-${record.city}`)) {
      issues.push({
        city: record.city,
        region: record.region,
        country: record.country,
        issue: "Duplicate city entry detected (country, region, city must be unique)",
      });
    } else {
      duplicates.add(`${record.country}-${record.region}-${record.city}`);
    }
  }

  console.log(chalk.bold(`Validated ${records.length} cities from ${source.toUpperCase()} source.`));
  if (issues.length > 0) {
    console.error(chalk.red(`Found ${issues.length} validation issue(s):`));
    console.table(
      issues.map((issue) => ({
        country: issue.country,
        region: issue.region,
        city: issue.city,
        issue: issue.issue,
      })),
    );
    process.exitCode = 1;
    return;
  }

  console.log(chalk.green("All records passed validation ✅"));
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

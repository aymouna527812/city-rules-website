import { promises as fs } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

import { buildSlugKey, slugify } from "@/lib/slugify";
import {
  type DataSource,
  type QuietHoursDataset,
  type QuietHoursRecord,
  type SlugIndex,
  type SlugIndexEntry,
  QuietHoursDatasetSchema,
  QuietHoursRecordSchema,
} from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "lib", "data");
const JSON_PATH = path.join(DATA_DIR, "quiet_hours.json");
const CSV_PATH = path.join(DATA_DIR, "quiet_hours.csv");
const SLUG_INDEX_PATH = path.join(DATA_DIR, "slugIndex.json");

type DatasetCache = {
  dataset: QuietHoursDataset;
  source: DataSource;
};

let datasetPromise: Promise<DatasetCache> | null = null;
let slugIndexPromise: Promise<SlugIndex> | null = null;

function toOptionalNumber(value: unknown): number | undefined {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }
  const normalized =
    typeof value === "number" ? value : Number((value as string).replace(/[,_]/g, ""));
  return Number.isFinite(normalized) ? normalized : undefined;
}

function toTips(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((tip) => String(tip).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split("|")
      .map((tip) => tip.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeDate(value: unknown): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid last_verified date value: ${value}`);
    }
    return date.toISOString().slice(0, 10);
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  throw new Error(`Unsupported date value: ${value}`);
}

export function normalizeRecord(record: Record<string, unknown>): QuietHoursRecord {
  const templateInput =
    typeof record.templates === "object" && record.templates !== null
      ? (record.templates as Record<string, unknown>)
      : {};

  const candidate = {
    ...record,
    country: String(record.country ?? "").toUpperCase(),
    region: String(record.region ?? ""),
    city: String(record.city ?? ""),
    country_slug: slugify(String(record.country_slug ?? record.country ?? "")),
    region_slug: slugify(String(record.region_slug ?? record.region ?? "")),
    city_slug: slugify(String(record.city_slug ?? record.city ?? "")),
    residential_decibel_limit_day: toOptionalNumber(record.residential_decibel_limit_day),
    residential_decibel_limit_night: toOptionalNumber(record.residential_decibel_limit_night),
    first_offense_fine: toOptionalNumber(record.first_offense_fine),
    lat: toOptionalNumber(record.lat),
    lng: toOptionalNumber(record.lng),
    tips: toTips(record.tips),
    templates: {
      neighbor_message: String(
        templateInput.neighbor_message ??
          (record as Record<string, unknown>).neighbor_message ??
          "",
      ),
      landlord_message: String(
        templateInput.landlord_message ??
          (record as Record<string, unknown>).landlord_message ??
          "",
      ),
    },
    last_verified: normalizeDate(record.last_verified),
  };

  const parsed = QuietHoursRecordSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}

async function fileExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function loadJsonDataset(): Promise<DatasetCache> {
  const raw = await fs.readFile(JSON_PATH, "utf-8");
  const parsed = JSON.parse(raw) as Record<string, unknown>[];
  const dataset = QuietHoursDatasetSchema.parse(parsed.map((entry) => normalizeRecord(entry)));
  return { dataset, source: "json" };
}

async function loadCsvDataset(): Promise<DatasetCache> {
  const raw = await fs.readFile(CSV_PATH, "utf-8");
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, unknown>[];

  const dataset = QuietHoursDatasetSchema.parse(records.map((entry) => normalizeRecord(entry)));
  return { dataset, source: "csv" };
}

async function ensureDataset(): Promise<DatasetCache> {
  if (!datasetPromise) {
    datasetPromise = (async () => {
      const jsonExists = await fileExists(JSON_PATH);
      if (jsonExists) {
        return loadJsonDataset();
      }
      const csvExists = await fileExists(CSV_PATH);
      if (csvExists) {
        return loadCsvDataset();
      }
      throw new Error("No data source found: expected quiet_hours.json or quiet_hours.csv");
    })();
  }
  return datasetPromise;
}

async function ensureSlugIndex(): Promise<SlugIndex> {
  if (!slugIndexPromise) {
    slugIndexPromise = (async () => {
      const hasPrebuiltIndex = await fileExists(SLUG_INDEX_PATH);
      if (hasPrebuiltIndex) {
        const fileData = await fs.readFile(SLUG_INDEX_PATH, "utf-8");
        return JSON.parse(fileData) as SlugIndex;
      }

      const { dataset } = await ensureDataset();
      const index: SlugIndex = {};
      for (const entry of dataset) {
        const key = buildSlugKey(entry.country_slug, entry.region_slug, entry.city_slug);
        index[key] = {
          country: entry.country,
          region: entry.region,
          city: entry.city,
          country_slug: entry.country_slug,
          region_slug: entry.region_slug,
          city_slug: entry.city_slug,
          last_verified: entry.last_verified,
        };
      }
      return index;
    })();
  }
  return slugIndexPromise;
}

export async function getDataset(): Promise<{ records: QuietHoursDataset; source: DataSource }> {
  const { dataset, source } = await ensureDataset();
  return { records: dataset, source };
}

export async function getSlugIndex(): Promise<SlugIndex> {
  return ensureSlugIndex();
}

export async function getCityRecord(params: {
  countrySlug: string;
  regionSlug: string;
  citySlug: string;
}): Promise<QuietHoursRecord | undefined> {
  const key = buildSlugKey(params.countrySlug, params.regionSlug, params.citySlug);
  const index = await ensureSlugIndex();
  if (!index[key]) {
    return undefined;
  }
  const { dataset } = await ensureDataset();
  return dataset.find(
    (record) =>
      record.country_slug === params.countrySlug &&
      record.region_slug === params.regionSlug &&
      record.city_slug === params.citySlug,
  );
}

export async function getAllCityParams(): Promise<
  Array<{ countrySlug: string; regionSlug: string; citySlug: string }>
> {
  const { dataset } = await ensureDataset();
  return dataset.map((record) => ({
    countrySlug: record.country_slug,
    regionSlug: record.region_slug,
    citySlug: record.city_slug,
  }));
}

export async function getCountries(): Promise<
  Array<{ country: string; countrySlug: string; lastVerified: string }>
> {
  const { dataset } = await ensureDataset();
  const grouped = new Map<string, { country: string; lastVerified: string }>();
  for (const record of dataset) {
    const existing = grouped.get(record.country_slug);
    if (!existing) {
      grouped.set(record.country_slug, {
        country: record.country,
        lastVerified: record.last_verified,
      });
      continue;
    }
    if (record.last_verified > existing.lastVerified) {
      grouped.set(record.country_slug, {
        country: record.country,
        lastVerified: record.last_verified,
      });
    }
  }
  return Array.from(grouped.entries())
    .map(([countrySlug, { country, lastVerified }]) => ({
      country,
      countrySlug,
      lastVerified,
    }))
    .sort((a, b) => a.country.localeCompare(b.country));
}

export async function getRegionsByCountry(countrySlug: string): Promise<
  Array<{ region: string; regionSlug: string; lastVerified: string }>
> {
  const { dataset } = await ensureDataset();
  const regions = new Map<string, { region: string; lastVerified: string }>();
  for (const record of dataset.filter((item) => item.country_slug === countrySlug)) {
    const existing = regions.get(record.region_slug);
    if (!existing || record.last_verified > existing.lastVerified) {
      regions.set(record.region_slug, {
        region: record.region,
        lastVerified: record.last_verified,
      });
    }
  }
  return Array.from(regions.entries())
    .map(([regionSlug, { region, lastVerified }]) => ({
      region,
      regionSlug,
      lastVerified,
    }))
    .sort((a, b) => a.region.localeCompare(b.region));
}

export async function getCitiesByRegion(countrySlug: string, regionSlug: string): Promise<
  Array<{ city: string; citySlug: string; lastVerified: string }>
> {
  const { dataset } = await ensureDataset();
  return dataset
    .filter(
      (record) => record.country_slug === countrySlug && record.region_slug === regionSlug,
    )
    .map((record) => ({
      city: record.city,
      citySlug: record.city_slug,
      lastVerified: record.last_verified,
    }))
    .sort((a, b) => a.city.localeCompare(b.city));
}

export async function getSearchIndex(): Promise<
  Array<{ city: string; region: string; country: string; path: string }>
> {
  const { dataset } = await ensureDataset();
  return dataset.map((record) => ({
    city: record.city,
    region: record.region,
    country: record.country,
    path: `/${record.country_slug}/${record.region_slug}/${record.city_slug}`,
  }));
}

export async function getCanonicalPathForCity(entry: SlugIndexEntry): Promise<string> {
  return `/${entry.country_slug}/${entry.region_slug}/${entry.city_slug}`;
}

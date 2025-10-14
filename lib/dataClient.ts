import { promises as fs } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

import { buildSlugKey, slugify } from "@/lib/slug";
import {
  BaseTopicRecordSchema,
  BulkTrashDataset,
  BulkTrashDatasetSchema,
  BulkTrashRecord,
  BulkTrashRecordSchema,
  DataSource,
  FireworksDataset,
  FireworksDatasetSchema,
  FireworksRecord,
  FireworksRecordSchema,
  ParkingRulesDataset,
  ParkingRulesDatasetSchema,
  ParkingRulesRecord,
  ParkingRulesRecordSchema,
  QuietHoursDataset,
  QuietHoursDatasetSchema,
  QuietHoursRecord,
  QuietHoursRecordSchema,
  SlugIndex,
  TopicSlugIndexEntry,
} from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "lib", "data");
const HERO_MAP_PATH = path.join(DATA_DIR, "heroImages.json");

type DatasetCache<TDataset> = {
  dataset: TDataset;
  source: DataSource;
};

type DatasetLoaderOptions<TDataset extends ReadonlyArray<TRecord>, TRecord> = {
  topic: string;
  jsonFilename: string;
  csvFilename: string;
  slugIndexFilename: string;
  normalize: (record: Record<string, unknown>) => TRecord;
  schema: { parse: (value: unknown) => TDataset };
  selectLocation: (record: TRecord) => TopicSlugIndexEntry;
};

type DatasetLoaderResult<TDataset extends ReadonlyArray<TRecord>, TRecord> = {
  ensureDataset: () => Promise<DatasetCache<TDataset>>;
  ensureSlugIndex: () => Promise<SlugIndex>;
  normalize: (record: Record<string, unknown>) => TRecord;
};

const TRUE_VALUES = new Set(["true", "1", "yes", "y", "on"]);
const FALSE_VALUES = new Set(["false", "0", "no", "n", "off"]);

async function fileExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

function normalizeDate(value: unknown): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new Error("last_verified is required");
    }
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid last_verified date value: ${value}`);
    }
    return date.toISOString().slice(0, 10);
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  throw new Error("last_verified must be a string or Date");
}

function maybeString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const stringified = String(value).trim();
  return stringified.length > 0 ? stringified : undefined;
}

function requireString(value: unknown, field: string): string {
  const result = maybeString(value);
  if (!result) {
    throw new Error(`${field} is required`);
  }
  return result;
}

function toOptionalUrl(value: unknown): string | undefined {
  return maybeString(value);
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const normalized = Number(String(value).replace(/[,_\s]/g, ""));
  return Number.isFinite(normalized) ? normalized : undefined;
}

function toBoolean(value: unknown, field: string): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (TRUE_VALUES.has(normalized)) {
      return true;
    }
    if (FALSE_VALUES.has(normalized)) {
      return false;
    }
  }
  throw new Error(`Unable to coerce ${field} into a boolean`);
}

function toBooleanOrVaries(value: unknown, field: string): boolean | "varies" {
  if (typeof value === "string" && value.trim().toLowerCase() === "varies") {
    return "varies";
  }
  return toBoolean(value, field);
}

function toBooleanOrRestricted(value: unknown, field: string): boolean | "restricted" {
  if (typeof value === "string" && value.trim().toLowerCase() === "restricted") {
    return "restricted";
  }
  return toBoolean(value, field);
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => maybeString(item))
      .filter((item): item is string => Boolean(item));
  }
  if (typeof value === "string") {
    const segments = value
      .split(/[\n|,]/u)
      .map((item) => item.trim())
      .filter(Boolean);
    return segments;
  }
  return [];
}

type OverrideKind = "county" | "city";

function toOverrideArray(
  value: unknown,
  kind: OverrideKind,
): Array<{ county?: string; city?: string; rules: string }> | undefined {
  if (!value) {
    return undefined;
  }

  const normalizeEntry = (
    entry: Record<string, unknown>,
  ): { county?: string; city?: string; rules: string } | null => {
    const name = maybeString(entry[kind]);
    const rules = maybeString(entry.rules);
    if (!name || !rules) {
      return null;
    }
    return kind === "county"
      ? { county: name, rules }
      : {
          city: name,
          rules,
        };
  };

  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => (typeof item === "object" && item !== null ? normalizeEntry(item) : null))
      .filter((item): item is { county?: string; city?: string; rules: string } => Boolean(item));
    return normalized.length > 0 ? normalized : undefined;
  }

  if (typeof value === "string") {
    const entries = value
      .split("|")
      .map((segment) => segment.trim())
      .filter(Boolean)
      .map((segment) => {
        const [name, ...rest] = segment.split(":");
        if (!name || rest.length === 0) {
          return null;
        }
        const rules = rest.join(":").trim();
        if (!rules) {
          return null;
        }
        return kind === "county"
          ? { county: name.trim(), rules }
          : { city: name.trim(), rules };
      })
      .filter((item): item is { county?: string; city?: string; rules: string } => Boolean(item));
    return entries.length > 0 ? entries : undefined;
  }

  return undefined;
}

function toTips(value: unknown): string[] {
  const array = toStringArray(value);
  return array.length > 0 ? array : [];
}

type NormalizeBaseOptions = {
  requireCity?: boolean;
  fallbackSourceTitle?: string;
  fallbackSourceUrl?: string;
};

type BaseRecord = TopicSlugIndexEntry & {
  timezone: string;
  source_title: string;
  source_url: string;
  complaint_channel?: string;
  complaint_url?: string;
  fine_range?: string;
  notes_admin?: string;
};

function normalizeBaseRecord(
  record: Record<string, unknown>,
  { requireCity = false, fallbackSourceTitle, fallbackSourceUrl }: NormalizeBaseOptions = {},
): BaseRecord {
  const country = requireString(record.country, "country").toUpperCase();
  const region = requireString(record.region, "region");
  const city = record.city !== undefined && record.city !== null ? maybeString(record.city) : undefined;

  if (requireCity && !city) {
    throw new Error("city is required for this record");
  }

  const countrySlugSource =
    maybeString(record.country_slug) ??
    maybeString(record.country_name) ??
    (country.length === 2 ? slugify(country) : undefined) ??
    country;
  const regionSlugSource = maybeString(record.region_slug) ?? region;
  const citySlugSource = city ? maybeString(record.city_slug) ?? city : undefined;

  const timezone = requireString(record.timezone, "timezone");
  const sourceTitle = maybeString(record.source_title) ?? fallbackSourceTitle;
  const sourceUrl = maybeString(record.source_url) ?? fallbackSourceUrl;

  if (!sourceTitle || !sourceUrl) {
    throw new Error("source_title and source_url are required");
  }

  const base = {
    country,
    region,
    city: city ?? undefined,
    country_slug: slugify(countrySlugSource),
    region_slug: slugify(regionSlugSource),
    city_slug: citySlugSource ? slugify(citySlugSource) : undefined,
    timezone,
    last_verified: normalizeDate(record.last_verified),
    source_title: sourceTitle,
    source_url: sourceUrl,
    complaint_channel: maybeString(record.complaint_channel),
    complaint_url: toOptionalUrl(record.complaint_url),
    fine_range: maybeString(record.fine_range),
    notes_admin: maybeString(record.notes_admin),
  };

  const parsed = BaseTopicRecordSchema.safeParse(base);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data as BaseRecord;
}

function createDatasetLoader<TDataset extends ReadonlyArray<TRecord>, TRecord>({
  topic,
  jsonFilename,
  csvFilename,
  slugIndexFilename,
  normalize,
  schema,
  selectLocation,
}: DatasetLoaderOptions<TDataset, TRecord>): DatasetLoaderResult<TDataset, TRecord> {
  const jsonPath = path.join(DATA_DIR, jsonFilename);
  const csvPath = path.join(DATA_DIR, csvFilename);
  const slugIndexPath = path.join(DATA_DIR, slugIndexFilename);

  let datasetPromise: Promise<DatasetCache<TDataset>> | null = null;
  let slugIndexPromise: Promise<SlugIndex> | null = null;

  async function loadJsonDataset(): Promise<DatasetCache<TDataset>> {
    const raw = await fs.readFile(jsonPath, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    const dataset = schema.parse(parsed.map((entry) => normalize(entry)));
    return { dataset, source: "json" };
  }

  async function loadCsvDataset(): Promise<DatasetCache<TDataset>> {
    const raw = await fs.readFile(csvPath, "utf-8");
    const records = parse(raw, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, unknown>[];
    const dataset = schema.parse(records.map((entry) => normalize(entry)));
    return { dataset, source: "csv" };
  }

  async function ensureDataset(): Promise<DatasetCache<TDataset>> {
    if (!datasetPromise) {
      datasetPromise = (async () => {
        if (await fileExists(jsonPath)) {
          return loadJsonDataset();
        }
        if (await fileExists(csvPath)) {
          return loadCsvDataset();
        }
        throw new Error(
          `No data source found for ${topic}: expected ${jsonFilename} or ${csvFilename}`,
        );
      })();
    }
    return datasetPromise;
  }

  async function ensureSlugIndex(): Promise<SlugIndex> {
    if (!slugIndexPromise) {
      slugIndexPromise = (async () => {
        if (await fileExists(slugIndexPath)) {
          const fileData = await fs.readFile(slugIndexPath, "utf-8");
          return JSON.parse(fileData) as SlugIndex;
        }

        const { dataset } = await ensureDataset();
        const index: SlugIndex = {};
        for (const entry of dataset) {
          const location = selectLocation(entry);
          const key = buildSlugKey(location.country_slug, location.region_slug, location.city_slug);
          index[key] = location;
        }
        return index;
      })();
    }
    return slugIndexPromise;
  }

  return {
    ensureDataset,
    ensureSlugIndex,
    normalize,
  };
}

export function normalizeRecord(record: Record<string, unknown>): QuietHoursRecord {
  const base = normalizeBaseRecord(record, {
    requireCity: true,
    fallbackSourceTitle: maybeString(record.bylaw_title),
    fallbackSourceUrl: maybeString(record.bylaw_url),
  });

  const templateInput =
    typeof record.templates === "object" && record.templates !== null
      ? (record.templates as Record<string, unknown>)
      : {};

  const candidate = {
    ...base,
    default_quiet_hours: requireString(record.default_quiet_hours, "default_quiet_hours"),
    weekend_quiet_hours: maybeString(record.weekend_quiet_hours),
    holiday_quiet_hours: maybeString(record.holiday_quiet_hours),
    residential_decibel_limit_day: toOptionalNumber(record.residential_decibel_limit_day),
    residential_decibel_limit_night: toOptionalNumber(record.residential_decibel_limit_night),
    construction_hours_weekday: requireString(
      record.construction_hours_weekday,
      "construction_hours_weekday",
    ),
    construction_hours_weekend: requireString(
      record.construction_hours_weekend,
      "construction_hours_weekend",
    ),
    lawn_equipment_hours: requireString(record.lawn_equipment_hours, "lawn_equipment_hours"),
    party_music_rules: requireString(record.party_music_rules, "party_music_rules"),
    complaint_channel:
      maybeString(record.complaint_channel) ?? base.complaint_channel ?? "Not specified",
    complaint_url: requireString(record.complaint_url ?? base.complaint_url, "complaint_url"),
    fine_range: requireString(record.fine_range ?? base.fine_range, "fine_range"),
    first_offense_fine: toOptionalNumber(record.first_offense_fine),
    bylaw_title: requireString(record.bylaw_title, "bylaw_title"),
    bylaw_url: requireString(record.bylaw_url, "bylaw_url"),
    tips: toTips(record.tips),
    templates: {
      neighbor_message: requireString(
        templateInput.neighbor_message ??
          (record as Record<string, unknown>).neighbor_message,
        "templates.neighbor_message",
      ),
      landlord_message: requireString(
        templateInput.landlord_message ??
          (record as Record<string, unknown>).landlord_message,
        "templates.landlord_message",
      ),
    },
    lat: toOptionalNumber(record.lat),
    lng: toOptionalNumber(record.lng),
    hero_image_url: toOptionalUrl(record.hero_image_url),
  };

  const parsed = QuietHoursRecordSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}

export function normalizeParkingRecord(record: Record<string, unknown>): ParkingRulesRecord {
  const base = normalizeBaseRecord(record, { requireCity: true });
  const candidate = {
    ...base,
    overnight_parking_allowed: toBooleanOrVaries(
      record.overnight_parking_allowed,
      "overnight_parking_allowed",
    ),
    overnight_hours: requireString(record.overnight_hours, "overnight_hours"),
    permit_required: toBoolean(record.permit_required, "permit_required"),
    permit_url: toOptionalUrl(record.permit_url),
    winter_ban: toBoolean(record.winter_ban, "winter_ban"),
    winter_ban_months: requireString(record.winter_ban_months, "winter_ban_months"),
    winter_ban_hours: requireString(record.winter_ban_hours, "winter_ban_hours"),
    snow_emergency_rules: requireString(record.snow_emergency_rules, "snow_emergency_rules"),
    towing_enforced: toBoolean(record.towing_enforced, "towing_enforced"),
    tow_zones_map_url: toOptionalUrl(record.tow_zones_map_url),
    ticket_amounts: requireString(record.ticket_amounts, "ticket_amounts"),
    notes_public: maybeString(record.notes_public),
  };
  const parsed = ParkingRulesRecordSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}

export function normalizeBulkTrashRecord(record: Record<string, unknown>): BulkTrashRecord {
  const base = normalizeBaseRecord(record, { requireCity: true });
  const eligibleItems = toStringArray(record.eligible_items);
  const notAccepted = toStringArray(record.not_accepted_items);

  if (eligibleItems.length === 0) {
    throw new Error("eligible_items must include at least one entry");
  }
  if (notAccepted.length === 0) {
    throw new Error("not_accepted_items must include at least one entry");
  }

  const candidate = {
    ...base,
    service_type: requireString(record.service_type, "service_type") as BulkTrashRecord["service_type"],
    schedule_pattern: requireString(record.schedule_pattern, "schedule_pattern"),
    request_url: toOptionalUrl(record.request_url),
    eligible_items: eligibleItems,
    not_accepted_items: notAccepted,
    limits: requireString(record.limits, "limits"),
    fees: requireString(record.fees, "fees"),
    holiday_shifts: requireString(record.holiday_shifts, "holiday_shifts"),
    illegal_dumping_reporting: requireString(
      record.illegal_dumping_reporting,
      "illegal_dumping_reporting",
    ),
    notes_public: maybeString(record.notes_public),
  };

  const parsed = BulkTrashRecordSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}

function toJurisdictionLevel(value: unknown): FireworksRecord["jurisdiction_level"] {
  const raw = requireString(value, "jurisdiction_level").toLowerCase();
  if (raw === "state" || raw === "county" || raw === "city") {
    return raw;
  }
  throw new Error("jurisdiction_level must be state, county, or city");
}

export function normalizeFireworksRecord(record: Record<string, unknown>): FireworksRecord {
  const jurisdictionLevel = toJurisdictionLevel(record.jurisdiction_level);
  const base = normalizeBaseRecord(record, {
    requireCity: jurisdictionLevel === "city",
  });

  const candidate = {
    ...base,
    jurisdiction_level: jurisdictionLevel,
    allowed_consumer_fireworks: toBooleanOrRestricted(
      record.allowed_consumer_fireworks,
      "allowed_consumer_fireworks",
    ),
    sale_periods: requireString(record.sale_periods, "sale_periods"),
    use_hours: requireString(record.use_hours, "use_hours"),
    permit_required: toBoolean(record.permit_required, "permit_required"),
    age_restrictions: requireString(record.age_restrictions, "age_restrictions"),
    prohibited_types: toStringArray(record.prohibited_types),
    fine_range: maybeString(record.fine_range) ?? base.fine_range,
    enforcement_notes: requireString(record.enforcement_notes, "enforcement_notes"),
    county_overrides: toOverrideArray(record.county_overrides, "county"),
    city_overrides: toOverrideArray(record.city_overrides, "city"),
    notes_public: maybeString(record.notes_public),
  };

  if (candidate.prohibited_types.length === 0) {
    throw new Error("prohibited_types must include at least one entry");
  }

  const parsed = FireworksRecordSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}

const quietHoursLoader = createDatasetLoader<QuietHoursDataset, QuietHoursRecord>({
  topic: "quiet hours",
  jsonFilename: "quiet_hours.json",
  csvFilename: "quiet_hours.csv",
  slugIndexFilename: "quietHoursSlugIndex.json",
  normalize: normalizeRecord,
  schema: QuietHoursDatasetSchema,
  selectLocation: (record) => ({
    country: record.country,
    region: record.region,
    city: record.city,
    country_slug: record.country_slug,
    region_slug: record.region_slug,
    city_slug: record.city_slug,
    last_verified: record.last_verified,
  }),
});

const parkingLoader = createDatasetLoader<ParkingRulesDataset, ParkingRulesRecord>({
  topic: "parking rules",
  jsonFilename: "parking_rules.json",
  csvFilename: "parking_rules.csv",
  slugIndexFilename: "parkingSlugIndex.json",
  normalize: normalizeParkingRecord,
  schema: ParkingRulesDatasetSchema,
  selectLocation: (record) => ({
    country: record.country,
    region: record.region,
    city: record.city,
    country_slug: record.country_slug,
    region_slug: record.region_slug,
    city_slug: record.city_slug,
    last_verified: record.last_verified,
  }),
});

const bulkTrashLoader = createDatasetLoader<BulkTrashDataset, BulkTrashRecord>({
  topic: "bulk trash",
  jsonFilename: "bulk_trash.json",
  csvFilename: "bulk_trash.csv",
  slugIndexFilename: "bulkTrashSlugIndex.json",
  normalize: normalizeBulkTrashRecord,
  schema: BulkTrashDatasetSchema,
  selectLocation: (record) => ({
    country: record.country,
    region: record.region,
    city: record.city,
    country_slug: record.country_slug,
    region_slug: record.region_slug,
    city_slug: record.city_slug,
    last_verified: record.last_verified,
  }),
});

const fireworksLoader = createDatasetLoader<FireworksDataset, FireworksRecord>({
  topic: "fireworks",
  jsonFilename: "fireworks.json",
  csvFilename: "fireworks.csv",
  slugIndexFilename: "fireworksSlugIndex.json",
  normalize: normalizeFireworksRecord,
  schema: FireworksDatasetSchema,
  selectLocation: (record) => ({
    country: record.country,
    region: record.region,
    city: record.city,
    country_slug: record.country_slug,
    region_slug: record.region_slug,
    city_slug: record.city_slug,
    last_verified: record.last_verified,
  }),
});

export async function getDataset(): Promise<{ records: QuietHoursDataset; source: DataSource }> {
  const { dataset, source } = await quietHoursLoader.ensureDataset();
  return { records: dataset, source };
}

export async function getSlugIndex(): Promise<SlugIndex> {
  return quietHoursLoader.ensureSlugIndex();
}

export async function getCityRecord(params: {
  countrySlug: string;
  regionSlug: string;
  citySlug: string;
}): Promise<QuietHoursRecord | undefined> {
  const { dataset } = await quietHoursLoader.ensureDataset();
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
  const { dataset } = await quietHoursLoader.ensureDataset();
  return dataset.map((record) => ({
    countrySlug: record.country_slug,
    regionSlug: record.region_slug,
    citySlug: record.city_slug,
  }));
}

type CountrySummary = {
  country: string;
  countrySlug: string;
  count: number;
  lastVerified: string;
};

type RegionSummary = {
  region: string;
  regionSlug: string;
  count: number;
  lastVerified: string;
};

type CitySummary = {
  city: string;
  citySlug: string;
  lastVerified: string;
};

export type TopicId = "quiet-hours" | "parking-rules" | "bulk-trash" | "fireworks";

function summarizeCountries(records: TopicSlugIndexEntry[]): CountrySummary[] {
  const grouped = new Map<string, CountrySummary>();
  for (const record of records) {
    const existing = grouped.get(record.country_slug);
    if (!existing) {
      grouped.set(record.country_slug, {
        country: record.country,
        countrySlug: record.country_slug,
        count: 1,
        lastVerified: record.last_verified,
      });
      continue;
    }
    existing.count += 1;
    if (record.last_verified > existing.lastVerified) {
      existing.lastVerified = record.last_verified;
    }
  }
  return Array.from(grouped.values()).sort((a, b) => a.country.localeCompare(b.country));
}

function summarizeRegions(records: TopicSlugIndexEntry[], countrySlug: string): RegionSummary[] {
  const grouped = new Map<string, RegionSummary>();
  for (const record of records) {
    if (record.country_slug !== countrySlug) {
      continue;
    }
    const existing = grouped.get(record.region_slug);
    if (!existing) {
      grouped.set(record.region_slug, {
        region: record.region,
        regionSlug: record.region_slug,
        count: 1,
        lastVerified: record.last_verified,
      });
      continue;
    }
    existing.count += 1;
    if (record.last_verified > existing.lastVerified) {
      existing.lastVerified = record.last_verified;
    }
  }
  return Array.from(grouped.values()).sort((a, b) => a.region.localeCompare(b.region));
}

function summarizeCities(
  records: TopicSlugIndexEntry[],
  countrySlug: string,
  regionSlug: string,
): CitySummary[] {
  return records
    .filter(
      (record) =>
        record.country_slug === countrySlug &&
        record.region_slug === regionSlug &&
        Boolean(record.city) &&
        Boolean(record.city_slug),
    )
    .map((record) => ({
      city: record.city ?? "",
      citySlug: record.city_slug ?? "",
      lastVerified: record.last_verified,
    }))
    .sort((a, b) => a.city.localeCompare(b.city));
}

export async function getCountries(): Promise<
  Array<{ country: string; countrySlug: string; lastVerified: string }>
> {
  const { dataset } = await quietHoursLoader.ensureDataset();
  const summaries = summarizeCountries(
    dataset.map((record) => ({
      country: record.country,
      region: record.region,
      city: record.city,
      country_slug: record.country_slug,
      region_slug: record.region_slug,
      city_slug: record.city_slug,
      last_verified: record.last_verified,
    })),
  );
  return summaries.map(({ country, countrySlug, lastVerified }) => ({
    country,
    countrySlug,
    lastVerified,
  }));
}

export async function getRegionsByCountry(countrySlug: string): Promise<
  Array<{ region: string; regionSlug: string; lastVerified: string }>
> {
  const { dataset } = await quietHoursLoader.ensureDataset();
  const summaries = summarizeRegions(
    dataset.map((record) => ({
      country: record.country,
      region: record.region,
      city: record.city,
      country_slug: record.country_slug,
      region_slug: record.region_slug,
      city_slug: record.city_slug,
      last_verified: record.last_verified,
    })),
    countrySlug,
  );
  return summaries.map(({ region, regionSlug, lastVerified }) => ({
    region,
    regionSlug,
    lastVerified,
  }));
}

export async function getCitiesByRegion(
  countrySlug: string,
  regionSlug: string,
): Promise<Array<{ city: string; citySlug: string; lastVerified: string }>> {
  const { dataset } = await quietHoursLoader.ensureDataset();
  return summarizeCities(
    dataset.map((record) => ({
      country: record.country,
      region: record.region,
      city: record.city,
      country_slug: record.country_slug,
      region_slug: record.region_slug,
      city_slug: record.city_slug,
      last_verified: record.last_verified,
    })),
    countrySlug,
    regionSlug,
  );
}

export async function getSearchIndex(): Promise<
  Array<{ city: string; region: string; country: string; path: string }>
> {
  const { dataset } = await quietHoursLoader.ensureDataset();
  return dataset.map((record) => ({
    city: record.city,
    region: record.region,
    country: record.country,
    path: `/${record.country_slug}/${record.region_slug}/${record.city_slug}`,
  }));
}

export function getCanonicalPathForCity(entry: TopicSlugIndexEntry): string {
  if (!entry.city_slug) {
    throw new Error("city_slug is required to build canonical city path");
  }
  return `/${entry.country_slug}/${entry.region_slug}/${entry.city_slug}`;
}

export async function getParkingDataset(): Promise<{
  records: ParkingRulesDataset;
  source: DataSource;
}> {
  const { dataset, source } = await parkingLoader.ensureDataset();
  return { records: dataset, source };
}

export async function getBulkTrashDataset(): Promise<{
  records: BulkTrashDataset;
  source: DataSource;
}> {
  const { dataset, source } = await bulkTrashLoader.ensureDataset();
  return { records: dataset, source };
}

export async function getFireworksDataset(): Promise<{
  records: FireworksDataset;
  source: DataSource;
}> {
  const { dataset, source } = await fireworksLoader.ensureDataset();
  return { records: dataset, source };
}

export async function getParkingBySlug(params: {
  countrySlug: string;
  regionSlug: string;
  citySlug: string;
}): Promise<ParkingRulesRecord | undefined> {
  const { dataset } = await parkingLoader.ensureDataset();
  return dataset.find(
    (record) =>
      record.country_slug === params.countrySlug &&
      record.region_slug === params.regionSlug &&
      record.city_slug === params.citySlug,
  );
}

export async function getBulkTrashBySlug(params: {
  countrySlug: string;
  regionSlug: string;
  citySlug: string;
}): Promise<BulkTrashRecord | undefined> {
  const { dataset } = await bulkTrashLoader.ensureDataset();
  return dataset.find(
    (record) =>
      record.country_slug === params.countrySlug &&
      record.region_slug === params.regionSlug &&
      record.city_slug === params.citySlug,
  );
}

export async function getFireworksBySlug(params: {
  countrySlug: string;
  regionSlug: string;
  citySlug?: string;
}): Promise<FireworksRecord | undefined> {
  const { dataset } = await fireworksLoader.ensureDataset();
  return dataset.find(
    (record) =>
      record.country_slug === params.countrySlug &&
      record.region_slug === params.regionSlug &&
      (params.citySlug ? record.city_slug === params.citySlug : !record.city_slug),
  );
}

export async function listParkingParams(): Promise<
  Array<{ countrySlug: string; regionSlug: string; citySlug: string }>
> {
  const { dataset } = await parkingLoader.ensureDataset();
  return dataset.map((record) => ({
    countrySlug: record.country_slug,
    regionSlug: record.region_slug,
    citySlug: record.city_slug,
  }));
}

export async function listBulkTrashParams(): Promise<
  Array<{ countrySlug: string; regionSlug: string; citySlug: string }>
> {
  const { dataset } = await bulkTrashLoader.ensureDataset();
  return dataset.map((record) => ({
    countrySlug: record.country_slug,
    regionSlug: record.region_slug,
    citySlug: record.city_slug,
  }));
}

export type FireworksParam = {
  countrySlug: string;
  regionSlug: string;
  citySlug?: string;
  jurisdictionLevel: FireworksRecord["jurisdiction_level"];
};

export async function listFireworksParams(): Promise<FireworksParam[]> {
  const { dataset } = await fireworksLoader.ensureDataset();
  return dataset.map((record) => ({
    countrySlug: record.country_slug,
    regionSlug: record.region_slug,
    citySlug: record.city_slug,
    jurisdictionLevel: record.jurisdiction_level,
  }));
}

export async function getParkingCountries(): Promise<CountrySummary[]> {
  const { dataset } = await parkingLoader.ensureDataset();
  return summarizeCountries(
    dataset.map((record) => ({
      country: record.country,
      region: record.region,
      city: record.city,
      country_slug: record.country_slug,
      region_slug: record.region_slug,
      city_slug: record.city_slug,
      last_verified: record.last_verified,
    })),
  );
}

export async function getParkingRegionsByCountry(countrySlug: string): Promise<RegionSummary[]> {
  const { dataset } = await parkingLoader.ensureDataset();
  return summarizeRegions(
    dataset.map((record) => ({
      country: record.country,
      region: record.region,
      city: record.city,
      country_slug: record.country_slug,
      region_slug: record.region_slug,
      city_slug: record.city_slug,
      last_verified: record.last_verified,
    })),
    countrySlug,
  );
}

export async function getParkingCitiesByRegion(
  countrySlug: string,
  regionSlug: string,
): Promise<CitySummary[]> {
  const { dataset } = await parkingLoader.ensureDataset();
  return summarizeCities(
    dataset.map((record) => ({
      country: record.country,
      region: record.region,
      city: record.city,
      country_slug: record.country_slug,
      region_slug: record.region_slug,
      city_slug: record.city_slug,
      last_verified: record.last_verified,
    })),
    countrySlug,
    regionSlug,
  );
}

export async function getBulkTrashCountries(): Promise<CountrySummary[]> {
  const { dataset } = await bulkTrashLoader.ensureDataset();
  return summarizeCountries(
    dataset.map((record) => ({
      country: record.country,
      region: record.region,
      city: record.city,
      country_slug: record.country_slug,
      region_slug: record.region_slug,
      city_slug: record.city_slug,
      last_verified: record.last_verified,
    })),
  );
}

export async function getBulkTrashRegionsByCountry(countrySlug: string): Promise<RegionSummary[]> {
  const { dataset } = await bulkTrashLoader.ensureDataset();
  return summarizeRegions(
    dataset.map((record) => ({
      country: record.country,
      region: record.region,
      city: record.city,
      country_slug: record.country_slug,
      region_slug: record.region_slug,
      city_slug: record.city_slug,
      last_verified: record.last_verified,
    })),
    countrySlug,
  );
}

export async function getBulkTrashCitiesByRegion(
  countrySlug: string,
  regionSlug: string,
): Promise<CitySummary[]> {
  const { dataset } = await bulkTrashLoader.ensureDataset();
  return summarizeCities(
    dataset.map((record) => ({
      country: record.country,
      region: record.region,
      city: record.city,
      country_slug: record.country_slug,
      region_slug: record.region_slug,
      city_slug: record.city_slug,
      last_verified: record.last_verified,
    })),
    countrySlug,
    regionSlug,
  );
}

type FireworksRegionSummary = RegionSummary & {
  hasStateRule: boolean;
  cityCount: number;
};

export async function getFireworksCountries(): Promise<CountrySummary[]> {
  const { dataset } = await fireworksLoader.ensureDataset();
  return summarizeCountries(
    dataset.map((record) => ({
      country: record.country,
      region: record.region,
      city: record.city,
      country_slug: record.country_slug,
      region_slug: record.region_slug,
      city_slug: record.city_slug,
      last_verified: record.last_verified,
    })),
  );
}

export async function getFireworksRegionsByCountry(countrySlug: string): Promise<
  FireworksRegionSummary[]
> {
  const { dataset } = await fireworksLoader.ensureDataset();
  const regionSummaries = summarizeRegions(
    dataset.map((record) => ({
      country: record.country,
      region: record.region,
      city: record.city,
      country_slug: record.country_slug,
      region_slug: record.region_slug,
      city_slug: record.city_slug,
      last_verified: record.last_verified,
    })),
    countrySlug,
  );

  const cityCounts = new Map<string, number>();
  const statePresence = new Set<string>();

  dataset
    .filter((record) => record.country_slug === countrySlug)
    .forEach((record) => {
      const key = record.region_slug;
      if (record.jurisdiction_level === "state" || !record.city_slug) {
        statePresence.add(key);
      }
      if (record.jurisdiction_level === "city" && record.city_slug) {
        cityCounts.set(key, (cityCounts.get(key) ?? 0) + 1);
      }
    });

  return regionSummaries.map((summary) => ({
    ...summary,
    hasStateRule: statePresence.has(summary.regionSlug),
    cityCount: cityCounts.get(summary.regionSlug) ?? 0,
  }));
}

export async function getFireworksCitiesByRegion(
  countrySlug: string,
  regionSlug: string,
): Promise<CitySummary[]> {
  const { dataset } = await fireworksLoader.ensureDataset();
  return summarizeCities(
    dataset
      .filter((record) => record.jurisdiction_level === "city")
      .map((record) => ({
        country: record.country,
        region: record.region,
        city: record.city ?? "",
        country_slug: record.country_slug,
        region_slug: record.region_slug,
        city_slug: record.city_slug,
        last_verified: record.last_verified,
      })),
    countrySlug,
    regionSlug,
  );
}

export async function getParkingSlugIndex(): Promise<SlugIndex> {
  return parkingLoader.ensureSlugIndex();
}

export async function getBulkTrashSlugIndex(): Promise<SlugIndex> {
  return bulkTrashLoader.ensureSlugIndex();
}

export async function getFireworksSlugIndex(): Promise<SlugIndex> {
  return fireworksLoader.ensureSlugIndex();
}

export type TopicNavEntry = {
  topic: TopicId;
  label: string;
  href: string;
  level: "city" | "region";
  lastVerified: string;
};

const TOPIC_LABELS: Record<TopicId, string> = {
  "quiet-hours": "Quiet Hours",
  "parking-rules": "Parking",
  "bulk-trash": "Bulk Trash",
  fireworks: "Fireworks",
};

export async function getTopicNavEntries({
  countrySlug,
  regionSlug,
  citySlug,
}: {
  countrySlug: string;
  regionSlug: string;
  citySlug?: string;
}): Promise<TopicNavEntry[]> {
  const entries: TopicNavEntry[] = [];

  if (citySlug) {
    const [quiet, parking, bulk, fireworksCity] = await Promise.all([
      getCityRecord({ countrySlug, regionSlug, citySlug }),
      getParkingBySlug({ countrySlug, regionSlug, citySlug }),
      getBulkTrashBySlug({ countrySlug, regionSlug, citySlug }),
      getFireworksBySlug({ countrySlug, regionSlug, citySlug }),
    ]);

    if (quiet) {
      entries.push({
        topic: "quiet-hours",
        label: TOPIC_LABELS["quiet-hours"],
        href: `/${countrySlug}/${regionSlug}/${citySlug}`,
        level: "city",
        lastVerified: quiet.last_verified,
      });
    }

    if (parking) {
      entries.push({
        topic: "parking-rules",
        label: TOPIC_LABELS["parking-rules"],
        href: `/parking-rules/${countrySlug}/${regionSlug}/${citySlug}`,
        level: "city",
        lastVerified: parking.last_verified,
      });
    }

    if (bulk) {
      entries.push({
        topic: "bulk-trash",
        label: TOPIC_LABELS["bulk-trash"],
        href: `/bulk-trash/${countrySlug}/${regionSlug}/${citySlug}`,
        level: "city",
        lastVerified: bulk.last_verified,
      });
    }

    if (fireworksCity) {
      entries.push({
        topic: "fireworks",
        label: TOPIC_LABELS.fireworks,
        href: `/fireworks/${countrySlug}/${regionSlug}/${citySlug}`,
        level: "city",
        lastVerified: fireworksCity.last_verified,
      });
    } else {
      const fireworksRegion = await getFireworksBySlug({ countrySlug, regionSlug });
      if (fireworksRegion) {
        entries.push({
          topic: "fireworks",
          label: TOPIC_LABELS.fireworks,
          href: `/fireworks/${countrySlug}/${regionSlug}`,
          level: "region",
          lastVerified: fireworksRegion.last_verified,
        });
      }
    }
    return entries;
  }

  const fireworksRegion = await getFireworksBySlug({ countrySlug, regionSlug });
  if (fireworksRegion) {
    entries.push({
      topic: "fireworks",
      label: TOPIC_LABELS.fireworks,
      href: `/fireworks/${countrySlug}/${regionSlug}`,
      level: "region",
      lastVerified: fireworksRegion.last_verified,
    });
  }

  const quietHoursRegions = await getRegionsByCountry(countrySlug);
  const regionEntry = quietHoursRegions.find((region) => region.regionSlug === regionSlug);
  if (regionEntry) {
    entries.unshift({
      topic: "quiet-hours",
      label: TOPIC_LABELS["quiet-hours"],
      href: `/${countrySlug}/${regionSlug}`,
      level: "region",
      lastVerified: regionEntry.lastVerified,
    });
  }

  return entries;
}

export type TopicSearchEntry = {
  topic: TopicId;
  country: string;
  region: string;
  city?: string;
  path: string;
  lastVerified: string;
  label: string;
  level: "city" | "region";
  jurisdictionLevel?: FireworksRecord["jurisdiction_level"];
};

export async function getTopicSearchIndex(): Promise<TopicSearchEntry[]> {
  const [quiet, parking, bulk, fireworks] = await Promise.all([
    getDataset(),
    getParkingDataset(),
    getBulkTrashDataset(),
    getFireworksDataset(),
  ]);

  const quietEntries: TopicSearchEntry[] = quiet.records.map((record) => ({
    topic: "quiet-hours",
    country: record.country,
    region: record.region,
    city: record.city,
    path: `/${record.country_slug}/${record.region_slug}/${record.city_slug}`,
    lastVerified: record.last_verified,
    label: `${record.city}, ${record.region}`,
    level: "city",
  }));

  const parkingEntries: TopicSearchEntry[] = parking.records.map((record) => ({
    topic: "parking-rules",
    country: record.country,
    region: record.region,
    city: record.city,
    path: `/parking-rules/${record.country_slug}/${record.region_slug}/${record.city_slug}`,
    lastVerified: record.last_verified,
    label: `${record.city}, ${record.region}`,
    level: "city",
  }));

  const bulkEntries: TopicSearchEntry[] = bulk.records.map((record) => ({
    topic: "bulk-trash",
    country: record.country,
    region: record.region,
    city: record.city,
    path: `/bulk-trash/${record.country_slug}/${record.region_slug}/${record.city_slug}`,
    lastVerified: record.last_verified,
    label: `${record.city}, ${record.region}`,
    level: "city",
  }));

  const fireworksEntries: TopicSearchEntry[] = fireworks.records.map((record) => ({
    topic: "fireworks",
    country: record.country,
    region: record.region,
    city: record.city ?? undefined,
    path: record.city_slug
      ? `/fireworks/${record.country_slug}/${record.region_slug}/${record.city_slug}`
      : `/fireworks/${record.country_slug}/${record.region_slug}`,
    lastVerified: record.last_verified,
    label: record.city ? `${record.city}, ${record.region}` : record.region,
    level: record.city ? "city" : "region",
    jurisdictionLevel: record.jurisdiction_level,
  }));

  return [...quietEntries, ...parkingEntries, ...bulkEntries, ...fireworksEntries];
}


let heroMapPromise: Promise<Record<string, string>> | null = null;

async function ensureHeroMap(): Promise<Record<string, string>> {
  if (!heroMapPromise) {
    heroMapPromise = (async () => {
      try {
        const fileOk = await (async () => { try { await fs.access(HERO_MAP_PATH); return true; } catch { return false; } })();
        if (!fileOk) return {};
        const raw = await fs.readFile(HERO_MAP_PATH, "utf-8");
        return JSON.parse(raw) as Record<string, string>;
      } catch {
        return {};
      }
    })();
  }
  return heroMapPromise;
}

export async function getHeroImagePath(params: {
  countrySlug: string;
  regionSlug: string;
  citySlug: string;
}): Promise<string | undefined> {
  const map = await ensureHeroMap();
  const key = buildSlugKey(params.countrySlug, params.regionSlug, params.citySlug);
  const local = map[key];
  if (local) return local;
  try {
    const { dataset } = await quietHoursLoader.ensureDataset();
    const rec = dataset.find(
      (r) =>
        r.country_slug === params.countrySlug &&
        r.region_slug === params.regionSlug &&
        r.city_slug === params.citySlug,
    );
    return rec?.hero_image_url;
  } catch {
    return undefined;
  }
}


import { z } from "zod";

const IsoCountryCodeSchema = z
  .string()
  .trim()
  .length(2, "country must be ISO-2")
  .regex(/^[A-Z]{2}$/u, "country must be uppercase ISO-2 code");

const SlugSchema = z
  .string()
  .trim()
  .min(1, "slug is required");

const IanaTimezoneSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[A-Za-z0-9_/\-+]+$/, "timezone must be a valid IANA identifier");

const IsoDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "last_verified must use YYYY-MM-DD format");

const UrlSchema = z.string().trim().url();

const NonEmptyString = z.string().trim().min(1);

const BaseTopicRecordObject = z.object({
  country: IsoCountryCodeSchema,
  region: NonEmptyString,
  city: NonEmptyString.optional(),
  country_slug: SlugSchema,
  region_slug: SlugSchema,
  city_slug: SlugSchema.optional(),
  timezone: IanaTimezoneSchema,
  last_verified: IsoDateSchema,
  source_title: NonEmptyString,
  source_url: UrlSchema,
  complaint_channel: NonEmptyString.optional(),
  complaint_url: UrlSchema.optional(),
  fine_range: NonEmptyString.optional(),
  notes_admin: z.string().trim().optional(),
});

type BaseTopicRecordLike = z.infer<typeof BaseTopicRecordObject>;

function ensureCitySlugConsistency<T extends BaseTopicRecordLike>(
  data: T,
  ctx: z.RefinementCtx,
) {
  if (data.city && !data.city_slug) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "city_slug is required when city is present",
      path: ["city_slug"],
    });
  }
  if (!data.city && data.city_slug) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "city_slug should be omitted when city is not provided",
      path: ["city_slug"],
    });
  }
}

export const BaseTopicRecordSchema = BaseTopicRecordObject.superRefine(
  ensureCitySlugConsistency,
);

const CityTopicRecordBase = BaseTopicRecordObject.extend({
  city: NonEmptyString,
  city_slug: SlugSchema,
});

export const CityTopicRecordSchema = CityTopicRecordBase.superRefine(
  ensureCitySlugConsistency,
);

const QuietHoursRecordObject = CityTopicRecordBase.extend({
  default_quiet_hours: NonEmptyString,
  weekend_quiet_hours: NonEmptyString.optional(),
  holiday_quiet_hours: NonEmptyString.optional(),
  residential_decibel_limit_day: z.number().nonnegative().optional(),
  residential_decibel_limit_night: z.number().nonnegative().optional(),
  construction_hours_weekday: NonEmptyString,
  construction_hours_weekend: NonEmptyString,
  lawn_equipment_hours: NonEmptyString,
  party_music_rules: NonEmptyString,
  complaint_channel: NonEmptyString,
  complaint_url: UrlSchema,
  fine_range: NonEmptyString,
  first_offense_fine: z.number().nonnegative().optional(),
  bylaw_title: NonEmptyString,
  bylaw_url: UrlSchema,
  // Optional SEO copy rendered under the header image on city pages
  seo_text: NonEmptyString.optional(),
  tips: z.array(NonEmptyString).min(1),
  templates: z.object({
    neighbor_message: NonEmptyString,
    landlord_message: NonEmptyString,
  }),
  lat: z.number().optional(),
  lng: z.number().optional(),
  hero_image_url: UrlSchema.optional(),
});

export const QuietHoursRecordSchema = QuietHoursRecordObject.superRefine(
  ensureCitySlugConsistency,
);

const ParkingRulesRecordObject = CityTopicRecordBase.extend({
  overnight_parking_allowed: z.union([z.boolean(), z.literal("varies")]),
  overnight_hours: NonEmptyString,
  permit_required: z.boolean(),
  permit_url: UrlSchema.optional(),
  winter_ban: z.boolean(),
  winter_ban_months: NonEmptyString,
  winter_ban_hours: NonEmptyString,
  snow_emergency_rules: NonEmptyString,
  towing_enforced: z.boolean(),
  tow_zones_map_url: UrlSchema.optional(),
  ticket_amounts: NonEmptyString,
  notes_public: z.string().trim().optional(),
});

export const ParkingRulesRecordSchema = ParkingRulesRecordObject.superRefine(
  ensureCitySlugConsistency,
);

const BulkTrashRecordObject = CityTopicRecordBase.extend({
  service_type: z.enum(["curbside", "appointment", "dropoff", "mixed"]),
  schedule_pattern: NonEmptyString,
  request_url: UrlSchema.optional(),
  eligible_items: z.array(NonEmptyString).min(1),
  not_accepted_items: z.array(NonEmptyString).min(1),
  limits: NonEmptyString,
  fees: NonEmptyString,
  holiday_shifts: NonEmptyString,
  illegal_dumping_reporting: z.union([NonEmptyString, UrlSchema]),
  notes_public: z.string().trim().optional(),
});

export const BulkTrashRecordSchema = BulkTrashRecordObject.superRefine(
  ensureCitySlugConsistency,
);

const OverrideSchema = z.object({
  county: NonEmptyString,
  rules: NonEmptyString,
});

const CityOverrideSchema = z.object({
  city: NonEmptyString,
  rules: NonEmptyString,
});

const FireworksRecordObject = BaseTopicRecordObject.extend({
  jurisdiction_level: z.enum(["state", "county", "city"]),
  allowed_consumer_fireworks: z.union([z.boolean(), z.literal("restricted")]),
  sale_periods: NonEmptyString,
  use_hours: NonEmptyString,
  permit_required: z.boolean(),
  age_restrictions: NonEmptyString,
  prohibited_types: z.array(NonEmptyString).min(1),
  fine_range: NonEmptyString.optional(),
  enforcement_notes: NonEmptyString,
  county_overrides: z.array(OverrideSchema).optional(),
  city_overrides: z.array(CityOverrideSchema).optional(),
  notes_public: z.string().trim().optional(),
});

export const FireworksRecordSchema = FireworksRecordObject.superRefine((data, ctx) => {
  ensureCitySlugConsistency(data, ctx);
  if (data.jurisdiction_level === "city" && !data.city) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "city is required when jurisdiction_level is city",
      path: ["city"],
    });
  }
  if (data.jurisdiction_level !== "city" && data.city) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "city should be omitted unless jurisdiction_level is city",
      path: ["city"],
    });
  }
});

export const QuietHoursDatasetSchema = z.array(QuietHoursRecordSchema).min(1);
export const ParkingRulesDatasetSchema = z.array(ParkingRulesRecordSchema).min(1);
export const BulkTrashDatasetSchema = z.array(BulkTrashRecordSchema).min(1);
export const FireworksDatasetSchema = z.array(FireworksRecordSchema).min(1);

export type QuietHoursRecord = z.infer<typeof QuietHoursRecordSchema>;
export type ParkingRulesRecord = z.infer<typeof ParkingRulesRecordSchema>;
export type BulkTrashRecord = z.infer<typeof BulkTrashRecordSchema>;
export type FireworksRecord = z.infer<typeof FireworksRecordSchema>;

export type QuietHoursDataset = z.infer<typeof QuietHoursDatasetSchema>;
export type ParkingRulesDataset = z.infer<typeof ParkingRulesDatasetSchema>;
export type BulkTrashDataset = z.infer<typeof BulkTrashDatasetSchema>;
export type FireworksDataset = z.infer<typeof FireworksDatasetSchema>;

export type TopicSlugIndexEntry = {
  country: string;
  region: string;
  city?: string;
  country_slug: string;
  region_slug: string;
  city_slug?: string;
  last_verified: string;
};

export type SlugIndex = Record<string, TopicSlugIndexEntry>;

export type DataSource = "json" | "csv";

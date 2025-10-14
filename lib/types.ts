import { z } from "zod";

export const QuietHoursRecordSchema = z.object({
  country: z
    .string()
    .trim()
    .length(2, "country must be ISO-2")
    .regex(/^[A-Z]{2}$/u, "country must be uppercase ISO-2 code"),
  region: z.string().trim().min(1),
  city: z.string().trim().min(1),
  country_slug: z.string().trim().min(1),
  region_slug: z.string().trim().min(1),
  city_slug: z.string().trim().min(1),
  timezone: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z0-9_/\-+]+$/, "timezone must be a valid IANA identifier"),
  default_quiet_hours: z.string().trim().min(1),
  weekend_quiet_hours: z.string().trim().min(1).optional(),
  holiday_quiet_hours: z.string().trim().min(1).optional(),
  residential_decibel_limit_day: z.number().nonnegative().optional(),
  residential_decibel_limit_night: z.number().nonnegative().optional(),
  construction_hours_weekday: z.string().trim().min(1),
  construction_hours_weekend: z.string().trim().min(1),
  lawn_equipment_hours: z.string().trim().min(1),
  party_music_rules: z.string().trim().min(1),
  complaint_channel: z.string().trim().min(1),
  complaint_url: z.string().url(),
  fine_range: z.string().trim().min(1),
  first_offense_fine: z.number().nonnegative().optional(),
  bylaw_title: z.string().trim().min(1),
  bylaw_url: z.string().url(),
  last_verified: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "last_verified must use YYYY-MM-DD format"),
  tips: z.array(z.string().trim().min(1)).min(1),
  templates: z.object({
    neighbor_message: z.string().trim().min(1),
    landlord_message: z.string().trim().min(1),
  }),
  lat: z.number().optional(),
  lng: z.number().optional(),
  notes_admin: z.string().trim().optional(),
});

export const QuietHoursDatasetSchema = z.array(QuietHoursRecordSchema).min(1);

export type QuietHoursRecord = z.infer<typeof QuietHoursRecordSchema>;
export type QuietHoursDataset = z.infer<typeof QuietHoursDatasetSchema>;

export type SlugIndexEntry = {
  country: string;
  region: string;
  city: string;
  country_slug: string;
  region_slug: string;
  city_slug: string;
  last_verified: string;
};

export type SlugIndex = Record<string, SlugIndexEntry>;

export type DataSource = "json" | "csv";

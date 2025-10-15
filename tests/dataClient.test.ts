
import { describe, expect, it } from "vitest";

import {
  getCitiesByRegion,
  getCityRecord,
  getCountries,
  getDataset,
  getRegionsByCountry,
  getSearchIndex,
  normalizeRecord,
} from "@/lib/dataClient";

describe("dataClient", () => {
  it("loads dataset from JSON source", async () => {
    const { records, source } = await getDataset();
    expect(records).toHaveLength(24);
    expect(source).toBe("json");
    const toronto = records.find((record) => record.city_slug === "toronto");
    expect(toronto?.country).toBe("CA");
  });

  it("fetches a city by slug", async () => {
    const record = await getCityRecord({
      countrySlug: "canada",
      regionSlug: "ontario",
      citySlug: "toronto",
    });
    expect(record?.complaint_channel).toBe("311 Toronto (Municipal Licensing & Standards); Police for disorderly parties.");
  });

  it("returns country, region, and city groupings", async () => {
    const countries = await getCountries();
    expect(countries.map((item) => item.countrySlug)).toEqual(["canada", "united-states"]);

    const regions = await getRegionsByCountry("canada");
    expect(regions[0]?.regionSlug).toBe("alberta");

    const cities = await getCitiesByRegion("canada", "ontario");
    expect(cities).toEqual([
      expect.objectContaining({ citySlug: "toronto", city: "Toronto" }),
    ]);
  });

  it("produces a search index with canonical paths", async () => {
    const searchIndex = await getSearchIndex();
    expect(searchIndex).toContainEqual(
      expect.objectContaining({
        city: "Toronto",
        path: "/quiet-hours/canada/ontario/toronto",
      }),
    );
  });

  it("normalizes records with minimal string inputs", () => {
    const record = normalizeRecord({
      country: "US",
      region: "Test State",
      city: "Test City",
      timezone: "America/New_York",
      default_quiet_hours: "22:00-07:00",
      construction_hours_weekday: "07:00-19:00",
      construction_hours_weekend: "09:00-17:00",
      lawn_equipment_hours: "09:00-19:00",
      party_music_rules: "Keep volume reasonable",
      complaint_channel: "311",
      complaint_url: "https://example.com",
      fine_range: "$0-$100",
      bylaw_title: "Noise bylaw",
      bylaw_url: "https://example.com/bylaw",
      templates: {
        neighbor_message: "Hi neighbour!",
        landlord_message: "Hello landlord!",
      },
      tips: ["Tip one"],
      last_verified: "2024-01-01",
      country_slug: "united-states",
      region_slug: "test-state",
      city_slug: "test-city",
    });

    expect(record.city_slug).toBe("test-city");
    expect(record.tips).toEqual(["Tip one"]);
  });
});


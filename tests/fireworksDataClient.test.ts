import { describe, expect, it } from "vitest";

import {
  getFireworksBySlug,
  getFireworksCitiesByRegion,
  getFireworksCountries,
  getFireworksDataset,
  getFireworksRegionsByCountry,
  listFireworksParams,
  normalizeFireworksRecord,
} from "@/lib/dataClient";

describe("fireworks data client", () => {
  it("loads fireworks dataset with state-level record", async () => {
    const { records, source } = await getFireworksDataset();
    expect(source).toBe("json");
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      region: "Massachusetts",
      jurisdiction_level: "state",
    });
  });

  it("fetches fireworks rules by slug", async () => {
    const record = await getFireworksBySlug({
      countrySlug: "united-states",
      regionSlug: "massachusetts",
    });
    expect(record?.allowed_consumer_fireworks).toBe(false);
    expect(record?.permit_required).toBe(false);
  });

  it("lists params with jurisdiction level metadata", async () => {
    const params = await listFireworksParams();
    expect(params).toEqual([
      {
        countrySlug: "united-states",
        regionSlug: "massachusetts",
        citySlug: undefined,
        jurisdictionLevel: "state",
      },
    ]);
  });

  it("summarizes countries and regions with state coverage", async () => {
    const countries = await getFireworksCountries();
    expect(countries[0]).toMatchObject({
      countrySlug: "united-states",
      count: 1,
    });

    const regions = await getFireworksRegionsByCountry("united-states");
    expect(regions[0]).toMatchObject({
      regionSlug: "massachusetts",
      hasStateRule: true,
      cityCount: 0,
    });

    const cities = await getFireworksCitiesByRegion("united-states", "massachusetts");
    expect(cities).toEqual([]);
  });

  it("normalizes mixed boolean or string inputs", () => {
    const normalized = normalizeFireworksRecord({
      country: "US",
      region: "Colorado",
      timezone: "America/Denver",
      last_verified: "2025-05-01",
      source_title: "Colorado Fireworks Guide",
      source_url: "https://example.com/co-fireworks",
      jurisdiction_level: "county",
      allowed_consumer_fireworks: "restricted",
      sale_periods: "Jun 1-Jul 5; Dec 30-Jan 1",
      use_hours: "Allowed until 22:00 except on July 4",
      permit_required: "true",
      age_restrictions: "18+ to purchase",
      prohibited_types: "Aerial shells|Firecrackers",
      enforcement_notes: "Counties may seize illegal fireworks",
      county_overrides: "Arapahoe County: Only fountains permitted",
    });

    expect(normalized.region_slug).toBe("colorado");
    expect(normalized.allowed_consumer_fireworks).toBe("restricted");
    expect(normalized.permit_required).toBe(true);
    expect(normalized.county_overrides).toEqual([
      { county: "Arapahoe County", rules: "Only fountains permitted" },
    ]);
  });
});

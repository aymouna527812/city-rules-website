import { describe, expect, it } from "vitest";

import {
  getParkingBySlug,
  getParkingCitiesByRegion,
  getParkingCountries,
  getParkingDataset,
  getParkingRegionsByCountry,
  listParkingParams,
  normalizeParkingRecord,
} from "@/lib/dataClient";

describe("parking data client", () => {
  it("exposes parking dataset with sample record", async () => {
    const { records, source } = await getParkingDataset();
    expect(source).toBe("json");
    expect(records).toHaveLength(1);
    const chicago = records[0];
    expect(chicago.city).toBe("Chicago");
    expect(chicago.winter_ban).toBe(true);
  });

  it("looks up parking data by slug", async () => {
    const record = await getParkingBySlug({
      countrySlug: "united-states",
      regionSlug: "illinois",
      citySlug: "chicago",
    });
    expect(record?.permit_required).toBe(true);
    expect(record?.overnight_parking_allowed).toBe("varies");
  });

  it("lists static params and geographic groupings", async () => {
    const params = await listParkingParams();
    expect(params).toEqual([
      {
        countrySlug: "united-states",
        regionSlug: "illinois",
        citySlug: "chicago",
      },
    ]);

    const countries = await getParkingCountries();
    expect(countries[0]).toMatchObject({
      country: "US",
      countrySlug: "united-states",
      count: 1,
    });

    const regions = await getParkingRegionsByCountry("united-states");
    expect(regions[0]).toMatchObject({ regionSlug: "illinois", count: 1 });

    const cities = await getParkingCitiesByRegion("united-states", "illinois");
    expect(cities[0]).toEqual(
      expect.objectContaining({
        city: "Chicago",
        citySlug: "chicago",
      }),
    );
  });

  it("normalizes parking records from loose string values", () => {
    const normalized = normalizeParkingRecord({
      country: "CA",
      region: "Ontario",
      city: "Ottawa",
      timezone: "America/Toronto",
      last_verified: "2025-03-01",
      source_title: "Ottawa Overnight Parking",
      source_url: "https://example.com/ottawa",
      overnight_parking_allowed: "varies",
      overnight_hours: "01:00-07:00",
      permit_required: "true",
      winter_ban: "false",
      winter_ban_months: "Nov 1-Apr 1",
      winter_ban_hours: "01:00-07:00",
      snow_emergency_rules: "Declared based on forecast",
      towing_enforced: "true",
      ticket_amounts: "$50 per infraction",
    });

    expect(normalized.city_slug).toBe("ottawa");
    expect(normalized.overnight_parking_allowed).toBe("varies");
    expect(normalized.towing_enforced).toBe(true);
  });
});

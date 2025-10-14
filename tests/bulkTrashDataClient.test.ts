import { describe, expect, it } from "vitest";

import {
  getBulkTrashBySlug,
  getBulkTrashCitiesByRegion,
  getBulkTrashCountries,
  getBulkTrashDataset,
  getBulkTrashRegionsByCountry,
  listBulkTrashParams,
  normalizeBulkTrashRecord,
} from "@/lib/dataClient";

describe("bulk trash data client", () => {
  it("provides bulk trash dataset with sample entry", async () => {
    const { records, source } = await getBulkTrashDataset();
    expect(source).toBe("json");
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      city: "Phoenix",
      service_type: "appointment",
    });
  });

  it("retrieves bulk trash record by slug", async () => {
    const record = await getBulkTrashBySlug({
      countrySlug: "united-states",
      regionSlug: "arizona",
      citySlug: "phoenix",
    });
    expect(record?.eligible_items).toContain("Furniture");
    expect(record?.illegal_dumping_reporting).toContain("https://");
  });

  it("lists params and groupings for bulk trash", async () => {
    const params = await listBulkTrashParams();
    expect(params).toEqual([
      {
        countrySlug: "united-states",
        regionSlug: "arizona",
        citySlug: "phoenix",
      },
    ]);

    const countries = await getBulkTrashCountries();
    expect(countries[0]).toMatchObject({
      countrySlug: "united-states",
      count: 1,
    });

    const regions = await getBulkTrashRegionsByCountry("united-states");
    expect(regions[0]).toMatchObject({ region: "Arizona" });

    const cities = await getBulkTrashCitiesByRegion("united-states", "arizona");
    expect(cities).toContainEqual(
      expect.objectContaining({
        city: "Phoenix",
        citySlug: "phoenix",
      }),
    );
  });

  it("normalizes pipe separated arrays and booleans", () => {
    const normalized = normalizeBulkTrashRecord({
      country: "US",
      region: "Test State",
      city: "Sample City",
      timezone: "America/Los_Angeles",
      last_verified: "2025-04-01",
      source_title: "Sample Bulk Service",
      source_url: "https://example.com/sample-bulk",
      service_type: "mixed",
      schedule_pattern: "First full week each month",
      eligible_items: "Couches|Mattresses",
      not_accepted_items: "Batteries|Oil",
      limits: "Up to 5 items per pickup",
      fees: "First pickup free",
      holiday_shifts: "Shifted to next business day",
      illegal_dumping_reporting: "Call 311",
    });

    expect(normalized.city_slug).toBe("sample-city");
    expect(normalized.eligible_items).toEqual(["Couches", "Mattresses"]);
    expect(normalized.not_accepted_items).toEqual(["Batteries", "Oil"]);
  });
});

import type { MetadataRoute } from "next";

import {
  getBulkTrashDataset,
  getDataset,
  getFireworksDataset,
  getParkingDataset,
} from "@/lib/dataClient";
import { getSiteUrl } from "@/lib/seo";

function getLatest(existing: string | undefined, next: string): string {
  if (!existing) {
    return next;
  }
  return next > existing ? next : existing;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [quiet, parking, bulk, fireworks] = await Promise.all([
    getDataset(),
    getParkingDataset(),
    getBulkTrashDataset(),
    getFireworksDataset(),
  ]);

  const staticPaths: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/contact",
    "/quiet-hours",
    "/parking-rules",
    "/bulk-trash",
    "/fireworks",
  ].map((path) => ({
    url: `${siteUrl}${path || "/"}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const quietCityPaths: MetadataRoute.Sitemap = quiet.records.map((record) => ({
    url: `${siteUrl}/quiet-hours/${record.country_slug}/${record.region_slug}/${record.city_slug}`,
    lastModified: new Date(record.last_verified).toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const quietCountryMap = new Map<string, string>();
  const quietRegionMap = new Map<string, string>();
  for (const record of quiet.records) {
    quietCountryMap.set(
      record.country_slug,
      getLatest(quietCountryMap.get(record.country_slug), record.last_verified),
    );
    const regionKey = `${record.country_slug}/${record.region_slug}`;
    quietRegionMap.set(regionKey, getLatest(quietRegionMap.get(regionKey), record.last_verified));
  }

  const quietCountryPaths: MetadataRoute.Sitemap = Array.from(quietCountryMap.entries()).map(
    ([countrySlug, lastVerified]) => ({
      url: `${siteUrl}/quiet-hours/${countrySlug}`,
      lastModified: new Date(lastVerified).toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }),
  );

  const quietRegionPaths: MetadataRoute.Sitemap = Array.from(quietRegionMap.entries()).map(
    ([slug, lastVerified]) => ({
      url: `${siteUrl}/quiet-hours/${slug}`,
      lastModified: new Date(lastVerified).toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }),
  );

  const parkingCityPaths: MetadataRoute.Sitemap = parking.records.map((record) => ({
    url: `${siteUrl}/parking-rules/${record.country_slug}/${record.region_slug}/${record.city_slug}`,
    lastModified: new Date(record.last_verified).toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const parkingCountryMap = new Map<string, string>();
  const parkingRegionMap = new Map<string, string>();
  for (const record of parking.records) {
    parkingCountryMap.set(
      record.country_slug,
      getLatest(parkingCountryMap.get(record.country_slug), record.last_verified),
    );
    const regionKey = `${record.country_slug}/${record.region_slug}`;
    parkingRegionMap.set(
      regionKey,
      getLatest(parkingRegionMap.get(regionKey), record.last_verified),
    );
  }

  const parkingCountryPaths: MetadataRoute.Sitemap = Array.from(
    parkingCountryMap.entries(),
  ).map(([countrySlug, lastVerified]) => ({
    url: `${siteUrl}/parking-rules/${countrySlug}`,
    lastModified: new Date(lastVerified).toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));

  const parkingRegionPaths: MetadataRoute.Sitemap = Array.from(parkingRegionMap.entries()).map(
    ([slug, lastVerified]) => ({
      url: `${siteUrl}/parking-rules/${slug}`,
      lastModified: new Date(lastVerified).toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }),
  );

  const bulkCityPaths: MetadataRoute.Sitemap = bulk.records.map((record) => ({
    url: `${siteUrl}/bulk-trash/${record.country_slug}/${record.region_slug}/${record.city_slug}`,
    lastModified: new Date(record.last_verified).toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const bulkCountryMap = new Map<string, string>();
  const bulkRegionMap = new Map<string, string>();
  for (const record of bulk.records) {
    bulkCountryMap.set(
      record.country_slug,
      getLatest(bulkCountryMap.get(record.country_slug), record.last_verified),
    );
    const regionKey = `${record.country_slug}/${record.region_slug}`;
    bulkRegionMap.set(regionKey, getLatest(bulkRegionMap.get(regionKey), record.last_verified));
  }

  const bulkCountryPaths: MetadataRoute.Sitemap = Array.from(bulkCountryMap.entries()).map(
    ([countrySlug, lastVerified]) => ({
      url: `${siteUrl}/bulk-trash/${countrySlug}`,
      lastModified: new Date(lastVerified).toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.55,
    }),
  );

  const bulkRegionPaths: MetadataRoute.Sitemap = Array.from(bulkRegionMap.entries()).map(
    ([slug, lastVerified]) => ({
      url: `${siteUrl}/bulk-trash/${slug}`,
      lastModified: new Date(lastVerified).toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }),
  );

  const fireworksPaths = fireworks.records.map((record) => ({
    url: record.city_slug
      ? `${siteUrl}/fireworks/${record.country_slug}/${record.region_slug}/${record.city_slug}`
      : `${siteUrl}/fireworks/${record.country_slug}/${record.region_slug}`,
    lastModified: new Date(record.last_verified).toISOString(),
    changeFrequency: "monthly" as const,
    priority: record.city_slug ? 0.82 : 0.78,
  }));

  const fireworksCountryMap = new Map<string, string>();
  for (const record of fireworks.records) {
    fireworksCountryMap.set(
      record.country_slug,
      getLatest(fireworksCountryMap.get(record.country_slug), record.last_verified),
    );
  }

  const fireworksCountryPaths: MetadataRoute.Sitemap = Array.from(
    fireworksCountryMap.entries(),
  ).map(([countrySlug, lastVerified]) => ({
    url: `${siteUrl}/fireworks/${countrySlug}`,
    lastModified: new Date(lastVerified).toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));

  return [
    ...staticPaths,
    ...quietCountryPaths,
    ...quietRegionPaths,
    ...quietCityPaths,
    ...parkingCountryPaths,
    ...parkingRegionPaths,
    ...parkingCityPaths,
    ...bulkCountryPaths,
    ...bulkRegionPaths,
    ...bulkCityPaths,
    ...fireworksCountryPaths,
    ...fireworksPaths,
  ];
}

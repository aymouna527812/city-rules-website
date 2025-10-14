import type { MetadataRoute } from "next";

import { getDataset } from "@/lib/dataClient";
import { getSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { records } = await getDataset();
  const siteUrl = getSiteUrl();

  const staticPaths: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/contact",
    "/quiet-hours",
  ].map((path) => ({
    url: `${siteUrl}${path || "/"}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const cityPaths: MetadataRoute.Sitemap = records.map((record) => ({
    url: `${siteUrl}/${record.country_slug}/${record.region_slug}/${record.city_slug}`,
    lastModified: new Date(record.last_verified).toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const countryPaths: MetadataRoute.Sitemap = Array.from(
    new Set(records.map((record) => record.country_slug)),
  ).map((countrySlug) => ({
    url: `${siteUrl}/${countrySlug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const regionPaths: MetadataRoute.Sitemap = Array.from(
    new Set(records.map((record) => `${record.country_slug}/${record.region_slug}`)),
  ).map((slug) => ({
    url: `${siteUrl}/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...staticPaths, ...countryPaths, ...regionPaths, ...cityPaths];
}

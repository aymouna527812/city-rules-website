import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDataset, getHeroImagePath } from "@/lib/dataClient";
import { formatDate, getCountryName } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Quiet hours directory by country and region",
  description:
    "Browse every city covered by Quiet Hours & Noise Rules, organised by country and region.",
};

export default async function QuietHoursDirectory() {
  const { records } = await getDataset();

  const grouped = new Map<
    string,
    {
      countryCode: string;
      countrySlug: string;
      regions: Map<
        string,
        {
          name: string;
          slug: string;
          lastVerified: string;
          cities: Array<{
            name: string;
            slug: string;
            lastVerified: string;
          }>;
        }
      >;
    }
  >();

  records.forEach((record) => {
    if (!grouped.has(record.country_slug)) {
      grouped.set(record.country_slug, {
        countryCode: record.country,
        countrySlug: record.country_slug,
        regions: new Map(),
      });
    }
    const countryBucket = grouped.get(record.country_slug)!;
    if (!countryBucket.regions.has(record.region_slug)) {
      countryBucket.regions.set(record.region_slug, {
        name: record.region,
        slug: record.region_slug,
        lastVerified: record.last_verified,
        cities: [],
      });
    }
    const regionBucket = countryBucket.regions.get(record.region_slug)!;
    regionBucket.cities.push({
      name: record.city,
      slug: record.city_slug,
      lastVerified: record.last_verified,
    });
    regionBucket.lastVerified =
      record.last_verified > regionBucket.lastVerified
        ? record.last_verified
        : regionBucket.lastVerified;
  });

  const countries = Array.from(grouped.values()).sort((a, b) =>
    getCountryName(a.countryCode).localeCompare(getCountryName(b.countryCode)),
  );

  // Precompute images for all city tiles to avoid awaiting inside JSX
  const enrichedCountries = await Promise.all(
    countries.map(async (country) => {
      const regions = await Promise.all(
        Array.from(country.regions.values())
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(async (region) => {
            const cities = await Promise.all(
              region.cities
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(async (city) => ({
                  ...city,
                  image: await getHeroImagePath({
                    countrySlug: country.countrySlug,
                    regionSlug: region.slug,
                    citySlug: city.slug,
                  }),
                })),
            );
            return { ...region, cities };
          }),
      );
      return { ...country, regions };
    }),
  );

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Directory</p>
        <h1 className="text-4xl font-bold text-slate-900">Browse quiet hours by location</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Jump straight to any city guide. Each page includes quiet hour windows, decibel charts,
          construction restrictions, and enforcement steps.
        </p>
      </header>

      <div className="space-y-6">
        {enrichedCountries.map((country) => (
          <Card key={country.countrySlug}>
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900">
                {getCountryName(country.countryCode)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {country.regions.map((region) => (
                <div key={region.slug} className="space-y-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <div className="text-lg font-semibold text-slate-800">{region.name}</div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Updated <time dateTime={region.lastVerified}>{formatDate(region.lastVerified)}</time>
                    </p>
                  </div>
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {region.cities.map((city) => (
                      <li key={city.slug}>
                        <Link
                          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-primary hover:border-primary hover:bg-primary/5 hover:underline"
                          href={`/${country.countrySlug}/${region.slug}/${city.slug}`}
                        >
                          {city.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={city.image} alt="" className="h-10 w-16 rounded object-cover" />
                          ) : null}
                          <span className="flex w-full items-center justify-between">
                            <span>{city.name}</span>
                            <span className="text-xs text-slate-400">
                              <time dateTime={city.lastVerified}>
                                {formatDate(city.lastVerified)}
                              </time>
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

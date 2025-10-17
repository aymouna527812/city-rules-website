import type { Metadata } from "next";
import Link from "next/link";

import { AdPlaceholder } from "@/components/AdPlaceholder";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getFireworksCitiesByRegion,
  getFireworksCountries,
  getFireworksRegionsByCountry,
  getHeroImagePath,
} from "@/lib/dataClient";
import { buildCanonicalPath } from "@/lib/seo";
import { formatDate, getCountryName } from "@/lib/utils";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Fireworks Legality Directory",
  description:
    "Review consumer fireworks rules, sale periods, and permitted hours by country, region, and city.",
  alternates: {
    canonical: buildCanonicalPath("/fireworks"),
  },
  openGraph: {
    title: "Fireworks Legality Directory",
    description:
      "Check if consumer fireworks are legal in your area, the permitted use hours, and the fines for violations.",
    url: buildCanonicalPath("/fireworks"),
    type: "website",
    siteName: "Quiet Hours & Noise Rules",
  },
};

type FireworksCityBase = Awaited<ReturnType<typeof getFireworksCitiesByRegion>>[number];
type FireworksCityWithImage = FireworksCityBase & { image?: string };
type RegionDetail = Awaited<ReturnType<typeof getFireworksRegionsByCountry>>[number] & {
  cities: FireworksCityWithImage[];
};

export default async function FireworksIndexPage() {
  const countries = await getFireworksCountries();
  const countryDetails = await Promise.all(
    countries.map(async (country) => {
      const regions = await getFireworksRegionsByCountry(country.countrySlug);
      const expanded: RegionDetail[] = await Promise.all(
        regions.map(async (region) => {
          const cities = await getFireworksCitiesByRegion(country.countrySlug, region.regionSlug);
          const citiesWithImages = await Promise.all(
            cities.map(async (city) => ({
              ...city,
              image: await getHeroImagePath({
                countrySlug: country.countrySlug,
                regionSlug: region.regionSlug,
                citySlug: city.citySlug,
              }),
            })),
          );
          return { ...region, cities: citiesWithImages };
        }),
      );
      return { ...country, countryName: getCountryName(country.country), regions: expanded };
    }),
  );

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Fireworks", href: "/fireworks" },
        ]}
      />

      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">Fireworks Legality Guides</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Confirm whether consumer fireworks are legal in your region, when they can be sold or
          used, and the penalties for violations.
        </p>
      </header>

      <AdPlaceholder slot="fireworks-hub-top" />

      <div className="space-y-8">
        {countryDetails.map((country) => (
          <section key={country.countrySlug} className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">{country.countryName}</h2>
              <span className="text-xs uppercase tracking-wide text-slate-500">
                {country.count} jurisdiction{country.count === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {country.regions.map((region) => (
                <Card key={region.regionSlug}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-slate-900">
                      {region.region}
                      <span className="ml-2 text-xs font-normal text-slate-500">
                        {region.hasStateRule ? "State coverage" : "Local coverage"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-700">
                    <p>
                      <Link
                        href={`/fireworks/${country.countrySlug}/${region.regionSlug}`}
                        className="font-medium text-primary hover:underline"
                      >
                        View region overview
                      </Link>
                      <span className="ml-2 text-xs text-slate-500">
                        Updated {formatDate(region.lastVerified)}
                      </span>
                    </p>
                    {region.cityCount > 0 ? (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          City-specific rules
                        </p>
                        <div className="mt-2 grid gap-3 sm:grid-cols-2">
                          {region.cities.map((city) => (
                            <Card
                              key={city.citySlug}
                              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                            >
                              {city.image ? (
                                <div className="overflow-hidden rounded-t-xl">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={city.image}
                                    alt={`${city.city} preview`}
                                    className="h-28 w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                                    loading="lazy"
                                  />
                                </div>
                              ) : null}
                              <CardContent className="space-y-1 p-5">
                                <CardTitle className="text-lg text-slate-900">{city.city}</CardTitle>
                                <p className="text-xs uppercase tracking-wide text-slate-400">
                                  Updated <time dateTime={city.lastVerified}>{formatDate(city.lastVerified)}</time>
                                </p>
                                <Link
                                  href={`/fireworks/${country.countrySlug}/${region.regionSlug}/${city.citySlug}`}
                                  className="text-sm font-medium text-primary hover:underline"
                                >
                                  View fireworks &rarr;
                                </Link>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No city-level overrides published.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      <AdPlaceholder slot="fireworks-hub-bottom" />
    </div>
  );
}


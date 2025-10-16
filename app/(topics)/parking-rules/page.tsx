import type { Metadata } from "next";
import Link from "next/link";

import { AdPlaceholder } from "@/components/AdPlaceholder";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getParkingCitiesByRegion, getParkingCountries, getParkingRegionsByCountry, getHeroImagePath } from "@/lib/dataClient";
import { buildCanonicalPath } from "@/lib/seo";
import { formatDate, getCountryName } from "@/lib/utils";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Overnight Parking & Winter Bans Directory",
  description:
    "Browse overnight parking rules, winter bans, and towing enforcement by country, region, and city.",
  alternates: {
    canonical: buildCanonicalPath("/parking-rules"),
  },
  openGraph: {
    title: "Overnight Parking & Winter Bans Directory",
    description:
      "Find overnight parking rules, permit requirements, and snow emergency details for major cities.",
    url: buildCanonicalPath("/parking-rules"),
    type: "website",
    siteName: "Quiet Hours & Noise Rules",
  },
};

type RegionWithCities = Awaited<ReturnType<typeof getParkingRegionsByCountry>>[number] & {
  cities: Awaited<ReturnType<typeof getParkingCitiesByRegion>>;
};

export default async function ParkingIndexPage() {
  const countries = await getParkingCountries();
  const countryDetails = await Promise.all(
    countries.map(async (country) => {
      const regions = await getParkingRegionsByCountry(country.countrySlug);
      const expanded: RegionWithCities[] = await Promise.all(
        regions.map(async (region) => {
          const cities = await getParkingCitiesByRegion(country.countrySlug, region.regionSlug);
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
          { label: "Parking Rules", href: "/parking-rules" },
        ]}
      />

      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">
          Overnight Parking & Winter Ban Guides
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Explore which cities require overnight parking permits, when winter bans activate, and how
          towing is enforced during snow emergencies.
        </p>
      </header>

      <AdPlaceholder slot="parking-hub-top" />

      <div className="space-y-8">
        {countryDetails.map((country) => (
          <section key={country.countrySlug} className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">{country.countryName}</h2>
              <span className="text-xs uppercase tracking-wide text-slate-500">
                {country.count} location{country.count === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {country.regions.map((region) => (
                <Card key={region.regionSlug}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-slate-900">
                      {region.region}
                      <span className="ml-2 text-xs font-normal text-slate-500">
                        {region.cities.length} {region.cities.length === 1 ? "city" : "cities"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid gap-3 sm:grid-cols-2">
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
                              href={`/parking-rules/${country.countrySlug}/${region.regionSlug}/${city.citySlug}`}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              View parking rules &rarr;
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      <AdPlaceholder slot="parking-hub-bottom" />
    </div>
  );
}


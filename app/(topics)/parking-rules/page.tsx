import type { Metadata } from "next";
import Link from "next/link";

import { AdPlaceholder } from "@/components/AdPlaceholder";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getParkingCitiesByRegion, getParkingCountries, getParkingRegionsByCountry } from "@/lib/dataClient";
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
          return { ...region, cities };
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
                        {region.cities.length} city{region.cities.length === 1 ? "" : "ies"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ul className="space-y-2 text-sm">
                      {region.cities.map((city) => (
                        <li key={city.citySlug} className="flex items-center justify-between">
                          <Link
                            href={`/parking-rules/${country.countrySlug}/${region.regionSlug}/${city.citySlug}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {city.city}
                          </Link>
                          <span className="text-xs text-slate-500">
                            Updated {formatDate(city.lastVerified)}
                          </span>
                        </li>
                      ))}
                    </ul>
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


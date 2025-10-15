import type { Metadata } from "next";
import Link from "next/link";

import { AdPlaceholder } from "@/components/AdPlaceholder";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getBulkTrashCitiesByRegion,
  getBulkTrashCountries,
  getBulkTrashRegionsByCountry,
  getHeroImagePath,
} from "@/lib/dataClient";
import { buildCanonicalPath } from "@/lib/seo";
import { formatDate, getCountryName } from "@/lib/utils";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Bulk Trash & Large-Item Pickup Directory",
  description:
    "Find bulk trash pickup schedules, service types, and limits by country, region, and city.",
  alternates: {
    canonical: buildCanonicalPath("/bulk-trash"),
  },
  openGraph: {
    title: "Bulk Trash & Large-Item Pickup Directory",
    description:
      "Schedule large-item pickup, review accepted items, and confirm limits for municipal bulk trash services.",
    url: buildCanonicalPath("/bulk-trash"),
    type: "website",
    siteName: "Quiet Hours & Noise Rules",
  },
};

type RegionWithCities = Awaited<ReturnType<typeof getBulkTrashRegionsByCountry>>[number] & {
  cities: Awaited<ReturnType<typeof getBulkTrashCitiesByRegion>>;
};

export default async function BulkTrashIndexPage() {
  const countries = await getBulkTrashCountries();
  const countryDetails = await Promise.all(
    countries.map(async (country) => {
      const regions = await getBulkTrashRegionsByCountry(country.countrySlug);
      const expanded: RegionWithCities[] = await Promise.all(
        regions.map(async (region) => {
          const cities = await getBulkTrashCitiesByRegion(country.countrySlug, region.regionSlug);
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
          { label: "Bulk Trash", href: "/bulk-trash" },
        ]}
      />

      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">
          Bulk Trash & Large-Item Pickup Guides
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Understand service types, appointment requirements, and holiday shifts before placing
          items at the curb.
        </p>
      </header>

      <AdPlaceholder slot="bulk-hub-top" />

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
                        <li key={city.citySlug} className="flex items-center justify-between gap-3">
                          <Link
                            href={`/bulk-trash/${country.countrySlug}/${region.regionSlug}/${city.citySlug}`}
                            className="flex items-center gap-3 font-medium text-primary hover:underline"
                          >
                            {city.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={city.image} alt="" className="h-8 w-12 rounded object-cover" loading="lazy" />
                            ) : null}
                            <span>{city.city}</span>
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

      <AdPlaceholder slot="bulk-hub-bottom" />
    </div>
  );
}


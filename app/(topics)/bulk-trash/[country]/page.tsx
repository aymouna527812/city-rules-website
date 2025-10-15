import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getBulkTrashCountries,
  getBulkTrashRegionsByCountry,
  getBulkTrashCitiesByRegion,
  getHeroImagePath,
} from "@/lib/dataClient";
import { buildCanonicalPath } from "@/lib/seo";
import { formatDate, getCountryName } from "@/lib/utils";

export const revalidate = 604800;

type CountryParams = {
  country: string;
};

export async function generateStaticParams() {
  const countries = await getBulkTrashCountries();
  return countries.map((country) => ({ country: country.countrySlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<CountryParams>;
}): Promise<Metadata | undefined> {
  const p = await params;
  const countries = await getBulkTrashCountries();
  const match = countries.find((country) => country.countrySlug === p.country);
  if (!match) {
    return undefined;
  }
  const countryName = getCountryName(match.country);
  const path = `/bulk-trash/${p.country}`;
  return {
    title: `Bulk trash pickup by region in ${countryName}`,
    description: `Review service types, schedules, and item limits across regions in ${countryName}.`,
    alternates: {
      canonical: buildCanonicalPath(path),
    },
  };
}

export default async function BulkCountryPage({ params }: { params: Promise<CountryParams> }) {
  const p = await params;
  const countries = await getBulkTrashCountries();
  const match = countries.find((country) => country.countrySlug === p.country);
  if (!match) {
    notFound();
  }

  const regionsBase = await getBulkTrashRegionsByCountry(p.country);
  const regions = await Promise.all(
    regionsBase.map(async (region) => {
      const citiesBase = await getBulkTrashCitiesByRegion(p.country, region.regionSlug);
      const cities = await Promise.all(
        citiesBase.map(async (c) => ({
          ...c,
          image: await getHeroImagePath({ countrySlug: p.country, regionSlug: region.regionSlug, citySlug: c.citySlug }),
        })),
      );
      return { ...region, cities } as typeof region & { cities: typeof cities };
    }),
  );
  const countryName = getCountryName(match.country);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Bulk Trash", href: "/bulk-trash" },
          { label: countryName, href: `/bulk-trash/${p.country}` },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Bulk trash pickup by region in {countryName}
        </h1>
        <p className="text-sm text-slate-600">
          Pick your region to view accepted items, appointment requirements, and service limits.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {regions.map((region) => (
          <Card key={region.regionSlug}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">{region.region}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>
                Updated{" "}
                <time dateTime={region.lastVerified}>{formatDate(region.lastVerified)}</time>
              </p>
              <Link
                href={`/bulk-trash/${p.country}/${region.regionSlug}`}
                className="font-medium text-primary hover:underline"
              >
                View cities
              </Link>
              <div className="grid gap-3 pt-1 sm:grid-cols-2">
                {region.cities?.map((city) => (
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
                        href={`/bulk-trash/${p.country}/${region.regionSlug}/${city.citySlug}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        View bulk trash &rarr;
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


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
              <ul className="space-y-1 pt-1">
                {region.cities?.map((city) => (
                  <li key={city.citySlug}>
                    <Link
                      href={`/bulk-trash/${p.country}/${region.regionSlug}/${city.citySlug}`}
                      className="group flex items-center gap-3 overflow-hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-primary/5 hover:shadow-sm hover:underline dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                    >
                      {city.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={city.image}
                          alt=""
                          className="h-8 w-12 rounded object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : null}
                      <div className="min-w-0">
                        <div className="font-medium text-primary">{city.city}</div>
                        <div className="text-xs text-slate-400">{formatDate(city.lastVerified)}</div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


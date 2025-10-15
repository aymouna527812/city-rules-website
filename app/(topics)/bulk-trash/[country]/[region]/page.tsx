import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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

type RegionParams = {
  country: string;
  region: string;
};

export async function generateStaticParams() {
  const countries = await getBulkTrashCountries();
  const params: RegionParams[] = [];
  for (const country of countries) {
    const regions = await getBulkTrashRegionsByCountry(country.countrySlug);
    regions.forEach((region) => {
      params.push({ country: country.countrySlug, region: region.regionSlug });
    });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RegionParams>;
}): Promise<Metadata | undefined> {
  const p = await params;
  const regions = await getBulkTrashRegionsByCountry(p.country);
  const match = regions.find((region) => region.regionSlug === p.region);
  if (!match) {
    return undefined;
  }
  const countries = await getBulkTrashCountries();
  const country = countries.find((item) => item.countrySlug === p.country);
  if (!country) {
    return undefined;
  }
  const countryName = getCountryName(country.country);
  const path = `/bulk-trash/${p.country}/${p.region}`;
  return {
    title: `Bulk trash pickup in ${match.region}, ${countryName}`,
    description: `Review accepted items, appointment requirements, and limits across cities in ${match.region}, ${countryName}.`,
    alternates: {
      canonical: buildCanonicalPath(path),
    },
  };
}

export default async function BulkRegionPage({ params }: { params: Promise<RegionParams> }) {
  const p = await params;
  const countries = await getBulkTrashCountries();
  const countryMatch = countries.find((country) => country.countrySlug === p.country);
  if (!countryMatch) {
    notFound();
  }
  const regions = await getBulkTrashRegionsByCountry(p.country);
  const regionMatch = regions.find((region) => region.regionSlug === p.region);
  if (!regionMatch) {
    notFound();
  }

  const citiesBase = await getBulkTrashCitiesByRegion(p.country, p.region);
  const cities = await Promise.all(
    citiesBase.map(async (c) => ({
      ...c,
      image: await getHeroImagePath({ countrySlug: p.country, regionSlug: p.region, citySlug: c.citySlug }),
    })),
  );
  const countryName = getCountryName(countryMatch.country);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Bulk Trash", href: "/bulk-trash" },
          { label: countryName, href: `/bulk-trash/${p.country}` },
          { label: regionMatch.region, href: `/bulk-trash/${p.country}/${p.region}` },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Bulk trash pickup in {regionMatch.region}
        </h1>
        <p className="text-sm text-slate-600">
          Select a city to confirm service type, schedules, and item limits.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">
            Cities in {regionMatch.region}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {cities.map((city) => (
              <li key={city.citySlug} className="flex items-center justify-between gap-3">
                <Link
                  href={`/bulk-trash/${p.country}/${p.region}/${city.citySlug}`}
                  className="flex items-center gap-3 font-medium text-primary hover:underline"
                >
                  {city.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={city.image} alt="" className="h-8 w-12 rounded object-cover" loading="lazy" />
                  ) : null}
                  <span>{city.city}</span>
                </Link>
                <span className="text-xs text-slate-500">Updated {formatDate(city.lastVerified)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}


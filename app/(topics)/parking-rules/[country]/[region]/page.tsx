import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  getParkingCitiesByRegion,
  getParkingCountries,
  getParkingRegionsByCountry,
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
  const countries = await getParkingCountries();
  const params: RegionParams[] = [];
  for (const country of countries) {
    const regions = await getParkingRegionsByCountry(country.countrySlug);
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
  const regions = await getParkingRegionsByCountry(p.country);
  const match = regions.find((region) => region.regionSlug === p.region);
  if (!match) {
    return undefined;
  }
  const countries = await getParkingCountries();
  const country = countries.find((item) => item.countrySlug === p.country);
  if (!country) {
    return undefined;
  }
  const countryName = getCountryName(country.country);
  const path = `/parking-rules/${p.country}/${p.region}`;
  return {
    title: `Parking rules in ${match.region}, ${countryName}`,
    description: `Explore overnight parking bans, permit requirements, and towing enforcement across cities in ${match.region}, ${countryName}.`,
    alternates: {
      canonical: buildCanonicalPath(path),
    },
  };
}

export default async function ParkingRegionPage({ params }: { params: Promise<RegionParams> }) {
  const p = await params;
  const countries = await getParkingCountries();
  const countryMatch = countries.find((country) => country.countrySlug === p.country);
  if (!countryMatch) {
    notFound();
  }
  const regions = await getParkingRegionsByCountry(p.country);
  const regionMatch = regions.find((region) => region.regionSlug === p.region);
  if (!regionMatch) {
    notFound();
  }

  const citiesBase = await getParkingCitiesByRegion(p.country, p.region);
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
          { label: "Parking Rules", href: "/parking-rules" },
          { label: countryName, href: `/parking-rules/${p.country}` },
          { label: regionMatch.region, href: `/parking-rules/${p.country}/${p.region}` },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Overnight parking guides in {regionMatch.region}
        </h1>
        <p className="text-sm text-slate-600">
          Select a city to review overnight parking bans, permits, and towing rules.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => (
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
                href={`/parking-rules/${p.country}/${p.region}/${city.citySlug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                View parking rules &rarr;
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}


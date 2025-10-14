import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getParkingCitiesByRegion,
  getParkingCountries,
  getParkingRegionsByCountry,
} from "@/lib/dataClient";
import { buildCanonicalPath } from "@/lib/seo";
import { formatDate, getCountryName } from "@/lib/utils";

export const revalidate = 60 * 60 * 24 * 7;

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
  params: RegionParams;
}): Promise<Metadata | undefined> {
  const regions = await getParkingRegionsByCountry(params.country);
  const match = regions.find((region) => region.regionSlug === params.region);
  if (!match) {
    return undefined;
  }
  const countries = await getParkingCountries();
  const country = countries.find((item) => item.countrySlug === params.country);
  if (!country) {
    return undefined;
  }
  const countryName = getCountryName(country.country);
  const path = `/parking-rules/${params.country}/${params.region}`;
  return {
    title: `Parking rules in ${match.region}, ${countryName}`,
    description: `Explore overnight parking bans, permit requirements, and towing enforcement across cities in ${match.region}, ${countryName}.`,
    alternates: {
      canonical: buildCanonicalPath(path),
    },
  };
}

export default async function ParkingRegionPage({ params }: { params: RegionParams }) {
  const countries = await getParkingCountries();
  const countryMatch = countries.find((country) => country.countrySlug === params.country);
  if (!countryMatch) {
    notFound();
  }
  const regions = await getParkingRegionsByCountry(params.country);
  const regionMatch = regions.find((region) => region.regionSlug === params.region);
  if (!regionMatch) {
    notFound();
  }

  const cities = await getParkingCitiesByRegion(params.country, params.region);
  const countryName = getCountryName(countryMatch.country);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Parking Rules", href: "/parking-rules" },
          { label: countryName, href: `/parking-rules/${params.country}` },
          { label: regionMatch.region, href: `/parking-rules/${params.country}/${params.region}` },
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">
            Cities in {regionMatch.region}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {cities.map((city) => (
              <li key={city.citySlug} className="flex items-center justify-between">
                <Link
                  href={`/parking-rules/${params.country}/${params.region}/${city.citySlug}`}
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
    </div>
  );
}

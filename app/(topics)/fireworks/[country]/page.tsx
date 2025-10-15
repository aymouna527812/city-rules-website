import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getFireworksCountries,
  getFireworksRegionsByCountry,
  getFireworksCitiesByRegion,
  getHeroImagePath,
} from "@/lib/dataClient";
import { buildCanonicalPath } from "@/lib/seo";
import { formatDate, getCountryName } from "@/lib/utils";

export const revalidate = 604800;

type CountryParams = {
  country: string;
};

export async function generateStaticParams() {
  const countries = await getFireworksCountries();
  return countries.map((country) => ({ country: country.countrySlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<CountryParams>;
}): Promise<Metadata | undefined> {
  const p = await params;
  const countries = await getFireworksCountries();
  const match = countries.find((country) => country.countrySlug === p.country);
  if (!match) {
    return undefined;
  }
  const countryName = getCountryName(match.country);
  const path = `/fireworks/${p.country}`;
  return {
    title: `Fireworks legality by region in ${countryName}`,
    description: `Review whether fireworks are permitted across regions in ${countryName}, including sale periods and enforcement.`,
    alternates: {
      canonical: buildCanonicalPath(path),
    },
  };
}

export default async function FireworksCountryPage({ params }: { params: Promise<CountryParams> }) {
  const p = await params;
  const countries = await getFireworksCountries();
  const match = countries.find((country) => country.countrySlug === p.country);
  if (!match) {
    notFound();
  }
  const regionsBase = await getFireworksRegionsByCountry(p.country);
  const regions = await Promise.all(
    regionsBase.map(async (region) => {
      const citiesBase = await getFireworksCitiesByRegion(p.country, region.regionSlug);
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
          { label: "Fireworks", href: "/fireworks" },
          { label: countryName, href: `/fireworks/${p.country}` },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Fireworks legality by region in {countryName}
        </h1>
        <p className="text-sm text-slate-600">
          Choose a region to confirm whether consumer fireworks are legal and when they may be used.
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
                Coverage: {region.hasStateRule ? "Statewide rule" : "Local rule"}
              </p>
              <p>
                Updated{" "}
                <time dateTime={region.lastVerified}>{formatDate(region.lastVerified)}</time>
              </p>
              <Link
                href={`/fireworks/${p.country}/${region.regionSlug}`}
                className="font-medium text-primary hover:underline"
              >
                View details
              </Link>
              <ul className="space-y-1 pt-1">
                {region.cities?.map((city) => (
                  <li key={city.citySlug} className="flex items-center justify-between gap-3">
                    <Link
                      href={`/fireworks/${p.country}/${region.regionSlug}/${city.citySlug}`}
                      className="flex items-center gap-3 text-primary hover:underline"
                    >
                      {city.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={city.image} alt="" className="h-6 w-9 rounded object-cover" loading="lazy" />
                      ) : null}
                      <span>{city.city}</span>
                    </Link>
                    <span className="text-xs text-slate-500">{formatDate(city.lastVerified)}</span>
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


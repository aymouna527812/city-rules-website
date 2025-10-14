import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getFireworksCountries,
  getFireworksRegionsByCountry,
} from "@/lib/dataClient";
import { buildCanonicalPath } from "@/lib/seo";
import { formatDate, getCountryName } from "@/lib/utils";

export const revalidate = 60 * 60 * 24 * 7;

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
  params: CountryParams;
}): Promise<Metadata | undefined> {
  const countries = await getFireworksCountries();
  const match = countries.find((country) => country.countrySlug === params.country);
  if (!match) {
    return undefined;
  }
  const countryName = getCountryName(match.country);
  const path = `/fireworks/${params.country}`;
  return {
    title: `Fireworks legality by region in ${countryName}`,
    description: `Review whether fireworks are permitted across regions in ${countryName}, including sale periods and enforcement.`,
    alternates: {
      canonical: buildCanonicalPath(path),
    },
  };
}

export default async function FireworksCountryPage({ params }: { params: CountryParams }) {
  const countries = await getFireworksCountries();
  const match = countries.find((country) => country.countrySlug === params.country);
  if (!match) {
    notFound();
  }
  const regions = await getFireworksRegionsByCountry(params.country);
  const countryName = getCountryName(match.country);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Fireworks", href: "/fireworks" },
          { label: countryName, href: `/fireworks/${params.country}` },
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
                href={`/fireworks/${params.country}/${region.regionSlug}`}
                className="font-medium text-primary hover:underline"
              >
                View details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

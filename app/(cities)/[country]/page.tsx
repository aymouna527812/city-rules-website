import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getCountries, getRegionsByCountry } from "@/lib/dataClient";
import { buildCanonicalPath } from "@/lib/seo";
import { formatDate, getCountryName } from "@/lib/utils";

export const revalidate = 60 * 60 * 24 * 7;

type CountryParams = {
  country: string;
};

export async function generateStaticParams() {
  const countries = await getCountries();
  return countries.map((country) => ({
    country: country.countrySlug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: CountryParams;
}): Promise<Metadata | undefined> {
  const countries = await getCountries();
  const match = countries.find((country) => country.countrySlug === params.country);
  if (!match) {
    return undefined;
  }
  const countryName = getCountryName(match.country);
  return {
    title: `${countryName} quiet hour rules by region`,
    description: `Browse quiet hour bylaws and enforcement contacts across ${countryName}.`,
    alternates: {
      canonical: buildCanonicalPath(`/${params.country}`),
    },
  };
}

export default async function CountryPage({ params }: { params: CountryParams }) {
  const countries = await getCountries();
  const match = countries.find((country) => country.countrySlug === params.country);
  if (!match) {
    notFound();
  }

  const countryName = getCountryName(match.country);
  const regions = await getRegionsByCountry(params.country);

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: countryName, href: `/${params.country}` }]} />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Quiet hours by region in {countryName}
        </h1>
        <p className="text-sm text-slate-600">
          Pick your province, state, or territory to see detailed quiet hour, construction, and enforcement rules.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {regions.map((region) => (
          <Card key={region.regionSlug}>
            <CardContent className="space-y-1 p-5">
              <CardTitle className="text-lg text-slate-900">{region.region}</CardTitle>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Updated <time dateTime={region.lastVerified}>{formatDate(region.lastVerified)}</time>
              </p>
              <Link
                href={`/${params.country}/${region.regionSlug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                View cities →
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

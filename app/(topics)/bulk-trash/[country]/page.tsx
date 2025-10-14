import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getBulkTrashCountries,
  getBulkTrashRegionsByCountry,
} from "@/lib/dataClient";
import { buildCanonicalPath } from "@/lib/seo";
import { formatDate, getCountryName } from "@/lib/utils";

export const revalidate = 60 * 60 * 24 * 7;

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
  params: CountryParams;
}): Promise<Metadata | undefined> {
  const countries = await getBulkTrashCountries();
  const match = countries.find((country) => country.countrySlug === params.country);
  if (!match) {
    return undefined;
  }
  const countryName = getCountryName(match.country);
  const path = `/bulk-trash/${params.country}`;
  return {
    title: `Bulk trash pickup by region in ${countryName}`,
    description: `Review service types, schedules, and item limits across regions in ${countryName}.`,
    alternates: {
      canonical: buildCanonicalPath(path),
    },
  };
}

export default async function BulkCountryPage({ params }: { params: CountryParams }) {
  const countries = await getBulkTrashCountries();
  const match = countries.find((country) => country.countrySlug === params.country);
  if (!match) {
    notFound();
  }

  const regions = await getBulkTrashRegionsByCountry(params.country);
  const countryName = getCountryName(match.country);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Bulk Trash", href: "/bulk-trash" },
          { label: countryName, href: `/bulk-trash/${params.country}` },
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
                href={`/bulk-trash/${params.country}/${region.regionSlug}`}
                className="font-medium text-primary hover:underline"
              >
                View cities
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

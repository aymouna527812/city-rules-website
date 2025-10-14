import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getCitiesByRegion, getDataset } from "@/lib/dataClient";
import { buildCanonicalPath } from "@/lib/seo";
import { formatDate, getCountryName } from "@/lib/utils";

export const revalidate = 60 * 60 * 24 * 7;

type RegionParams = {
  country: string;
  region: string;
};

export async function generateStaticParams() {
  const { records } = await getDataset();
  const combos = new Set<string>();

  records.forEach((record) => {
    combos.add(`${record.country_slug}__${record.region_slug}`);
  });

  return Array.from(combos).map((combo) => {
    const [country, region] = combo.split("__");
    return { country, region };
  });
}

export async function generateMetadata({
  params,
}: {
  params: RegionParams;
}): Promise<Metadata | undefined> {
  const { records } = await getDataset();
  const match = records.find(
    (record) =>
      record.country_slug === params.country && record.region_slug === params.region,
  );
  if (!match) {
    return undefined;
  }
  const countryName = getCountryName(match.country);
  return {
    title: `Quiet hours across ${match.region}, ${countryName}`,
    description: `Find city-specific quiet hour rules, construction schedules, and reporting contacts across ${match.region}, ${countryName}.`,
    alternates: {
      canonical: buildCanonicalPath(`/${params.country}/${params.region}`),
    },
  };
}

export default async function RegionPage({ params }: { params: RegionParams }) {
  const { records } = await getDataset();
  const match = records.find(
    (record) =>
      record.country_slug === params.country && record.region_slug === params.region,
  );
  if (!match) {
    notFound();
  }
  const countryName = getCountryName(match.country);
  const cities = await getCitiesByRegion(params.country, params.region);

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: countryName, href: `/${params.country}` },
          { label: match.region, href: `/${params.country}/${params.region}` },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Quiet hour guides across {match.region}
        </h1>
        <p className="text-sm text-slate-600">
          Choose your city for verified quiet hour schedules, enforcement contacts, and ready-to-send templates.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => (
          <Card key={city.citySlug}>
            <CardContent className="space-y-1 p-5">
              <CardTitle className="text-lg text-slate-900">{city.city}</CardTitle>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Updated <time dateTime={city.lastVerified}>{formatDate(city.lastVerified)}</time>
              </p>
              <Link
                href={`/${params.country}/${params.region}/${city.citySlug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                View quiet hours →
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

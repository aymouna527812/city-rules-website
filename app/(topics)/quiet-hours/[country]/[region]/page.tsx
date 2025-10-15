import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getCitiesByRegion, getDataset, getHeroImagePath } from "@/lib/dataClient";
import { buildCanonicalPath } from "@/lib/seo";
import { formatDate, getCountryName } from "@/lib/utils";

export const revalidate = 604800;

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
  params: Promise<RegionParams>;
}): Promise<Metadata | undefined> {
  const p = await params;
  const { records } = await getDataset();
  const match = records.find(
    (record) => record.country_slug === p.country && record.region_slug === p.region,
  );
  if (!match) {
    return undefined;
  }
  const countryName = getCountryName(match.country);
  return {
    title: `Quiet hours across ${match.region}, ${countryName}`,
    description: `Find city-specific quiet hour rules, construction schedules, and reporting contacts across ${match.region}, ${countryName}.`,
    alternates: {
      canonical: buildCanonicalPath(`/quiet-hours/${p.country}/${p.region}`),
    },
  };
}

export default async function RegionPage({ params }: { params: Promise<RegionParams> }) {
  const p = await params;
  const { records } = await getDataset();
  const match = records.find(
    (record) => record.country_slug === p.country && record.region_slug === p.region,
  );
  if (!match) {
    notFound();
  }
  const countryName = getCountryName(match.country);
  const cities = await getCitiesByRegion(p.country, p.region);
  const citiesWithImages = await Promise.all(
    cities.map(async (city) => ({
      ...city,
      image: await getHeroImagePath({
        countrySlug: p.country,
        regionSlug: p.region,
        citySlug: city.citySlug,
      }),
    })),
  );

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Quiet Hours", href: "/quiet-hours" },
          { label: countryName, href: `/quiet-hours/${p.country}` },
          { label: match.region, href: `/quiet-hours/${p.country}/${p.region}` },
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
        {citiesWithImages.map((city) => (
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
                href={`/quiet-hours/${p.country}/${p.region}/${city.citySlug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                View quiet hours &rarr;
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

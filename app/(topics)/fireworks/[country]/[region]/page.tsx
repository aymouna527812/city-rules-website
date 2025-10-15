import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdPlaceholder } from "@/components/AdPlaceholder";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CopySnippet } from "@/components/CopySnippet";
import { FAQ } from "@/components/FAQ";
import { FineNotice } from "@/components/FineNotice";
import { LastVerified } from "@/components/LastVerified";
import { ShareBar } from "@/components/ShareBar";
import { TopicHero } from "@/components/TopicHero";
import { TopicNav } from "@/components/TopicNav";
import { UpdateNotice } from "@/components/UpdateNotice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildFireworksMetadata,
  getSiteUrl,
} from "@/lib/seo";
import {
  buildFireworksFaqItems,
  buildFireworksTemplates,
} from "@/lib/topics";
import {
  getFireworksBySlug,
  getFireworksCitiesByRegion,
  getTopicNavEntries,
  listFireworksParams,
  getHeroImagePath,
} from "@/lib/dataClient";
import { formatDate, getCountryName } from "@/lib/utils";

export const revalidate = 604800;

type FireworksRegionParams = {
  country: string;
  region: string;
};

export async function generateStaticParams() {
  const params = await listFireworksParams();
  return params
    .filter((param) => !param.citySlug)
    .map((param) => ({
      country: param.countrySlug,
      region: param.regionSlug,
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<FireworksRegionParams>;
}): Promise<Metadata | undefined> {
  const p = await params;
  const record = await getFireworksBySlug({
    countrySlug: p.country,
    regionSlug: p.region,
  });
  if (!record) {
    return undefined;
  }
  const path = `/fireworks/${p.country}/${p.region}`;
  return buildFireworksMetadata(record, path);
}

export default async function FireworksRegionPage({ params }: { params: Promise<FireworksRegionParams> }) {
  const p = await params;
  const record = await getFireworksBySlug({
    countrySlug: p.country,
    regionSlug: p.region,
  });

  if (!record) {
    notFound();
  }

  const countryName = getCountryName(record.country);
  const path = `/fireworks/${p.country}/${p.region}`;
  const canonical = `${getSiteUrl()}${path}`;
  const faqs = buildFireworksFaqItems(record);
  const templates = buildFireworksTemplates(record, canonical);
  const topicNavEntries = await getTopicNavEntries({
    countrySlug: p.country,
    regionSlug: p.region,
  });
  const cityOverrides = await getFireworksCitiesByRegion(p.country, p.region);
  const citiesWithImages = await Promise.all(
    cityOverrides.map(async (c) => ({
      ...c,
      image: await getHeroImagePath({ countrySlug: p.country, regionSlug: p.region, citySlug: c.citySlug }),
    })),
  );

  const jurisdictionBadge =
    record.jurisdiction_level === "state"
      ? "State coverage"
      : record.jurisdiction_level === "county"
        ? "County coverage"
        : "City coverage";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Fireworks", href: "/fireworks" },
    { label: countryName, href: `/fireworks/${p.country}` },
    { label: record.region, href: path },
  ];

  const allowedText =
    typeof record.allowed_consumer_fireworks === "boolean"
      ? record.allowed_consumer_fireworks
        ? "Consumer fireworks are permitted with restrictions."
        : "Consumer fireworks are not permitted."
      : "Consumer fireworks are restricted to limited device types.";

  return (
    <>
      <div className="space-y-8">
        <Breadcrumbs items={breadcrumbs} />
        <TopicHero
          title={`Fireworks Legality in ${record.region}`}
          description="Review sale periods, use hours, and enforcement notes before planning fireworks displays."
          countryCode={record.country}
          region={record.region}
          timezone={record.timezone}
          jurisdictionLabel={jurisdictionBadge}
        >
          <LastVerified date={record.last_verified} />
        </TopicHero>

        <TopicNav activeTopic="fireworks" entries={topicNavEntries} />

        <FineNotice
          range={record.fine_range ?? record.enforcement_notes}
          notes={record.fine_range ? record.enforcement_notes : undefined}
        />

        <UpdateNotice>
          Always confirm with your local fire authority before purchasing or lighting fireworks.
        </UpdateNotice>

        <AdPlaceholder slot="fireworks-region-top" />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Regulation summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>{allowedText}</p>
            <p>
              <span className="font-semibold text-slate-900">Sale periods:</span>{" "}
              {record.sale_periods}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Use hours:</span>{" "}
              {record.use_hours}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Permit required:</span>{" "}
              {record.permit_required ? "Yes" : "No"}
            </p>
          </CardContent>
        </Card>

        {record.county_overrides ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">County overrides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              {record.county_overrides.map((item) => (
                <p key={item.county}>
                  <span className="font-semibold text-slate-900">{item.county}:</span>{" "}
                  {item.rules}
                </p>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {record.city_overrides || cityOverrides.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">City-specific rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              {record.city_overrides?.map((item) => (
                <p key={item.city}>
                  <span className="font-semibold text-slate-900">{item.city}:</span>{" "}
                  {item.rules}
                </p>
              ))}
              {cityOverrides.map((city) => (
                <p key={city.citySlug}>
                  <Link
                    href={`/fireworks/${p.country}/${p.region}/${city.citySlug}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {city.city}
                  </Link>{" "}
                  â€“ updated {formatDate(city.lastVerified)}
                </p>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {citiesWithImages.length > 0 ? (
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
                    href={`/fireworks/${p.country}/${p.region}/${city.citySlug}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View fireworks &rarr;
                  </Link>
                </CardContent>
              </Card>
            ))}
          </section>
        ) : null}

        <AdPlaceholder slot="fireworks-region-mid" />

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Official guidance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p>
                Source:{" "}
                <Link
                  href={record.source_url}
                  className="font-medium text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {record.source_title}
                </Link>
              </p>
              <p>
                Last verified on{" "}
                <time dateTime={record.last_verified}>{formatDate(record.last_verified)}</time>.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Polite neighbour notice</CardTitle>
            </CardHeader>
            <CardContent>
              <CopySnippet label="Share with neighbours" content={templates.politeNotice} />
            </CardContent>
          </Card>
        </section>

        <AdPlaceholder slot="fireworks-region-before-faq" />

        <FAQ items={faqs} />

        <ShareBar url={canonical} title={`Fireworks rules in ${record.region}`} />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildBreadcrumbJsonLd(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildFaqJsonLd(faqs) }}
      />
    </>
  );
}


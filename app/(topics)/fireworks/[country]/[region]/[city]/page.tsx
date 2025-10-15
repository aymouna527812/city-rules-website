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
  getTopicNavEntries,
  listFireworksParams,
} from "@/lib/dataClient";
import { formatDate, getCountryName } from "@/lib/utils";

export const revalidate = 604800;

type FireworksCityParams = {
  country: string;
  region: string;
  city: string;
};

export async function generateStaticParams() {
  const params = await listFireworksParams();
  return params
    .filter((param) => param.citySlug)
    .map((param) => ({
      country: param.countrySlug,
      region: param.regionSlug,
      city: param.citySlug!,
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<FireworksCityParams>;
}): Promise<Metadata | undefined> {
  const p = await params;
  const record = await getFireworksBySlug({
    countrySlug: p.country,
    regionSlug: p.region,
    citySlug: p.city,
  });
  if (!record) {
    return undefined;
  }
  const path = `/fireworks/${p.country}/${p.region}/${p.city}`;
  return buildFireworksMetadata(record, path);
}

export default async function FireworksCityPage({ params }: { params: Promise<FireworksCityParams> }) {
  const p = await params;
  const record = await getFireworksBySlug({
    countrySlug: p.country,
    regionSlug: p.region,
    citySlug: p.city,
  });

  if (!record) {
    notFound();
  }

  const countryName = getCountryName(record.country);
  const path = `/fireworks/${p.country}/${p.region}/${p.city}`;
  const canonical = `${getSiteUrl()}${path}`;
  const faqs = buildFireworksFaqItems(record);
  const templates = buildFireworksTemplates(record, canonical);
  const topicNavEntries = await getTopicNavEntries({
    countrySlug: p.country,
    regionSlug: p.region,
    citySlug: p.city,
  });

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Fireworks", href: "/fireworks" },
    { label: countryName, href: `/fireworks/${p.country}` },
    { label: record.region, href: `/fireworks/${p.country}/${p.region}` },
    { label: record.city ?? "City", href: path },
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
          title={`Fireworks Legality in ${record.city}, ${record.region}`}
          description="Understand how local bylaws treat consumer fireworks, and when usage is allowed."
          countryCode={record.country}
          region={record.region}
          city={record.city}
          timezone={record.timezone}
          jurisdictionLabel="City coverage"
        >
          <LastVerified date={record.last_verified} />
        </TopicHero>

        <TopicNav activeTopic="fireworks" entries={topicNavEntries} />

        <FineNotice
          range={record.fine_range ?? record.enforcement_notes}
          notes={record.fine_range ? record.enforcement_notes : undefined}
        />

        <UpdateNotice>
          Fireworks enforcement is handled by local fire prevention officers. Confirm rules before
          purchasing or lighting fireworks.
        </UpdateNotice>

        <AdPlaceholder slot="fireworks-city-top" />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">City rules at a glance</CardTitle>
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
            <p>
              <span className="font-semibold text-slate-900">Age restrictions:</span>{" "}
              {record.age_restrictions}
            </p>
          </CardContent>
        </Card>

        {record.city_overrides ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Local overrides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              {record.city_overrides.map((item) => (
                <p key={item.city}>
                  <span className="font-semibold text-slate-900">{item.city}:</span>{" "}
                  {item.rules}
                </p>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <AdPlaceholder slot="fireworks-city-mid" />

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

        <AdPlaceholder slot="fireworks-city-before-faq" />

        <FAQ items={faqs} />

        <ShareBar url={canonical} title={`Fireworks rules in ${record.city}`} />
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


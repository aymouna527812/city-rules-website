import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdPlaceholder } from "@/components/AdPlaceholder";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CopySnippet } from "@/components/CopySnippet";
import { FAQ } from "@/components/FAQ";
import { KeyValue } from "@/components/KeyValue";
import { LastVerified } from "@/components/LastVerified";
import { ServiceTable } from "@/components/ServiceTable";
import { ShareBar } from "@/components/ShareBar";
import { TopicHero } from "@/components/TopicHero";
import { TopicNav } from "@/components/TopicNav";
import { UpdateNotice } from "@/components/UpdateNotice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildBreadcrumbJsonLd,
  buildBulkTrashMetadata,
  buildFaqJsonLd,
  getSiteUrl,
} from "@/lib/seo";
import {
  buildBulkTrashFaqItems,
  buildBulkTrashTemplates,
} from "@/lib/topics";
import {
  getBulkTrashBySlug,
  getTopicNavEntries,
  listBulkTrashParams,
  getHeroImagePath,
} from "@/lib/dataClient";
import { formatDate, getCountryName } from "@/lib/utils";

export const revalidate = 604800;

type BulkCityParams = {
  country: string;
  region: string;
  city: string;
};

export async function generateStaticParams() {
  const params = await listBulkTrashParams();
  return params.map((param) => ({
    country: param.countrySlug,
    region: param.regionSlug,
    city: param.citySlug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<BulkCityParams>;
}): Promise<Metadata | undefined> {
  const p = await params;
  const record = await getBulkTrashBySlug({
    countrySlug: p.country,
    regionSlug: p.region,
    citySlug: p.city,
  });
  if (!record) {
    return undefined;
  }
  const path = `/bulk-trash/${p.country}/${p.region}/${p.city}`;
  return buildBulkTrashMetadata(record, path);
}

export default async function BulkTrashCityPage({ params }: { params: Promise<BulkCityParams> }) {
  const p = await params;
  const record = await getBulkTrashBySlug({
    countrySlug: p.country,
    regionSlug: p.region,
    citySlug: p.city,
  });

  if (!record) {
    notFound();
  }

  const countryName = getCountryName(record.country);
  const path = `/bulk-trash/${p.country}/${p.region}/${p.city}`;
  const canonical = `${getSiteUrl()}${path}`;
  const heroImage = await getHeroImagePath({
    countrySlug: p.country,
    regionSlug: p.region,
    citySlug: p.city,
  });
  const faqs = buildBulkTrashFaqItems(record);
  const templates = buildBulkTrashTemplates(record, canonical);
  const topicNavEntries = await getTopicNavEntries({
    countrySlug: p.country,
    regionSlug: p.region,
    citySlug: p.city,
  });

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Bulk Trash", href: "/bulk-trash" },
    { label: countryName, href: `/bulk-trash/${p.country}` },
    { label: record.region, href: `/bulk-trash/${p.country}/${p.region}` },
    { label: record.city, href: path },
  ];

  return (
    <>
      <div className="space-y-8">
        <Breadcrumbs items={breadcrumbs} />

        <TopicHero
          title={`Bulk Trash & Large-Item Pickup in ${record.city}`}
          description="Confirm when large items are collected, what needs an appointment, and how to prepare your pickup."
          countryCode={record.country}
          region={record.region}
          city={record.city}
          timezone={record.timezone}
          imageSrc={heroImage}
        >
          <LastVerified date={record.last_verified} />
        </TopicHero>

        <TopicNav activeTopic="bulk-trash" entries={topicNavEntries} />

        <section className="grid gap-4 lg:grid-cols-2">
          <KeyValue label="Service type" value={record.service_type} helper={record.schedule_pattern} />
          <KeyValue
            label="Limits"
            value={record.limits}
            helper={`Fees: ${record.fees}`}
          />
          <KeyValue
            label="Appointment or request"
            value={
              record.request_url ? (
                <Link href={record.request_url} className="font-medium text-primary hover:underline">
                  Request pickup online
                </Link>
              ) : (
                "Refer to local hotline"
              )
            }
            helper="Submit requests before placing items curbside."
          />
          <KeyValue
            label="Illegal dumping"
            value={record.illegal_dumping_reporting}
            helper="Report abandoned piles or improper dumping immediately."
          />
        </section>

        <UpdateNotice>
          Place items on the curb no more than 24 hours in advance and separate metal or hazardous
          items as required by your municipality.
        </UpdateNotice>

        <AdPlaceholder slot="bulk-city-top" />

        <ServiceTable
          title="What to put at the curb"
          rows={[
            {
              label: "Accepted items",
              value: record.eligible_items.join(", "),
            },
            {
              label: "Not accepted",
              value: record.not_accepted_items.join(", "),
            },
            {
              label: "Holiday shifts",
              value: record.holiday_shifts,
            },
          ]}
        />

        <AdPlaceholder slot="bulk-city-mid" />

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Official service info</CardTitle>
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
              <CardTitle className="text-lg">Pickup request template</CardTitle>
            </CardHeader>
            <CardContent>
              <CopySnippet label="Appointment request email" content={templates.appointmentRequest} />
            </CardContent>
          </Card>
        </section>

        <AdPlaceholder slot="bulk-city-before-faq" />

        <FAQ items={faqs} />

        <ShareBar url={canonical} title={`Bulk trash pickup in ${record.city}`} />
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


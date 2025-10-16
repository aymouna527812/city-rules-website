import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdPlaceholder } from "@/components/AdPlaceholder";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CopySnippet } from "@/components/CopySnippet";
import { FAQ } from "@/components/FAQ";
import { FineNotice } from "@/components/FineNotice";
import { KeyValue } from "@/components/KeyValue";
import { LastVerified } from "@/components/LastVerified";
import { ShareBar } from "@/components/ShareBar";
import { TopicHero } from "@/components/TopicHero";
import { TopicNav } from "@/components/TopicNav";
import { UpdateNotice } from "@/components/UpdateNotice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
  buildParkingMetadata,
  getSiteUrl,
} from "@/lib/seo";
import {
  buildParkingFaqItems,
  buildParkingTemplates,
} from "@/lib/topics";
import {
  getParkingBySlug,
  getTopicNavEntries,
  listParkingParams,
  getHeroImagePath,
} from "@/lib/dataClient";
import { formatDate, getCountryName } from "@/lib/utils";

export const revalidate = 604800;

type ParkingCityParams = {
  country: string;
  region: string;
  city: string;
};

export async function generateStaticParams() {
  const params = await listParkingParams();
  return params.map((param) => ({
    country: param.countrySlug,
    region: param.regionSlug,
    city: param.citySlug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<ParkingCityParams>;
}): Promise<Metadata | undefined> {
  const p = await params;
  const record = await getParkingBySlug({
    countrySlug: p.country,
    regionSlug: p.region,
    citySlug: p.city,
  });
  if (!record) {
    return undefined;
  }
  const path = `/parking-rules/${p.country}/${p.region}/${p.city}`;
  return buildParkingMetadata(record, path);
}

export default async function ParkingCityPage({ params }: { params: Promise<ParkingCityParams> }) {
  const p = await params;
  const record = await getParkingBySlug({
    countrySlug: p.country,
    regionSlug: p.region,
    citySlug: p.city,
  });

  if (!record) {
    notFound();
  }

  const countryName = getCountryName(record.country);
  const path = `/parking-rules/${p.country}/${p.region}/${p.city}`;
  const canonical = `${getSiteUrl()}${path}`;
  const heroImage = await getHeroImagePath({
    countrySlug: p.country,
    regionSlug: p.region,
    citySlug: p.city,
  });
  const faqs = buildParkingFaqItems(record);
  const templates = buildParkingTemplates(record, canonical);
  const topicNavEntries = await getTopicNavEntries({
    countrySlug: p.country,
    regionSlug: p.region,
    citySlug: p.city,
  });

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Parking Rules", href: "/parking-rules" },
    { label: countryName, href: `/parking-rules/${p.country}` },
    {
      label: record.region,
      href: `/parking-rules/${p.country}/${p.region}`,
    },
    {
      label: record.city,
      href: path,
    },
  ];

  return (
    <>
      <div className="space-y-8">
        <Breadcrumbs items={breadcrumbs} />
        <TopicHero
          title={`Overnight Parking & Winter Bans in ${record.city}`}
          description="Know when to move your vehicle, which streets require permits, and how towing is enforced during winter bans."
          countryCode={record.country}
          region={record.region}
          city={record.city}
          timezone={record.timezone}
          jurisdictionLabel="City coverage"
          imageSrc={heroImage}
        >
          <LastVerified date={record.last_verified} />
        </TopicHero>

        {record.seo_text ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 text-base text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <div dangerouslySetInnerHTML={{ __html: record.seo_text }} />
          </section>
        ) : null}

        <TopicNav activeTopic="parking-rules" entries={topicNavEntries} />

        <section className="grid gap-4 lg:grid-cols-2">
          <KeyValue
            label="Overnight parking"
            value={
              record.overnight_parking_allowed === "varies"
                ? "Varies by posted signage"
                : record.overnight_parking_allowed
                  ? "Allowed when no bans active"
                  : "Prohibited on public streets"
            }
            helper={`Typical overnight window: ${record.overnight_hours}`}
          />
          <KeyValue
            label="Permit requirement"
            value={record.permit_required ? "Permit required" : "No permit required"}
            helper={
              record.permit_required && record.permit_url ? (
                <Link href={record.permit_url} className="font-medium text-primary hover:underline">
                  Apply for a residential permit
                </Link>
              ) : undefined
            }
          />
          <KeyValue
            label="Winter parking ban"
            value={record.winter_ban ? "Active" : "Not listed"}
            helper={
              record.winter_ban
                ? `Ban months: ${record.winter_ban_months}. Hours: ${record.winter_ban_hours}.`
                : "No seasonal ban recorded, but snow emergencies may trigger restrictions."
            }
          />
          <KeyValue
            label="Towing enforced"
            value={record.towing_enforced ? "Yes, towing enforced" : "Limited towing"}
            helper={
              record.tow_zones_map_url ? (
                <Link
                  href={record.tow_zones_map_url}
                  className="font-medium text-primary hover:underline"
                >
                  View tow zone map
                </Link>
              ) : undefined
            }
          />
        </section>

        <FineNotice
          range={record.fine_range ?? record.ticket_amounts}
          notes={record.ticket_amounts !== record.fine_range ? record.ticket_amounts : undefined}
        />

        <UpdateNotice message="Always confirm the latest posted signage before leaving a vehicle overnight.">
          During snow emergencies the municipality advises:{" "}
          <span className="font-medium text-slate-800">{record.snow_emergency_rules}</span>.
        </UpdateNotice>

        <AdPlaceholder slot="parking-city-top" />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parking details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-slate-900">Overnight window:</span>{" "}
              {record.overnight_hours}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Winter ban months:</span>{" "}
              {record.winter_ban_months}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Snow emergency:</span>{" "}
              {record.snow_emergency_rules}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Typical ticket amounts:</span>{" "}
              {record.ticket_amounts}
            </p>
          </CardContent>
        </Card>

        <AdPlaceholder slot="parking-city-mid" />

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Official resources</CardTitle>
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
                Last checked on{" "}
                <time dateTime={record.last_verified}>{formatDate(record.last_verified)}</time>.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Snow emergency template</CardTitle>
            </CardHeader>
            <CardContent>
              <CopySnippet label="Message to landlord or HOA" content={templates.snowEmergency} />
            </CardContent>
          </Card>
        </section>

        <AdPlaceholder slot="parking-city-before-faq" />

        <FAQ items={faqs} />

        <section className="space-y-4">
          <ShareBar url={canonical} title={`Parking rules in ${record.city}`} />
        </section>
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


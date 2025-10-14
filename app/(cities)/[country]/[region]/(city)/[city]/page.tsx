import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  Gavel,
  Hammer,
  Leaf,
  Mail,
  Music2,
  PhoneCall,
  Volume2,
} from "lucide-react";

import { AdPlaceholder } from "@/components/AdPlaceholder";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CityHero } from "@/components/CityHero";
import { FAQ } from "@/components/FAQ";
import { RuleCard } from "@/components/RuleCard";
import { ShareBar } from "@/components/ShareBar";
import { CopySnippet } from "@/components/CopySnippet";
import { TopicNav } from "@/components/TopicNav";
import { UpdateNotice } from "@/components/UpdateNotice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildFaqItems, buildRelatedLinks, buildSuggestUpdateEmail } from "@/lib/city";
import { getCityRecord, getDataset, getTopicNavEntries, getHeroImagePath } from "@/lib/dataClient";
import { buildCityMetadata, buildFaqJsonLd, buildBreadcrumbJsonLd, getSiteUrl } from "@/lib/seo";
import { formatDate, getCountryName } from "@/lib/utils";

export const revalidate = 60 * 60 * 24 * 7;

type CityPageParams = {
  country: string;
  region: string;
  city: string;
};

export async function generateStaticParams() {
  const { records } = await getDataset();

  return records.map((record) => ({
    country: record.country_slug,
    region: record.region_slug,
    city: record.city_slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: CityPageParams;
}): Promise<Metadata | undefined> {
  const record = await getCityRecord({
    countrySlug: params.country,
    regionSlug: params.region,
    citySlug: params.city,
  });

  if (!record) {
    return undefined;
  }

  const path = `/${params.country}/${params.region}/${params.city}`;
  return buildCityMetadata(record, path);
}

export default async function CityPage({ params }: { params: CityPageParams }) {
  const record = await getCityRecord({
    countrySlug: params.country,
    regionSlug: params.region,
    citySlug: params.city,
  });

  if (!record) {
    notFound();
  }

  const topicNavEntries = await getTopicNavEntries({
    countrySlug: params.country,
    regionSlug: params.region,
    citySlug: params.city,
  });

  const path = `/${params.country}/${params.region}/${params.city}`;
  const canonical = `${getSiteUrl()}${path}`;
  const heroImage = await getHeroImagePath({
    countrySlug: params.country,
    regionSlug: params.region,
    citySlug: params.city,
  });
  const faqs = buildFaqItems(record);
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Quiet Hours", href: "/quiet-hours" },
    { label: getCountryName(record.country), href: `/${params.country}` },
    { label: record.region, href: `/${params.country}/${params.region}` },
    { label: record.city, href: path },
  ];
  const relatedLinks = buildRelatedLinks(record);
  const suggestUpdateMailto = buildSuggestUpdateEmail(record, canonical);

  return (
    <>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        <CityHero record={record} imageSrc={heroImage} />

        {record.seo_text ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 text-base text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <div dangerouslySetInnerHTML={{ __html: record.seo_text }} />
          </section>
        ) : null}

        <TopicNav activeTopic="quiet-hours" entries={topicNavEntries} />

        <section className="grid gap-4 md:grid-cols-2">
          <RuleCard
            icon={CalendarClock}
            title="Residential quiet hours"
            value={record.default_quiet_hours}
            helper={
              record.weekend_quiet_hours
                ? `Weekends & holidays: ${record.weekend_quiet_hours}`
                : "Applies to indoor and outdoor amplified noise."
            }
          />
          <RuleCard
            icon={Volume2}
            title="Decibel limits"
            value={
              record.residential_decibel_limit_day || record.residential_decibel_limit_night
                ? [
                    record.residential_decibel_limit_day
                      ? `${record.residential_decibel_limit_day} dBA daytime`
                      : undefined,
                    record.residential_decibel_limit_night
                      ? `${record.residential_decibel_limit_night} dBA night`
                      : undefined,
                  ]
                    .filter(Boolean)
                    .join(" / ")
                : "Qualitative limits enforced"
            }
            helper="Measured inside receiving residence."
          />
          <RuleCard
            id="construction-hours"
            icon={Hammer}
            title="Construction hours"
            value={record.construction_hours_weekday}
            helper={`Weekends: ${record.construction_hours_weekend}`}
          />
          <RuleCard
            id="lawn-equipment"
            icon={Leaf}
            title="Lawn equipment"
            value={record.lawn_equipment_hours}
            helper="Includes gas-powered blowers, mowers, trimmers."
          />
          <RuleCard
            icon={Music2}
            title="Party & music rules"
            value={record.party_music_rules}
          />
          <RuleCard
            icon={Gavel}
            title="Typical fines"
            value={record.fine_range}
            helper={
              record.first_offense_fine
                ? `First offense: ~$${record.first_offense_fine} (varies by case)`
                : "Escalating penalties for repeat violations."
            }
          />
        </section>

        <AdPlaceholder slot="city-above-fold" />

        <section
          id="enforcement"
          className="grid gap-4 lg:grid-cols-[1.6fr_1fr]"
          aria-labelledby="enforcement-heading"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle id="enforcement-heading" className="flex items-center gap-2 text-xl">
                <PhoneCall className="h-5 w-5 text-primary" aria-hidden />
                Noise enforcement & reporting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>
                Call or report via <strong>{record.complaint_channel}</strong>. Provide dates, times,
                and source details so dispatchers can prioritise the call. Anonymous complaints are
                accepted but detailed contact information helps with follow-up.
              </p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  Document the issue (record short clips, note times, and track duration for at least
                  two nights if possible).
                </li>
                <li>
                  Share a polite note with the neighbour or property manager. See the message
                  templates below.
                </li>
                <li>
                  Submit a complaint via{" "}
                  <Link
                    href={record.complaint_url}
                    className="font-medium text-primary hover:underline"
                  >
                    {record.complaint_url}
                  </Link>{" "}
                  or call {record.complaint_channel}. Ask for the incident number for reference.
                </li>
                <li>
                  If the noise continues, follow up with enforcement referencing the incident number.
                  Keep your documentation for any tribunal or landlord board filings.
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Mail className="h-5 w-5 text-primary" aria-hidden />
                Ready-to-send messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <CopySnippet label="Neighbour note" content={record.templates.neighbor_message} />
              <CopySnippet
                label="Landlord / property manager"
                content={record.templates.landlord_message}
              />
            </CardContent>
          </Card>
        </section>

        <UpdateNotice>
          Noise bylaws are updated by municipal councils. Confirm details with the latest city
          notices before relying on this summary.
        </UpdateNotice>

        <AdPlaceholder slot="city-mid-content" />

        <section
          id="lawn-equipment"
          className="grid gap-4 md:grid-cols-[1.5fr_1fr]"
          aria-labelledby="source-heading"
        >
          <Card>
            <CardHeader>
              <CardTitle id="source-heading" className="text-xl">
                Official bylaw source
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-800">Source:</span>{" "}
              <Link
                href={record.bylaw_url}
                className="font-medium text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {record.bylaw_title}
              </Link>
            </p>
            <p>
              This summary reflects updates verified on{" "}
              <time dateTime={record.last_verified}>{formatDate(record.last_verified)}</time>.
              Always confirm with the latest municipal notices before acting.
            </p>
          </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Tips for quieter living</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              <ul className="list-disc space-y-1 pl-5">
                {record.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <ShareBar url={canonical} title={`Quiet hours in ${record.city}`} />
          <div>
            <Button asChild variant="ghost" size="sm">
              <a href={suggestUpdateMailto}>Suggest an update</a>
            </Button>
          </div>
        </section>

        <AdPlaceholder slot="city-before-faq" />

        <FAQ items={faqs} />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Related resources</h2>
          <ul className="space-y-2 text-sm text-primary">
            {relatedLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:underline">
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildBreadcrumbJsonLd(breadcrumbItems) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildFaqJsonLd(faqs) }}
      />
    </>
  );
}





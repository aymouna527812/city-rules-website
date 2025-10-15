import Link from "next/link";

import { CitySearch } from "@/components/CitySearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDataset, getHeroImagePath, getTopicSearchIndex } from "@/lib/dataClient";
import { formatDate } from "@/lib/utils";
import { TimeText } from "@/components/TimeText";

export default async function MarketingHome() {
  const searchItems = await getTopicSearchIndex();
  const { records } = await getDataset();
  const featuredCitiesRaw = records.slice(0, 4);
  const featuredCities = await Promise.all(
    featuredCitiesRaw.map(async (city) => ({
      ...city,
      image: await getHeroImagePath({
        countrySlug: city.country_slug,
        regionSlug: city.region_slug,
        citySlug: city.city_slug,
      }),
    })),
  );

  return (
    <div className="space-y-16">
      <section className="space-y-6 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-6 py-10 shadow-sm sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Know your rights. Rest easier.
        </p>
        <h1 className="text-4xl font-bold leading-tight text-slate-900 dark:text-slate-100 md:text-5xl">
          Quiet hours, parking, bulk trash, and fireworks rules for major cities.
        </h1>
        <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          No more late-night Googling. Get verified quiet hour schedules, parking bans, bulk pickup windows, and fireworks ordinances in one place.
        </p>
        <CitySearch items={searchItems} />
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Cities are verified at least every quarter. Next refresh:{" "}
          <strong>{formatDate(records[0]?.last_verified ?? new Date().toISOString().slice(0, 10))}</strong>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Featured cities</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Recently updated guides with step-by-step enforcement tips.
            </p>
          </div>
          <Link href="/quiet-hours" className="text-sm font-medium text-primary hover:underline dark:text-sky-400">
            View all cities &rarr;
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {featuredCities.map((city) => (
            <Card key={city.city_slug}>
              {city.image ? (
                <div className="overflow-hidden rounded-t-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={city.image} alt="" className="h-32 w-full object-cover" loading="lazy" />
                </div>
              ) : null}
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  {city.city}, {city.region}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p>
                  Quiet hours: <strong><TimeText value={city.default_quiet_hours} /></strong>
                </p>
                <p>
                  Enforcement: <strong>{city.complaint_channel}</strong>
                </p>
                <Link
                  href={`/quiet-hours/${city.country_slug}/${city.region_slug}/${city.city_slug}`}
                  className="font-medium text-primary hover:underline dark:text-sky-400"
                >
                  Open city guide &rarr;
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Verified municipal data</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300">
              We read bylaws directly from city codes and flag the sections that impact residential
              noise, construction, and fines.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Plain-language staging</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300">
              Every page condenses what matters&mdash;quiet hours, decibel charts, complaint steps, and
              ready-to-send messages for neighbours or landlords.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Updated quarterly</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300">
              We recheck each jurisdiction at least quarterly and whenever a bylaw amendment is
              published. Suggest an update anytime&mdash;we respond fast.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-dashed border-amber-400 bg-amber-50/60 p-6 text-sm text-slate-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
        <h2 className="text-lg font-semibold text-amber-700 dark:text-amber-200">Disclaimer</h2>
        <p>
          Quiet Hours &amp; Noise Rules summarises public information to help you plan polite,
          enforceable conversations. Our summaries do not replace legal advice. Always confirm
          details with the latest municipal bylaw or contact city staff if you need a formal ruling.
        </p>
      </section>
    </div>
  );
}







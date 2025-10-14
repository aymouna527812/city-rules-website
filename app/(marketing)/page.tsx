import Link from "next/link";

import { CitySearch } from "@/components/CitySearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDataset, getSearchIndex } from "@/lib/dataClient";
import { formatDate } from "@/lib/utils";

export default async function MarketingHome() {
  const searchItems = await getSearchIndex();
  const { records } = await getDataset();
  const featuredCities = records.slice(0, 4);

  return (
    <div className="space-y-16">
      <section className="space-y-6 rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Know your rights. Rest easier.
        </p>
        <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
          Quiet hours and noise rules for every major city.
        </h1>
        <p className="max-w-2xl text-lg text-slate-600">
          No more late-night Googling. Get verified quiet hour schedules, decibel limits,
          construction timelines, and reporting templates in one place.
        </p>
        <CitySearch items={searchItems} />
        <div className="text-sm text-slate-500">
          Cities are verified at least every quarter. Next refresh:{" "}
          <strong>{formatDate(records[0]?.last_verified ?? new Date().toISOString().slice(0, 10))}</strong>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Featured cities</h2>
            <p className="text-sm text-slate-600">
              Recently updated guides with step-by-step enforcement tips.
            </p>
          </div>
          <Link href="/quiet-hours" className="text-sm font-medium text-primary hover:underline">
            View all cities →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {featuredCities.map((city) => (
            <Card key={city.city_slug}>
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  {city.city}, {city.region}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <p>
                  Quiet hours: <strong>{city.default_quiet_hours}</strong>
                </p>
                <p>
                  Enforcement: <strong>{city.complaint_channel}</strong>
                </p>
                <Link
                  href={`/${city.country_slug}/${city.region_slug}/${city.city_slug}`}
                  className="font-medium text-primary hover:underline"
                >
                  Open city guide →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Verified municipal data</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              We read bylaws directly from city codes and flag the sections that impact residential
              noise, construction, and fines.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Plain-language staging</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Every page condenses what matters—quiet hours, decibel charts, complaint steps, and
              ready-to-send messages for neighbours or landlords.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Updated quarterly</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              We recheck each jurisdiction at least quarterly and whenever a bylaw amendment is
              published. Suggest an update anytime—we respond fast.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-dashed border-amber-400 bg-amber-50/60 p-6 text-sm text-slate-700">
        <h2 className="text-lg font-semibold text-amber-700">Disclaimer</h2>
        <p>
          Quiet Hours &amp; Noise Rules summarises public information to help you plan polite,
          enforceable conversations. Our summaries do not replace legal advice. Always confirm
          details with the latest municipal bylaw or contact city staff if you need a formal ruling.
        </p>
      </section>
    </div>
  );
}

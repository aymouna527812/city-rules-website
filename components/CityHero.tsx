import { LastVerified } from "@/components/LastVerified";
import type { QuietHoursRecord } from "@/lib/types";
import { getCountryName, getFlagEmoji } from "@/lib/utils";

type CityHeroProps = {
  record: QuietHoursRecord;
};

function formatLocalTime(timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone,
    }).format(new Date());
  } catch {
    return timezone;
  }
}

export function CityHero({ record }: CityHeroProps) {
  const countryName = getCountryName(record.country);
  const flag = getFlagEmoji(record.country);
  const localTime = formatLocalTime(record.timezone);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-300">
            {flag} {countryName} - {record.timezone} (local time {localTime})
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl">
            Quiet Hours &amp; Noise Rules in {record.city}, {record.region}
          </h1>
          <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
            Confirm quiet hours, decibel limits, construction schedules, and reporting steps so you
            can keep the peace in your neighbourhood.
          </p>
          <LastVerified date={record.last_verified} />
        </div>
        <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-200">
          <p className="font-semibold text-slate-800 dark:text-slate-100">Need a quick answer?</p>
          <p>
            Default quiet hours: <strong>{record.default_quiet_hours}</strong>
          </p>
          {record.weekend_quiet_hours ? (
            <p>
              Weekends/holidays: <strong>{record.weekend_quiet_hours}</strong>
            </p>
          ) : null}
          <p>
            Construction weekdays: <strong>{record.construction_hours_weekday}</strong>
          </p>
          <p>
            Construction weekends: <strong>{record.construction_hours_weekend}</strong>
          </p>
        </div>
      </div>
    </section>
  );
}

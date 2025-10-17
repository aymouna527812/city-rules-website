import { LastVerified } from "@/components/LastVerified";
import type { QuietHoursRecord } from "@/lib/types";
import { getCountryName, getFlagEmoji } from "@/lib/utils";
import { TimeText } from "@/components/TimeText";

type CityHeroProps = {
  record: QuietHoursRecord;
  imageSrc?: string;
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

export function CityHero({ record, imageSrc }: CityHeroProps) {
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
            <strong>Default quiet hours:</strong> <TimeText value={record.default_quiet_hours} />
          </p>
          {record.weekend_quiet_hours ? (
            <p>
              <strong>Weekends/holidays:</strong> <TimeText value={record.weekend_quiet_hours} />
            </p>
          ) : null}
          <p>
            <strong>Construction weekdays:</strong> <TimeText value={record.construction_hours_weekday} />
          </p>
          <p>
            <strong>Construction weekends:</strong> <TimeText value={record.construction_hours_weekend} />
          </p>
        </div>
      </div>
      {imageSrc ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={`${record.city}, ${record.region} skyline`}
            className="h-40 w-full object-cover md:h-48"
            loading="lazy"
          />
        </div>
      ) : null}
    </section>
  );
}

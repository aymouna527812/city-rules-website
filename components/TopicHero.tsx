import { getCountryName, getFlagEmoji } from "@/lib/utils";

type TopicHeroProps = {
  title: string;
  description?: string;
  countryCode: string;
  region: string;
  city?: string;
  timezone: string;
  jurisdictionLabel?: string;
  children?: React.ReactNode;
  imageSrc?: string;
};

export function TopicHero({
  title,
  description,
  countryCode,
  region,
  city,
  timezone,
  jurisdictionLabel,
  children,
  imageSrc,
}: TopicHeroProps) {
  const countryName = getCountryName(countryCode);
  const flag = getFlagEmoji(countryCode);
  const locationLabel = city ? `${city}, ${region}` : region;

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
            <span aria-hidden className="mr-2">
              {flag}
            </span>
            {countryName}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {locationLabel}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              Local timezone: {timezone}
            </span>
            {jurisdictionLabel ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                {jurisdictionLabel}
              </span>
            ) : null}
          </div>
        </div>
        {children ? <div className="flex w-full max-w-xs flex-col gap-2">{children}</div> : null}
      </div>
      {imageSrc ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={`${city ? `${city}, ${region}` : region} skyline`}
            className="h-40 w-full object-cover md:h-48"
            loading="lazy"
          />
        </div>
      ) : null}
    </section>
  );
}

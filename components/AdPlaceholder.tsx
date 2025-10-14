type AdPlaceholderProps = {
  slot: string;
  label?: string;
};

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE;

export function AdPlaceholder({ slot, label = "Advertisement" }: AdPlaceholderProps) {
  if (!ADSENSE_ID) {
    return null;
  }

  return (
    <aside
      aria-label={label}
      className="flex w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-6 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
      data-ads-slot={slot}
      data-adsense={ADSENSE_ID}
    >
      Ad slot {slot}
    </aside>
  );
}

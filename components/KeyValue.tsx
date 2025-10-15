type KeyValueProps = {
  label: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
};

export function KeyValue({ label, value, helper }: KeyValueProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
        {label}
      </p>
      <div className="mt-2 text-base font-medium text-slate-900 dark:text-slate-100">{value}</div>
      {helper ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{helper}</p> : null}
    </div>
  );
}

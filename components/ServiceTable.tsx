type ServiceTableRow = {
  label: string;
  value: React.ReactNode;
};

type ServiceTableProps = {
  title?: string;
  rows: ServiceTableRow[];
};

export function ServiceTable({ title, rows }: ServiceTableProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {title ? <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3> : null}
      <dl className="mt-3 grid gap-x-4 gap-y-3 sm:grid-cols-[200px_1fr]">
        {rows.map((row) => (
          <div key={row.label} className="sm:border-b sm:border-slate-100 sm:pb-3 dark:sm:border-slate-800">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              {row.label}
            </dt>
            <dd className="mt-1 text-sm text-slate-800 dark:text-slate-200 sm:col-span-1">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

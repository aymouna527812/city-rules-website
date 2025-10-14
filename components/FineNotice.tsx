import { AlertTriangle } from "lucide-react";

type FineNoticeProps = {
  range: string;
  notes?: string;
};

export function FineNotice({ range, notes }: FineNoticeProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
      <span className="mt-1 text-amber-500 dark:text-amber-300" aria-hidden>
        <AlertTriangle className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
          Typical fines and enforcement
        </p>
        <p className="mt-1 text-sm text-amber-900 dark:text-amber-100">{range}</p>
        {notes ? <p className="mt-2 text-sm text-amber-900/80 dark:text-amber-200/90">{notes}</p> : null}
      </div>
    </div>
  );
}

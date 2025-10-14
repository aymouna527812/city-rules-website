import { Info } from "lucide-react";

type UpdateNoticeProps = {
  message?: string;
  children?: React.ReactNode;
};

const DEFAULT_MESSAGE =
  "Always confirm with the latest official notices or municipal postings before making plans.";

export function UpdateNotice({ message = DEFAULT_MESSAGE, children }: UpdateNoticeProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
      <Info className="mt-0.5 h-5 w-5 text-slate-500 dark:text-slate-300" aria-hidden />
      <div className="text-sm text-slate-700 dark:text-slate-200">
        <p>{message}</p>
        {children ? <div className="mt-2 text-slate-600 dark:text-slate-300">{children}</div> : null}
      </div>
    </div>
  );
}

import { formatDate } from "@/lib/utils";

type LastVerifiedProps = {
  date: string;
};

export function LastVerified({ date }: LastVerifiedProps) {
  return (
    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
      Last verified on <time dateTime={date}>{formatDate(date)}</time>
    </p>
  );
}

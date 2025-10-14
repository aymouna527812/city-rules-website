import Link from "next/link";

import type { TopicId, TopicNavEntry } from "@/lib/dataClient";
import { cn } from "@/lib/utils";

type TopicNavProps = {
  activeTopic: TopicId;
  entries: TopicNavEntry[];
};

export function TopicNav({ activeTopic, entries }: TopicNavProps) {
  if (entries.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Topic navigation" className="rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/70">
      <ul className="flex flex-wrap gap-1">
        {entries.map((entry) => {
          const isActive = entry.topic === activeTopic;
          return (
            <li key={`${entry.topic}-${entry.href}`}>
              <Link
                href={entry.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                    : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span>{entry.label}</span>
                {entry.level === "region" ? (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                    Region level
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

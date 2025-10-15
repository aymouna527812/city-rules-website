"use client";

import { useTimeFormat } from "@/components/TimeFormatProvider";
import { cn } from "@/lib/utils";

export function TimeFormatToggle({ className }: { className?: string }) {
  const { mode, setMode } = useTimeFormat();

  return (
    <div className={cn("inline-flex items-center gap-1", className)} aria-label="Time format">
      <button
        type="button"
        onClick={() => setMode("12h")}
        className={cn(
          "rounded-md border px-2 py-1 text-xs font-medium transition dark:bg-transparent",
          mode === "12h"
            ? "border-primary bg-primary/10 text-primary dark:border-primary"
            : "border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100",
        )}
        aria-pressed={mode === "12h"}
      >
        12h
      </button>
      <button
        type="button"
        onClick={() => setMode("24h")}
        className={cn(
          "rounded-md border px-2 py-1 text-xs font-medium transition dark:bg-transparent",
          mode === "24h"
            ? "border-primary bg-primary/10 text-primary dark:border-primary"
            : "border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100",
        )}
        aria-pressed={mode === "24h"}
      >
        24h
      </button>
    </div>
  );
}


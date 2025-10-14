"use client";

import { Monitor, MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: SunMedium },
  { value: "dark", label: "Dark", icon: MoonStar },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
        aria-label="Toggle theme"
        disabled
      >
        <SunMedium className="h-4 w-4 animate-pulse" aria-hidden />
      </button>
    );
  }

  const active = theme ?? resolvedTheme ?? "system";
  const values = OPTIONS.map((option) => option.value);
  const currentIndex = Math.max(values.indexOf(active), 0);
  const CycleIcon = OPTIONS[currentIndex]?.icon ?? SunMedium;

  const handleCycle = () => {
    const nextIndex = (currentIndex + 1) % values.length;
    setTheme(values[nextIndex]);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCycle}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100 dark:focus-visible:ring-offset-slate-950 sm:hidden"
        aria-label="Cycle theme"
      >
        <CycleIcon className="h-4 w-4" aria-hidden />
      </button>
      <div className="hidden sm:block">
        <ThemeOptions current={active} onSelect={setTheme} />
      </div>
    </div>
  );
}

type ThemeOptionsProps = {
  current: string;
  onSelect: (value: string) => void;
};

function ThemeOptions({ current, onSelect }: ThemeOptionsProps) {
  return (
    <div
      role="group"
      aria-label="Theme options"
      className="flex overflow-hidden rounded-full border border-slate-200 bg-slate-100 p-1 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = current === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition",
              selected
                ? "bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-slate-900/60",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}





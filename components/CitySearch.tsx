"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import type { TopicId, TopicSearchEntry } from "@/lib/dataClient";
import { cn } from "@/lib/utils";

const TOPIC_LABELS: Record<TopicId, string> = {
  "quiet-hours": "Quiet Hours",
  "parking-rules": "Parking",
  "bulk-trash": "Bulk Trash",
  fireworks: "Fireworks",
};

const TOPIC_BADGE_CLASSES: Record<TopicId, string> = {
  "quiet-hours": "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
  "parking-rules": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  "bulk-trash": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  fireworks: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
};

const fuseOptions: Fuse.IFuseOptions<TopicSearchEntry> = {
  includeScore: false,
  keys: [
    { name: "city", weight: 0.6 },
    { name: "region", weight: 0.3 },
    { name: "country", weight: 0.1 },
  ],
  threshold: 0.4,
};

type CitySearchProps = {
  items: TopicSearchEntry[];
  placeholder?: string;
};

type TopicFilter = TopicId | "all";

const TOPIC_FILTERS: { id: TopicFilter; label: string }[] = [
  { id: "all", label: "All topics" },
  { id: "quiet-hours", label: TOPIC_LABELS["quiet-hours"] },
  { id: "parking-rules", label: TOPIC_LABELS["parking-rules"] },
  { id: "bulk-trash", label: TOPIC_LABELS["bulk-trash"] },
  { id: "fireworks", label: TOPIC_LABELS.fireworks },
];

export function CitySearch({
  items,
  placeholder = "Search by city, region, or country",
}: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState<TopicFilter>("all");

  const filteredItems = useMemo(() => {
    if (topicFilter === "all") {
      return items;
    }
    return items.filter((item) => item.topic === topicFilter);
  }, [items, topicFilter]);

  const fuse = useMemo(() => new Fuse(filteredItems, fuseOptions), [filteredItems]);
  const results = query ? fuse.search(query).slice(0, 8).map((match) => match.item) : [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {TOPIC_FILTERS.map((filter) => {
          const isActive = topicFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setTopicFilter(filter.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition",
                isActive
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
              )}
              aria-pressed={isActive}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search className="h-4 w-4" aria-hidden />
        </div>
        <Input
          aria-label="Search locations"
          className="pl-9"
          placeholder={placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query && results.length > 0 && (
          <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {results.map((item) => (
              <li key={`${item.topic}-${item.path}`}>
                <Link
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-slate-50 focus:bg-slate-50 dark:hover:bg-slate-800 dark:focus:bg-slate-800 focus:outline-none"
                  href={item.path}
                >
                  <span className="flex flex-col text-left">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.city ?? item.label}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {item.region}, {item.country}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm",
                      TOPIC_BADGE_CLASSES[item.topic],
                    )}
                  >
                    {TOPIC_LABELS[item.topic]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {query && results.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            No matches yet. Try another city or province/state.
          </p>
        ) : null}
      </div>
    </div>
  );
}




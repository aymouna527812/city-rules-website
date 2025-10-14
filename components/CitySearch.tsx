"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchItem = {
  city: string;
  region: string;
  country: string;
  path: string;
};

const fuseOptions: Fuse.IFuseOptions<SearchItem> = {
  includeScore: false,
  keys: [
    { name: "city", weight: 0.6 },
    { name: "region", weight: 0.3 },
    { name: "country", weight: 0.1 },
  ],
  threshold: 0.4,
};

type CitySearchProps = {
  items: SearchItem[];
  placeholder?: string;
};

export function CitySearch({ items, placeholder = "Search by city, region, or country" }: CitySearchProps) {
  const [query, setQuery] = useState("");
  const fuse = useMemo(() => new Fuse(items, fuseOptions), [items]);
  const results = query ? fuse.search(query).slice(0, 7).map((match) => match.item) : [];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
        <Search className="h-4 w-4" aria-hidden />
      </div>
      <Input
        aria-label="Search cities"
        className="pl-9"
        placeholder={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {query && results.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {results.map((item) => (
            <li key={item.path}>
              <Link
                className={cn(
                  "block px-4 py-3 text-sm transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none",
                )}
                href={item.path}
              >
                <span className="font-semibold text-slate-900">{item.city}</span>{" "}
                <span className="text-slate-500">
                  · {item.region}, {item.country}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {query && results.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No matches yet. Try another city or province/state.</p>
      ) : null}
    </div>
  );
}

import { TimeFormatToggle } from "@/components/TimeFormatToggle";
import Link from "next/link";

import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "@/components/MobileMenu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800 dark:bg-slate-900/90 dark:supports-[backdrop-filter]:bg-slate-900/70">
      <div className="mx-auto w-full max-w-5xl px-4 py-3 sm:px-6">
        {/* Top row: brand + primary nav (md+) and mobile controls */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            {/* Site logo: light vs dark */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/CityRulesLightMode.png"
              alt=""
              aria-hidden
              className="h-8 sm:h-9 md:h-10 w-auto shrink-0 transform origin-left scale-125 md:scale-150 dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/CityRulesDarkMode.png"
              alt=""
              aria-hidden
              className="hidden h-8 sm:h-9 md:h-10 w-auto shrink-0 transform origin-left scale-125 md:scale-150 dark:block"
            />
            Quiet Hours & City Rules
          </Link>
          <div className="flex items-center gap-2">
            {/* Primary nav on desktop */}
            <div className="hidden md:block">
              <nav aria-label="Primary">
                <ul className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/70 p-1 text-sm font-medium text-slate-800 shadow-sm backdrop-blur dark:bg-slate-800/60 dark:text-slate-100">
                  <li>
                    <Link className="block rounded-lg px-3 py-1.5 text-slate-800 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700" href="/quiet-hours">Quiet Hours</Link>
                  </li>
                  <li>
                    <Link className="block rounded-lg px-3 py-1.5 text-slate-800 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700" href="/parking-rules">Parking</Link>
                  </li>
                  <li>
                    <Link className="block rounded-lg px-3 py-1.5 text-slate-800 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700" href="/bulk-trash">Bulk Trash</Link>
                  </li>
                  <li>
                    <Link className="block rounded-lg px-3 py-1.5 text-slate-800 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700" href="/fireworks">Fireworks</Link>
                  </li>
                  <li>
                    <Link className="block rounded-lg px-3 py-1.5 text-slate-800 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700" href="/about">About</Link>
                  </li>
                  <li>
                    <Link className="block rounded-lg px-3 py-1.5 text-slate-800 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700" href="/contact">Contact</Link>
                  </li>
                </ul>
              </nav>
            </div>
            {/* Theme toggle shown on mobile in top row */}
            <div className="md:hidden">
              <ThemeToggle />
            </div>
            {/* Mobile burger menu */}
            <MobileMenu />
          </div>
        </div>

        {/* Bottom row: toggles (desktop only) */}
        <div className="mt-2 hidden md:flex md:justify-end">
          <div className="flex items-center gap-2">
            <TimeFormatToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}


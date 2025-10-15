import { TimeFormatToggle } from "@/components/TimeFormatToggle";
import Link from "next/link";

import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "@/components/MobileMenu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800 dark:bg-slate-900/90 dark:supports-[backdrop-filter]:bg-slate-900/70">
      <div className="mx-auto w-full max-w-5xl px-4 py-3 sm:px-6">
        {/* Top row: brand + controls (unchanged on mobile) */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            <span aria-hidden="true">QH</span>
            Quiet Hours & Noise Rules
          </Link>
          <div className="flex items-center gap-2">
            {/* Time format (desktop) and theme toggle */}
            <div className="hidden md:block">
              <TimeFormatToggle />
            </div>
            <ThemeToggle />
            {/* Mobile burger menu */}
            <MobileMenu />
          </div>
        </div>

        {/* Bottom row: primary nav (desktop only) */}
        <div className="mt-2 hidden md:block">
          <nav aria-label="Primary">
            <ul className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/70 p-1 text-sm font-medium text-slate-800 shadow-sm backdrop-blur dark:bg-slate-800/60 dark:text-slate-100">
              <li>
                <Link
                  className="block rounded-lg px-3 py-1.5 text-slate-800 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700"
                  href="/quiet-hours"
                >
                  Quiet Hours
                </Link>
              </li>
              <li>
                <Link
                  className="block rounded-lg px-3 py-1.5 text-slate-800 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700"
                  href="/parking-rules"
                >
                  Parking
                </Link>
              </li>
              <li>
                <Link
                  className="block rounded-lg px-3 py-1.5 text-slate-800 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700"
                  href="/bulk-trash"
                >
                  Bulk Trash
                </Link>
              </li>
              <li>
                <Link
                  className="block rounded-lg px-3 py-1.5 text-slate-800 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700"
                  href="/fireworks"
                >
                  Fireworks
                </Link>
              </li>
              <li>
                <Link
                  className="block rounded-lg px-3 py-1.5 text-slate-800 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700"
                  href="/about"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  className="block rounded-lg px-3 py-1.5 text-slate-800 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700"
                  href="/contact"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}


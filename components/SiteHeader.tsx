import Link from "next/link";

import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800 dark:bg-slate-900/90 dark:supports-[backdrop-filter]:bg-slate-900/70">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          <span aria-hidden="true">QH</span>
          Quiet Hours & Noise Rules
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-4 text-sm font-medium text-slate-700 dark:text-slate-300">
            <li>
              <Link className="hover:text-primary dark:hover:text-sky-400" href="/quiet-hours">
                Quiet Hours
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary dark:hover:text-sky-400" href="/parking-rules">
                Parking
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary dark:hover:text-sky-400" href="/bulk-trash">
                Bulk Trash
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary dark:hover:text-sky-400" href="/fireworks">
                Fireworks
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary dark:hover:text-sky-400" href="/about">
                About
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary dark:hover:text-sky-400" href="/contact">
                Contact
              </Link>
            </li>
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}


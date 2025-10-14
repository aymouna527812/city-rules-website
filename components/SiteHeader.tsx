import Link from "next/link";

import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "@/components/MobileMenu";

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
        <div className="flex items-center gap-2">
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-4 text-sm font-medium text-black dark:text-white">
              <li>
                <Link className="hover:text-black dark:hover:text-white" href="/quiet-hours">
                  Quiet Hours
                </Link>
              </li>
              <li>
                <Link className="hover:text-black dark:hover:text-white" href="/parking-rules">
                  Parking
                </Link>
              </li>
              <li>
                <Link className="hover:text-black dark:hover:text-white" href="/bulk-trash">
                  Bulk Trash
                </Link>
              </li>
              <li>
                <Link className="hover:text-black dark:hover:text-white" href="/fireworks">
                  Fireworks
                </Link>
              </li>
              <li>
                <Link className="hover:text-black dark:hover:text-white" href="/about">
                  About
                </Link>
              </li>
              <li>
                <Link className="hover:text-black dark:hover:text-white" href="/contact">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
          {/* Theme toggle (mobile shows cycle button; desktop shows segmented options) */}
          <ThemeToggle />
          {/* Mobile burger menu */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}


"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { TimeFormatToggle } from "@/components/TimeFormatToggle";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
      closeRef.current?.focus();
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100 dark:focus-visible:ring-offset-slate-950 md:hidden"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu-sheet"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-4 w-4" aria-hidden />
      </button>

      {mounted
        ? createPortal(
            <div
              id="mobile-menu-sheet"
              role="dialog"
              aria-modal="true"
              className={cn(
                "fixed inset-0 z-50 md:hidden",
                open ? "pointer-events-auto" : "pointer-events-none",
              )}
            >
              {/* Backdrop */}
              <div
                className={cn(
                  "absolute inset-0 bg-black/40 transition-opacity",
                  open ? "opacity-100" : "opacity-0",
                )}
                onClick={() => setOpen(false)}
              />

              {/* Panel */}
              <div
                className={cn(
                  "absolute inset-y-0 right-0 flex w-80 max-w-[85%] flex-col border-l border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-out dark:border-slate-800 dark:bg-slate-900",
                  open ? "translate-x-0" : "translate-x-full",
                )}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Menu</span>
                  <button
                    ref={closeRef}
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100 dark:focus-visible:ring-offset-slate-950"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>

                <nav className="px-2">
                  <ul className="space-y-1">
                    {[
                      { href: "/quiet-hours", label: "Quiet Hours" },
                      { href: "/parking-rules", label: "Parking" },
                      { href: "/bulk-trash", label: "Bulk Trash" },
                      { href: "/fireworks", label: "Fireworks" },
                      { href: "/about", label: "About" },
                      { href: "/contact", label: "Contact" },
                    ].map((item) => (
                      <li key={item.href}>
                        <Link
                          onClick={() => setOpen(false)}
                          className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                          href={item.href}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="mt-auto space-y-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                  <div>
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Time format</span>
                    <TimeFormatToggle />
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

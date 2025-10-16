"use client";

import Link from "next/link";

export function FloatingLogo() {
  return (
    <div className="fixed left-3 top-3 z-50 sm:left-5 sm:top-5">
      <Link href="/" aria-label="CityRules home" className="inline-block">
        {/* Light mode logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/CityRulesLightMode.png"
          alt="CityRules"
          className="block h-24 w-auto opacity-90 transition-opacity hover:opacity-100 dark:hidden sm:h-[108px]"
          loading="eager"
        />
        {/* Dark mode logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/CityRulesDarkMode.png"
          alt="CityRules"
          className="hidden h-24 w-auto opacity-90 transition-opacity hover:opacity-100 dark:block sm:h-[108px]"
          loading="eager"
        />
      </Link>
    </div>
  );
}

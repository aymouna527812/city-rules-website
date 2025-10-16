import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const DEFAULT_LOCALE = "en";

export type CopyDictionaryEntry = {
  default: string;
  description?: string;
};

export type CopyDictionary = Record<string, CopyDictionaryEntry>;

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const baseDictionary: CopyDictionary = {
  heroTitle: {
    default: "Quiet Hours & Noise Rules in {{city}}, {{region}}",
  },
  heroSubtitle: {
    default: "Understand local bylaws on quiet hours, construction, and enforcement.",
  },
  searchPlaceholder: {
    default: "Search for a city or region",
  },
  lastVerifiedLabel: {
    default: "Last verified on {{date}}",
  },
  suggestUpdate: {
    default: "Suggest an update",
  },
  enforcementHeading: {
    default: "Noise enforcement & reporting",
  },
  shareHeading: {
    default: "Share this guide",
  },
  tipsHeading: {
    default: "Practical tips for quieter living",
  },
};

export function t(
  key: keyof typeof baseDictionary,
  params: Record<string, string | number> = {},
): string {
  const entry = baseDictionary[key];
  let template = entry?.default ?? key;
  for (const [paramKey, value] of Object.entries(params)) {
    template = template.replaceAll(`{{${paramKey}}}`, String(value));
  }
  return template;
}

export function formatDate(isoDate: string, locale: string = DEFAULT_LOCALE): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function getCountryName(code: string, locale: string = DEFAULT_LOCALE): string {
  if (typeof Intl.DisplayNames === "undefined") {
    return code;
  }
  const displayNames = new Intl.DisplayNames([locale], { type: "region" });
  return displayNames.of(code) ?? code;
}

export function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return "🏳️";
  }
  const codePoints = [...countryCode.toUpperCase()].map(
    (char) => 0x1f1a5 + char.charCodeAt(0),
  );
  return String.fromCodePoint(...codePoints);
}

export function buildMailtoLink(email: string, subject: string, body: string): string {
  const params = new URLSearchParams({
    subject,
    body,
  });
  return `mailto:${email}?${params.toString()}`;
}

const EXTERNAL_URL_PATTERN = /^https?:\/\//i;

export function isExternalUrl(href: string | null | undefined): href is string {
  return typeof href === "string" && EXTERNAL_URL_PATTERN.test(href);
}

export function getExternalLinkProps(
  href: string | null | undefined,
): { target?: "_blank"; rel?: string } {
  if (!isExternalUrl(href)) {
    return {};
  }
  return { target: "_blank", rel: "noopener noreferrer" };
}

export function withExternalLinkTargets(html: string): string {
  if (!html) {
    return html;
  }

  return html.replace(/<a\s+([^>]*href="[^"]+"[^>]*)>/gi, (match, attrs) => {
    const hrefMatch = attrs.match(/href="([^"]+)"/i);
    if (!hrefMatch) {
      return match;
    }

    const href = hrefMatch[1];
    if (!isExternalUrl(href)) {
      return match;
    }

    let newAttrs = attrs;

    if (!/\btarget=/i.test(newAttrs)) {
      newAttrs = `${newAttrs} target="_blank"`;
    }

    if (/\brel=/i.test(newAttrs)) {
      newAttrs = newAttrs.replace(/\brel="([^"]*)"/i, (_relMatch, relValue: string) => {
        const tokens = new Set(relValue.split(/\s+/).filter(Boolean));
        tokens.add("noopener");
        tokens.add("noreferrer");
        return `rel="${Array.from(tokens).join(" ")}"`;
      });
    } else {
      newAttrs = `${newAttrs} rel="noopener noreferrer"`;
    }

    return `<a ${newAttrs}>`;
  });
}

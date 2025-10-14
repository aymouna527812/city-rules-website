const DIACRITIC_REGEX = /\p{Diacritic}/gu;
const NON_ALPHANUMERIC_REGEX = /[^a-z0-9]+/g;
export const LOCATION_KEY_DELIMITER = "__";
export const REGION_ONLY_TOKEN = "region-root";

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(DIACRITIC_REGEX, "")
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_REGEX, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

export function buildSlugKey(
  countrySlug: string,
  regionSlug: string,
  citySlug?: string | null,
): string {
  const normalizedCountry = (countrySlug ?? "").toLowerCase();
  const normalizedRegion = (regionSlug ?? "").toLowerCase();
  const normalizedCity =
    citySlug && citySlug.trim().length > 0 ? citySlug.toLowerCase() : REGION_ONLY_TOKEN;
  return [normalizedCountry, normalizedRegion, normalizedCity].join(LOCATION_KEY_DELIMITER);
}

export function ensureUniqueSlug(slug: string, used: Set<string>): string {
  let candidate = slug;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
  used.add(candidate);
  return candidate;
}

export type ParsedSlugKey = {
  countrySlug: string;
  regionSlug: string;
  citySlug?: string;
};

export function parseSlugKey(key: string): ParsedSlugKey {
  const [countrySlug = "", regionSlug = "", citySegment = ""] = key.split(LOCATION_KEY_DELIMITER);
  return {
    countrySlug,
    regionSlug,
    citySlug: citySegment === REGION_ONLY_TOKEN ? undefined : citySegment,
  };
}

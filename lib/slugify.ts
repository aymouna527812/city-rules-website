const DIACRITIC_REGEX = /\p{Diacritic}/gu;
const NON_ALPHANUMERIC_REGEX = /[^a-z0-9]+/g;

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(DIACRITIC_REGEX, "")
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_REGEX, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

export function buildSlugKey(countrySlug: string, regionSlug: string, citySlug: string): string {
  return [countrySlug, regionSlug, citySlug].map((value) => value.toLowerCase()).join("__");
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

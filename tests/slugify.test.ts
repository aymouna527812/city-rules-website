
import { describe, expect, it } from "vitest";

import { buildSlugKey, ensureUniqueSlug, slugify } from "@/lib/slug";

describe("slugify utilities", () => {
  it("slugifies strings with accents and punctuation", () => {
    expect(slugify("Québec City")).toBe("quebec-city");
    expect(slugify("St. John's (Downtown)")).toBe("st-john-s-downtown");
  });

  it("builds consistent slug keys", () => {
    expect(buildSlugKey("canada", "ontario", "toronto")).toBe("canada__ontario__toronto");
    expect(buildSlugKey("united-states", "massachusetts")).toBe(
      "united-states__massachusetts__region-root",
    );
  });

  it("ensures unique slugs by appending suffixes", () => {
    const used = new Set<string>();
    const first = ensureUniqueSlug("toronto", used);
    const second = ensureUniqueSlug("toronto", used);
    const third = ensureUniqueSlug("toronto", used);

    expect(first).toBe("toronto");
    expect(second).toBe("toronto-2");
    expect(third).toBe("toronto-3");
  });
});

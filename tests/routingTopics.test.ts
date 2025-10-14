import { describe, expect, it } from "vitest";

import { generateStaticParams as parkingStaticParams, generateMetadata as parkingMetadata } from "@/app/(topics)/parking-rules/[country]/[region]/[city]/page";
import { generateStaticParams as bulkStaticParams, generateMetadata as bulkMetadata } from "@/app/(topics)/bulk-trash/[country]/[region]/[city]/page";
import {
  generateStaticParams as fireworksRegionParams,
  generateMetadata as fireworksRegionMetadata,
} from "@/app/(topics)/fireworks/[country]/[region]/page";
import {
  generateStaticParams as fireworksCityParams,
  generateMetadata as fireworksCityMetadata,
} from "@/app/(topics)/fireworks/[country]/[region]/[city]/page";

describe("topic routing", () => {
  it("generates parking static params for sample data", async () => {
    const params = await parkingStaticParams();
    expect(params).toContainEqual({
      country: "united-states",
      region: "illinois",
      city: "chicago",
    });
  });

  it("produces parking metadata with canonical path", async () => {
    const metadata = await parkingMetadata({
      params: { country: "united-states", region: "illinois", city: "chicago" },
    });
    expect(metadata?.alternates?.canonical).toContain(
      "/parking-rules/united-states/illinois/chicago",
    );
  });

  it("generates bulk trash static params for sample data", async () => {
    const params = await bulkStaticParams();
    expect(params).toContainEqual({
      country: "united-states",
      region: "arizona",
      city: "phoenix",
    });
  });

  it("produces bulk trash metadata with canonical path", async () => {
    const metadata = await bulkMetadata({
      params: { country: "united-states", region: "arizona", city: "phoenix" },
    });
    expect(metadata?.alternates?.canonical).toContain(
      "/bulk-trash/united-states/arizona/phoenix",
    );
  });

  it("generates fireworks region params for sample data", async () => {
    const params = await fireworksRegionParams();
    expect(params).toContainEqual({
      country: "united-states",
      region: "massachusetts",
    });
  });

  it("produces fireworks region metadata with canonical path", async () => {
    const metadata = await fireworksRegionMetadata({
      params: { country: "united-states", region: "massachusetts" },
    });
    expect(metadata?.alternates?.canonical).toContain(
      "/fireworks/united-states/massachusetts",
    );
  });

  it("generates fireworks city params for sample data", async () => {
    const params = await fireworksCityParams();
    expect(params).toEqual([]);
  });

  it("handles fireworks metadata when no city entry exists", async () => {
    const metadata = await fireworksCityMetadata({
      params: { country: "united-states", region: "massachusetts", city: "boston" },
    });
    expect(metadata).toBeUndefined();
  });
});

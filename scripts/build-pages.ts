import { promises as fs } from "node:fs";
import path from "node:path";
import chalk from "chalk";

import { getDataset } from "@/lib/dataClient";
import { buildSlugKey } from "@/lib/slugify";

const OUTPUT_PATH = path.join(process.cwd(), "lib", "data", "slugIndex.json");

async function main(): Promise<void> {
  const { records } = await getDataset();
  const slugIndex = Object.fromEntries(
    records.map((record) => [
      buildSlugKey(record.country_slug, record.region_slug, record.city_slug),
      {
        country: record.country,
        region: record.region,
        city: record.city,
        country_slug: record.country_slug,
        region_slug: record.region_slug,
        city_slug: record.city_slug,
        last_verified: record.last_verified,
      },
    ]),
  );

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(slugIndex, null, 2));
  console.log(
    chalk.green(
      `Wrote slug index with ${records.length} entries to ${path.relative(
        process.cwd(),
        OUTPUT_PATH,
      )}`,
    ),
  );
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

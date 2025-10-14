import { promises as fs } from "node:fs";
import path from "node:path";
import chalk from "chalk";

import {
  getBulkTrashDataset,
  getDataset,
  getFireworksDataset,
  getParkingDataset,
} from "@/lib/dataClient";
import { buildSlugKey } from "@/lib/slug";
import type {
  BulkTrashRecord,
  FireworksRecord,
  ParkingRulesRecord,
  QuietHoursRecord,
} from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "lib", "data");

type TopicRecord = QuietHoursRecord | ParkingRulesRecord | BulkTrashRecord | FireworksRecord;

type TopicDefinition = {
  name: string;
  filename: string;
  load: () => Promise<readonly TopicRecord[]>;
};

const TOPICS: TopicDefinition[] = [
  {
    name: "quiet_hours",
    filename: "quietHoursSlugIndex.json",
    load: async () => {
      const { records } = await getDataset();
      return records;
    },
  },
  {
    name: "parking_rules",
    filename: "parkingSlugIndex.json",
    load: async () => {
      const { records } = await getParkingDataset();
      return records;
    },
  },
  {
    name: "bulk_trash",
    filename: "bulkTrashSlugIndex.json",
    load: async () => {
      const { records } = await getBulkTrashDataset();
      return records;
    },
  },
  {
    name: "fireworks",
    filename: "fireworksSlugIndex.json",
    load: async () => {
      const { records } = await getFireworksDataset();
      return records;
    },
  },
];

async function writeSlugIndex(topic: TopicDefinition): Promise<void> {
  const records = await topic.load();
  const outputPath = path.join(DATA_DIR, topic.filename);

  const slugIndex = Object.fromEntries(
    records.map((record) => {
      const key = buildSlugKey(record.country_slug, record.region_slug, record.city_slug);
      const entry: Record<string, unknown> = {
        country: record.country,
        region: record.region,
        country_slug: record.country_slug,
        region_slug: record.region_slug,
        last_verified: record.last_verified,
      };
      if (record.city) {
        entry.city = record.city;
      }
      if (record.city_slug) {
        entry.city_slug = record.city_slug;
      }
      return [key, entry];
    }),
  );

  await fs.writeFile(outputPath, JSON.stringify(slugIndex, null, 2));
  console.log(
    chalk.green(
      `[${topic.name}] Wrote ${records.length} entries to ${path.relative(process.cwd(), outputPath)}`,
    ),
  );
}

async function main(): Promise<void> {
  for (const topic of TOPICS) {
    await writeSlugIndex(topic);
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

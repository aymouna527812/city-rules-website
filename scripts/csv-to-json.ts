import { promises as fs } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import chalk from "chalk";

import {
  normalizeBulkTrashRecord,
  normalizeFireworksRecord,
  normalizeParkingRecord,
  normalizeRecord,
} from "@/lib/dataClient";
import {
  BulkTrashDatasetSchema,
  FireworksDatasetSchema,
  ParkingRulesDatasetSchema,
  QuietHoursDatasetSchema,
} from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "lib", "data");

type DatasetDefinition = {
  name: string;
  csvFilename: string;
  jsonFilename: string;
  normalize: (record: Record<string, unknown>) => unknown;
  validate: (records: unknown) => void;
};

const DATASETS: DatasetDefinition[] = [
  {
    name: "quiet_hours",
    csvFilename: "quiet_hours.csv",
    jsonFilename: "quiet_hours.json",
    normalize: normalizeRecord,
    validate: (records) => {
      QuietHoursDatasetSchema.parse(records);
    },
  },
  {
    name: "parking_rules",
    csvFilename: "parking_rules.csv",
    jsonFilename: "parking_rules.json",
    normalize: normalizeParkingRecord,
    validate: (records) => {
      ParkingRulesDatasetSchema.parse(records);
    },
  },
  {
    name: "bulk_trash",
    csvFilename: "bulk_trash.csv",
    jsonFilename: "bulk_trash.json",
    normalize: normalizeBulkTrashRecord,
    validate: (records) => {
      BulkTrashDatasetSchema.parse(records);
    },
  },
  {
    name: "fireworks",
    csvFilename: "fireworks.csv",
    jsonFilename: "fireworks.json",
    normalize: normalizeFireworksRecord,
    validate: (records) => {
      FireworksDatasetSchema.parse(records);
    },
  },
];

async function fileExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const forceWrite = process.env.FORCE_CSV_EXPORT === "true";
  const completed: string[] = [];

  for (const dataset of DATASETS) {
    const csvPath = path.join(DATA_DIR, dataset.csvFilename);
    const jsonPath = path.join(DATA_DIR, dataset.jsonFilename);

    if (!(await fileExists(csvPath))) {
      console.log(
        chalk.gray(
          `[${dataset.name}] No CSV source detected at ${dataset.csvFilename}, skipping conversion.`,
        ),
      );
      continue;
    }

    if ((await fileExists(jsonPath)) && !forceWrite) {
      console.log(
        chalk.gray(
          `[${dataset.name}] ${dataset.jsonFilename} already exists. Set FORCE_CSV_EXPORT=true to overwrite.`,
        ),
      );
      continue;
    }

    const csvContent = await fs.readFile(csvPath, "utf-8");
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, unknown>[];

    const normalized = records.map((record) => dataset.normalize(record));
    dataset.validate(normalized);

    await fs.writeFile(jsonPath, JSON.stringify(normalized, null, 2));
    completed.push(dataset.name);
    console.log(
      chalk.green(
        `[${dataset.name}] Converted ${normalized.length} record(s) from ${dataset.csvFilename} to ${dataset.jsonFilename}.`,
      ),
    );
  }

  if (completed.length === 0) {
    console.log(chalk.yellow("No CSV datasets converted. Nothing to do."));
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

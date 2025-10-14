import { promises as fs } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import chalk from "chalk";

import { normalizeRecord } from "@/lib/dataClient";
import { QuietHoursDatasetSchema } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "lib", "data");
const CSV_PATH = path.join(DATA_DIR, "quiet_hours.csv");
const JSON_PATH = path.join(DATA_DIR, "quiet_hours.json");

async function fileExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const csvExists = await fileExists(CSV_PATH);
  if (!csvExists) {
    console.log(chalk.gray("No CSV source detected, skipping CSV → JSON conversion."));
    return;
  }

  const forceWrite = process.env.FORCE_CSV_EXPORT === "true";
  const jsonExists = await fileExists(JSON_PATH);
  if (jsonExists && !forceWrite) {
    console.log(
      chalk.gray("quiet_hours.json already exists. Set FORCE_CSV_EXPORT=true to overwrite."),
    );
    return;
  }

  const csvContent = await fs.readFile(CSV_PATH, "utf-8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, unknown>[];

  const dataset = records.map((record) => normalizeRecord(record));
  QuietHoursDatasetSchema.parse(dataset);

  await fs.writeFile(JSON_PATH, JSON.stringify(dataset, null, 2));
  console.log(
    chalk.green(
      `Converted ${dataset.length} record(s) from quiet_hours.csv to quiet_hours.json successfully.`,
    ),
  );
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { promises as fs } from "node:fs";
import path from "node:path";

import { getSiteUrl } from "@/lib/seo";
import sitemap from "@/app/sitemap";

type UrlEntry = { url: string; lastModified?: string };

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "indexnow.json");

async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

async function main(): Promise<void> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    throw new Error("INDEXNOW_KEY env var is required");
  }

  const siteUrl = getSiteUrl();
  const host = new URL(siteUrl).host;
  const keyLocation = `${siteUrl}/${key}.txt`;

  // Build the URL list by reusing the sitemap generator
  const entries = (await sitemap()) as UrlEntry[];
  // Build current map of url -> lastModified string (or empty)
  const currentMap = new Map<string, string>(
    entries.map((e) => [e.url, e.lastModified ? String(e.lastModified) : ""]),
  );

  // Load previous map from cache (if any)
  let previousMap = new Map<string, string>();
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    const obj = JSON.parse(raw) as Record<string, string>;
    previousMap = new Map(Object.entries(obj));
  } catch {}

  // Determine changed URLs: new URLs or lastModified changed
  let changedUrls: string[] = [];
  if (process.env.FULL === "1") {
    changedUrls = Array.from(currentMap.keys());
  } else {
    for (const [url, lm] of currentMap.entries()) {
      const prev = previousMap.get(url);
      if (prev === undefined || prev !== lm) {
        changedUrls.push(url);
      }
    }
  }

  if (changedUrls.length === 0) {
    console.log("[indexnow] No URL changes detected — skipping submission.");
    // Still update cache for next run
    await ensureDir(CACHE_DIR);
    await fs.writeFile(
      CACHE_FILE,
      JSON.stringify(Object.fromEntries(currentMap.entries()), null, 2),
      "utf-8",
    );
    return;
  }

  const payload = {
    host,
    key,
    keyLocation,
    urlList: changedUrls,
  };

  const endpoint = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";

  // Allow dry runs (useful locally): set DRY_RUN=1
  if (process.env.DRY_RUN === "1") {
    console.log(
      `[indexnow] DRY RUN → would submit ${changedUrls.length} URLs to ${endpoint}`,
    );
    return;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`IndexNow submission failed: ${res.status} ${res.statusText}\n${text}`);
  }

  console.log(
    `[indexnow] Submitted ${changedUrls.length} URLs to ${endpoint} (host=${host})`,
  );

  // Persist the current map for delta comparison next time
  await ensureDir(CACHE_DIR);
  await fs.writeFile(
    CACHE_FILE,
    JSON.stringify(Object.fromEntries(currentMap.entries()), null, 2),
    "utf-8",
  );
}

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

import { promises as fs } from "node:fs";
import path from "node:path";

import { getDataset } from "@/lib/dataClient";
import { buildSlugKey } from "@/lib/slug";

const PUBLIC_HERO_DIR = path.join(process.cwd(), "public", "hero");
const HERO_MAP_PATH = path.join(process.cwd(), "lib", "data", "heroImages.json");

async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // ignore
  }
}

function getExtFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const ext = path.extname(u.pathname).toLowerCase();
    if (ext && [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) return ext;
  } catch {
    // ignore
  }
  return ".jpg";
}

async function download(url: string, outPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url} (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(outPath, buf);
}

async function main(): Promise<void> {
  const { records } = await getDataset();
  await ensureDir(PUBLIC_HERO_DIR);
  const map: Record<string, string> = {};

  for (const rec of records) {
    if (!rec.hero_image_url) continue;
    const ext = getExtFromUrl(rec.hero_image_url);
    const file = `hero-${rec.country_slug}-${rec.region_slug}-${rec.city_slug}${ext}`;
    const outPath = path.join(PUBLIC_HERO_DIR, file);
    try {
      await download(rec.hero_image_url, outPath);
      const key = buildSlugKey(rec.country_slug, rec.region_slug, rec.city_slug);
      map[key] = `/hero/${file}`;
      // eslint-disable-next-line no-console
      console.log(`Saved hero for ${rec.city}, ${rec.region} → ${path.relative(process.cwd(), outPath)}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`Skipping hero for ${rec.city}:`, (err as Error).message);
    }
  }

  await fs.writeFile(HERO_MAP_PATH, JSON.stringify(map, null, 2));
}

void main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});


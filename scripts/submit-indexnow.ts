import { getSiteUrl } from "@/lib/seo";
import sitemap from "@/app/sitemap";

async function main(): Promise<void> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    throw new Error("INDEXNOW_KEY env var is required");
  }

  const siteUrl = getSiteUrl();
  const host = new URL(siteUrl).host;
  const keyLocation = `${siteUrl}/${key}.txt`;

  // Build the URL list by reusing the sitemap generator
  const entries = await sitemap();
  const urlList = Array.from(
    new Set(entries.map((e) => e.url)),
  );

  const payload = {
    host,
    key,
    keyLocation,
    urlList,
  };

  const endpoint = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";

  // Allow dry runs (useful locally): set DRY_RUN=1
  if (process.env.DRY_RUN === "1") {
    console.log(`[indexnow] DRY RUN → would submit ${urlList.length} URLs to ${endpoint}`);
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

  console.log(`[indexnow] Submitted ${urlList.length} URLs to ${endpoint} (host=${host})`);
}

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


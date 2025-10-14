
# Quiet Hours & Noise Rules

Quiet Hours & Noise Rules is a programmatically generated Next.js 15 site that publishes verified quiet-hour, construction, and enforcement guidance for cities. The project produces SEO-friendly static pages from a single structured data source (JSON or CSV) and is optimised for Vercel deployment.

## Quick start

1. From the repository root, move into the project directory:

   ```powershell
   cd quiet-hours
   ```

2. (First run only) enable Corepack’s bundled pnpm and add it to your session PATH:

   ```powershell
   $env:COREPACK_HOME = "$PWD\.corepack"
   corepack prepare pnpm@10.18.3 --activate
   $pnpmRoot = Join-Path $PWD ".corepack\v1\pnpm\10.18.3\bin"
   $env:Path = "$pnpmRoot;$env:Path"
   ```

3. Install dependencies:

   ```powershell
   pnpm install
   ```

4. Launch the dev server:

   ```powershell
   pnpm dev
   ```

The site runs at `http://localhost:3000`. Programmatic city pages are available under `/{country}/{region}/{city}` (e.g. `/canada/ontario/toronto`).

### Core scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js development server |
| `pnpm build` | Validate data, convert CSV (if required), and build the production bundle |
| `pnpm validate` | Run schema validation and data integrity checks |
| `pnpm csv2json` | Force CSV → JSON conversion (`FORCE_CSV_EXPORT=true pnpm csv2json`) |
| `pnpm pages:cache` | Generate `lib/data/slugIndex.json` for faster static param generation |
| `pnpm lint` | ESLint with TypeScript, Tailwind, and import rules |
| `pnpm test` | Vitest unit tests for slug utilities and data loading |

## Data sources

Source files live in `lib/data/`:

* `quiet_hours.json` – primary data file (checked into repo)
* `quiet_hours.csv` – optional alternative input with matching columns
* `slugIndex.json` – optional build artefact created by `pnpm pages:cache`

### Schema (per city)

| Field | Type | Notes |
| --- | --- | --- |
| `country` | string (ISO-2) | Uppercase ISO-3166-1 alpha-2 code |
| `region`, `city` | string | Human-readable names |
| `country_slug`, `region_slug`, `city_slug` | string | URL-safe slugs (`kebab-case`) |
| `timezone` | string | IANA timezone identifier |
| `default_quiet_hours` | string | Primary quiet hour window |
| `weekend_quiet_hours`, `holiday_quiet_hours` | string? | Optional overrides |
| `residential_decibel_limit_day`, `residential_decibel_limit_night` | number? | Optional dBA limits |
| `construction_hours_weekday`, `construction_hours_weekend` | string | Required |
| `lawn_equipment_hours`, `party_music_rules` | string | Required |
| `complaint_channel` | string | e.g. “311” |
| `complaint_url` | string | Absolute URL |
| `fine_range`, `first_offense_fine?` | string, number? | Typical penalties |
| `bylaw_title`, `bylaw_url` | string | Citation details |
| `last_verified` | string | `YYYY-MM-DD` |
| `tips` | string[] | 1+ practical tips |
| `templates.neighbor_message`, `templates.landlord_message` | string | Copy-ready messages |
| `lat?`, `lng?` | number | Optional coordinates |
| `notes_admin?` | string | Internal notes – never rendered |

### Adding or updating cities

1. **Edit JSON** – recommended for full fidelity. Add a new object following the schema above.
2. **Or edit CSV** – include the same column names; for list fields (`tips`) use the `|` pipe separator. Run `FORCE_CSV_EXPORT=true pnpm csv2json` to regenerate JSON.
3. Run `pnpm validate` to ensure schema compliance, timezone validity, and unique slugs.
4. Optionally run `pnpm pages:cache` to refresh the slug index used during static generation.

## SEO & accessibility checklist

- [x] Canonical URLs driven by `SITE_URL`
- [x] Dynamic Open Graph & Twitter metadata per city
- [x] `BreadcrumbList`, `FAQPage`, `Organization`, and `WebSite` JSON-LD
- [x] Static sitemap with `lastmod` sourced from `last_verified`
- [x] Accessible breadcrumb navigation, keyboard-friendly accordions
- [x] Print-friendly layout for city cards and summaries
- [x] Suggest-update mailto and share buttons (copy, X, Facebook)

## Testing & quality

```bash
pnpm lint
pnpm test
pnpm validate
```

CI (GitHub Actions) runs linting, tests, and data validation on pushes and pull requests targeting `main`.

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Create a Vercel project and import the repo.
3. Set environment variables (recommended):
   * `SITE_URL` – production canonical URL (e.g. `https://quiet-hours.example.com`)
   * `NEXT_PUBLIC_GA_ID` – optional GA4 measurement ID
   * `NEXT_PUBLIC_ADSENSE` – optional AdSense publisher ID to enable ad placeholders
4. Vercel will run `pnpm install && pnpm build`. The output directory is `.next`.

## Contributing

1. Add or update data in `lib/data/`.
2. Run `pnpm validate && pnpm test` before committing.
3. Include clear descriptions of bylaw sources in commit messages or PR descriptions.

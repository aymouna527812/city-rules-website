# Quiet Hours & Noise Rules

Quiet Hours & Noise Rules is a programmatically generated Next.js 15 site that publishes verified quiet-hour, overnight parking, bulk trash, and fireworks guidance for cities and regions. The project produces SEO-friendly static pages from structured JSON/CSV sources and is optimised for Vercel deployment.

## Quick start

1. From the repository root, move into the project directory:

   ```powershell
   cd quiet-hours
   ```

2. (First run only) enable Corepack's bundled pnpm and add it to your session PATH:

   ```powershell
   $env:COREPACK_HOME = "$PWD\.corepack"
   corepack prepare pnpm@10.18.3 --activate
   $pnpmRoot = Join-Path $PWD ".corepack\\v1\\pnpm\\10.18.3\\bin"
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

The site runs at `http://localhost:3000`. Programmatic city pages are available under `/{country}/{region}/{city}` (e.g. `/canada/ontario/toronto`). Topic hubs live at `/quiet-hours`, `/parking-rules`, `/bulk-trash`, and `/fireworks`.

### Core scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js development server |
| `pnpm build` | Validate data, convert CSV (if required), and build the production bundle |
| `pnpm validate` | Run schema validation and data integrity checks |
| `pnpm csv2json` | Convert each dataset CSV into JSON (set `FORCE_CSV_EXPORT=true` to overwrite) |
| `pnpm pages:cache` | Precompute slug indexes for all topics (`quietHoursSlugIndex.json`, `parkingSlugIndex.json`, `bulkTrashSlugIndex.json`, `fireworksSlugIndex.json`) |
| `pnpm lint` | ESLint with TypeScript, Tailwind, and import rules |
| `pnpm test` | Vitest unit tests for slug utilities, data loading, and routing |

## Data sources

Source files live in `lib/data/`:

- `quiet_hours.json` / `.csv` – quiet hour bylaws and enforcement data
- `parking_rules.json` / `.csv` – overnight parking and winter ban data
- `bulk_trash.json` / `.csv` – bulk trash and large-item pickup schedules
- `fireworks.json` / `.csv` – fireworks legality by jurisdiction
- `quietHoursSlugIndex.json`, `parkingSlugIndex.json`, `bulkTrashSlugIndex.json`, `fireworksSlugIndex.json` – optional build artefacts created by `pnpm pages:cache`

### Base fields (all topics)

| Field | Type | Notes |
| --- | --- | --- |
| `country` | string (ISO-2) | Uppercase ISO 3166-1 alpha-2 code |
| `region` | string | State, province, or territory name |
| `city?` | string | Optional for region-only fireworks rules |
| `country_slug`, `region_slug`, `city_slug?` | string | URL-safe `kebab-case` slugs (auto-generated if omitted) |
| `timezone` | string | IANA timezone identifier |
| `last_verified` | string | `YYYY-MM-DD` ISO date |
| `source_title`, `source_url` | string | Human-readable source and canonical URL |
| `complaint_channel?`, `complaint_url?` | string | Optional reporting contacts |
| `fine_range?` | string | Optional range of fines |
| `notes_admin?` | string | Internal notes (never rendered) |

### Quiet hours schema

| Field | Type | Notes |
| --- | --- | --- |
| `default_quiet_hours` | string | Primary quiet hour window |
| `weekend_quiet_hours?`, `holiday_quiet_hours?` | string | Optional overrides |
| `residential_decibel_limit_day?`, `residential_decibel_limit_night?` | number | Optional dBA limits |
| `construction_hours_weekday`, `construction_hours_weekend` | string | Required |
| `lawn_equipment_hours`, `party_music_rules` | string | Required |
| `complaint_channel`, `complaint_url` | string | Required for quiet hours records |
| `fine_range`, `first_offense_fine?` | string, number | Typical penalties |
| `bylaw_title`, `bylaw_url` | string | Citation details |
| `seo_text?` | string (HTML allowed) | Optional SEO copy shown under the header image on city pages |
| `tips` | string[] | 1+ practical tips |
| `templates.neighbor_message`, `templates.landlord_message` | string | Copy-ready messages |
| `lat?`, `lng?` | number | Optional coordinates |
| `hero_image_url?` | string (URL) | Optional hero image URL for the city. If present, build fetches and stores a local copy used on city pages and tiles |

### Parking rules schema

| Field | Type | Notes |
| --- | --- | --- |
| `overnight_parking_allowed` | boolean or `"varies"` | Indicates if overnight parking is permitted |
| `overnight_hours` | string | Typical posted hours |
| `permit_required` | boolean | Whether residential permits are required |
| `permit_url?` | string | Application link |
| `winter_ban` | boolean | Seasonal ban present |
| `winter_ban_months`, `winter_ban_hours` | string | Ban window details |
| `snow_emergency_rules` | string | Advisory during snow emergencies |
| `towing_enforced` | boolean | Whether towing is active |
| `tow_zones_map_url?` | string | Optional tow zone map |
| `ticket_amounts` | string | Typical ticket or tow costs |
| `notes_public?` | string | Optional notes for residents or visitors |

### Bulk trash schema

| Field | Type | Notes |
| --- | --- | --- |
| `service_type` | `"curbside" \| "appointment" \| "dropoff" \| "mixed"` | Delivery model |
| `schedule_pattern` | string | Recurrence or request rules |
| `request_url?` | string | Appointment portal |
| `eligible_items`, `not_accepted_items` | string[] | Accepted / prohibited items |
| `limits` | string | Quantity, size, or weight limits |
| `fees` | string | Fee schedule |
| `holiday_shifts` | string | How holidays affect service |
| `illegal_dumping_reporting` | string | Hotline or URL |
| `notes_public?` | string | Optional resident guidance |

### Fireworks schema

| Field | Type | Notes |
| --- | --- | --- |
| `jurisdiction_level` | `"state" \| "county" \| "city"` | Scope of the record |
| `allowed_consumer_fireworks` | boolean or `"restricted"` | Legal status |
| `sale_periods`, `use_hours` | string | Allowed sale / usage windows |
| `permit_required` | boolean | Whether a permit is necessary |
| `age_restrictions` | string | Minimum age or documentation |
| `prohibited_types` | string[] | Banned devices |
| `enforcement_notes` | string | Additional enforcement information |
| `fine_range?` | string | Optional range of fines |
| `county_overrides?`, `city_overrides?` | array | Local overrides with message text |
| `notes_public?` | string | Optional advisory |

### Working with CSV inputs

1. Use the CSV headers that match each dataset's JSON schema. For array fields, separate values with the `|` pipe (`Furniture|Mattresses`).
2. Run `pnpm csv2json` to regenerate JSON. Set `FORCE_CSV_EXPORT=true` to overwrite existing JSON when the CSV is the source of truth.
3. Run `pnpm fetch:heroes` to download any `hero_image_url` images into `public/hero` and generate `lib/data/heroImages.json` mapping.
4. Run `pnpm pages:cache` to write fresh slug index files for faster builds (optional during development, recommended before production builds).

### Validation workflow

Run `pnpm validate` to parse each dataset with Zod, verify unique slugs, and surface unknown timezones or future `last_verified` dates. The script prints a per-topic summary and exits with a non-zero code if any dataset fails validation.

When hand-editing JSON (for example, `quiet_hours.json`), sanity-check the file before committing:

```bash
python - <<'PY'
import json, pathlib
path = pathlib.Path("city-rules-website/lib/data/quiet_hours.json")
json.loads(path.read_text())
print("quiet_hours.json OK")
PY
```

If the parser raises an error, fix the offending line before running `pnpm validate`.

### Sitemap spot-check

After deployment, confirm new routes are emitted by the sitemap:

```bash
curl -s https://your-domain.example.com/sitemap.xml | grep parking-rules
curl -s https://your-domain.example.com/sitemap.xml | grep fireworks
```

## SEO & accessibility checklist

- [x] Canonical URLs driven by `SITE_URL`
- [x] Dynamic Open Graph & Twitter metadata per topic page
- [x] `BreadcrumbList`, `FAQPage`, `Organization`, and `WebSite` JSON-LD
- [x] Static sitemap with `lastmod` sourced from `last_verified`
- [x] Accessible breadcrumb navigation, keyboard-friendly accordions, and topic tabs
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
 Vercel will run `pnpm install && pnpm build`. The output directory is `.next`.

## Content policy & disclaimers

- This site summarises public regulations for convenience and does not provide legal advice.
- Always confirm details with the latest municipal bylaw, posted signage, or fire authority before enforcement.
- Data files include `notes_admin` fields for internal review. Never surface these in UI.
- Respect local privacy and community standards when sharing templates or enforcement steps.

## Contributing

1. Add or update data in `lib/data/`.
2. Run `pnpm validate && pnpm test` before committing.
3. Include clear descriptions of bylaw sources in commit messages or PR descriptions.




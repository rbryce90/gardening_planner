---
phase: 01-deno-migration-and-infrastructure
plan: 02
subsystem: database
tags: [sqlite, seed-data, deno, json, plants, zones]

requires:
  - phase: 01-01
    provides: Deno migration and node:sqlite infrastructure

provides:
  - seed-data.json with all 6 entity types (20 plants, 43 types, 15 companions, 10 antagonists, 13 zones, 46 seasons)
  - Re-runnable deno task seed script with idempotent inserts
  - Populated plants.db with real companion/antagonist relationship data

affects:
  - Phase 2 (user auth) — zones are seeded, zone selection will reference real zone data
  - Phase 3 (grid builder) — companion/antagonist data populated, visual feedback will have real pairs
  - Phase 4 (seasonal calendar) — planting_seasons data seeded for Zones 5-9

tech-stack:
  added: []
  patterns:
    - "JSON import assertion: import data from './file.json' with { type: 'json' }"
    - "Idempotent insert without UNIQUE constraint: INSERT INTO ... SELECT ... WHERE NOT EXISTS"
    - "FK-ordering convention: lower plant ID stored as plant_id in companions/antagonists"
    - "Seed script creates tables if not exists — works on fresh and existing DBs"

key-files:
  created:
    - server/scripts/seed-data.json
    - server/scripts/seed.ts
  modified: []

key-decisions:
  - "WHERE NOT EXISTS pattern used for plant_types, companions, antagonists since those tables have no UNIQUE constraint"
  - "Seed script creates schema tables itself (CREATE TABLE IF NOT EXISTS) so it works standalone on a fresh DB"
  - "Lower-ID-first convention enforced in seed script for companions and antagonists using Math.min/Math.max"

patterns-established:
  - "Seed data as JSON: top-level keys match table names, references use name strings resolved to IDs at import time"
  - "Re-runnable seeds: INSERT OR IGNORE for tables with UNIQUE constraints, WHERE NOT EXISTS for others"

requirements-completed: [SEED-01, SEED-02]

duration: 8min
completed: 2026-03-22
---

# Phase 01 Plan 02: Seed Data and Import Script Summary

**20 plants, 43 types, 15 companion pairs, 10 antagonist pairs, 13 USDA zones, and 46 planting seasons loaded via idempotent Deno seed script**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-22T22:42:00Z
- **Completed:** 2026-03-22T22:50:16Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `server/scripts/seed-data.json` with comprehensive data for all 6 entity types, carrying forward existing shell script data and adding 30+ plant types, companion/antagonist pairs, and planting season entries
- Created `server/scripts/seed.ts` that imports JSON, creates tables on fresh DBs, and inserts all data idempotently
- Verified `deno task seed` runs to completion on both a fresh database and a second run (0 duplicates inserted on second run)

## Task Commits

Each task was committed atomically:

1. **Task 1: Author seed-data.json with all 6 entity types** - `a1045b2` (feat)
2. **Task 2: Write re-runnable seed import script** - `7134282` (feat)

**Plan metadata:** committed with docs commit below

## Files Created/Modified

- `server/scripts/seed-data.json` - Canonical seed data: 20 plants with family field, 43 plant types across 11 species, 15 companion pairs, 10 antagonist pairs, 13 USDA zones, 46 planting season entries for Zones 5-9
- `server/scripts/seed.ts` - Standalone Deno seed script using node:sqlite DatabaseSync; creates tables, resolves name references to IDs, inserts in FK dependency order, fully idempotent

## Decisions Made

- Used `WHERE NOT EXISTS` pattern for tables without UNIQUE constraints (plant_types, companions, antagonists, planting_seasons) to achieve idempotency without schema changes
- Seed script creates all 6 tables itself via `CREATE TABLE IF NOT EXISTS` so it is self-contained and works on a fresh database without requiring the server to run first
- Lower-ID-first convention for companions/antagonists enforced at insert time using `Math.min`/`Math.max` on resolved IDs

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `plants.db` is seeded with real companion/antagonist data — Phase 3 grid builder can display relationship feedback immediately
- All 13 USDA zones and 46 planting season entries are populated — Phase 4 seasonal calendar has data to display
- `deno task seed` is the canonical data import command; re-run anytime to restore seed data without duplicates

## Self-Check: PASSED

All files confirmed present. All commits confirmed in git log.

---
*Phase: 01-deno-migration-and-infrastructure*
*Completed: 2026-03-22*

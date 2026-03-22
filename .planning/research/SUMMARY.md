# Project Research Summary

**Project:** Gardening Planner
**Domain:** Grid-based garden planning tool with companion planting and seasonal scheduling
**Researched:** 2026-03-22
**Confidence:** HIGH

## Executive Summary

This is a brownfield Express 5 / React 19 / SQLite project being extended with user authentication, a visual garden grid builder, companion/antagonist conflict indicators, and a seasonal planting calendar. The codebase is partially migrated from Deno, and that migration debt is the single most important thing to resolve before anything else ships. All core patterns — sparse grid storage, client-side conflict derivation, JWT in HttpOnly cookies, single SQLite file — are well-established and directly applicable here.

The recommended approach is strictly sequential for the first two phases: complete the Deno-to-Node migration and auth infrastructure before touching the grid builder. Every other feature depends on users existing and gardens being user-owned. The grid builder itself requires no new UI libraries — MUI's Box/Grid components and React state with a flat cell map cover everything. The seasonal planting calendar is a pure read path that can be built in parallel once zone preferences are stored on the user record.

The key risks are architectural decisions made too early in the wrong order: adding garden creation before `user_id` is on the schema (IDOR vulnerability), storing conflict state rather than deriving it from live relationship data (stale UI), and introducing schema changes without a migration runner (broken existing installs). All three have clear prevention strategies and must be addressed at the start of each respective phase.

## Key Findings

### Recommended Stack

No new frontend libraries are needed. MUI already covers all grid rendering needs. On the server side, `jsonwebtoken`, `bcrypt`, and `cookie-parser` handle auth; `dotenv` and `winston` are overdue additions for secret management and logging. The seed script pattern uses `tsx` as a zero-config TypeScript runner. A test foundation (`jest`, `ts-jest`, `supertest`) is entirely absent today and must be added.

**Core technologies:**
- `jsonwebtoken` + `bcrypt` + `cookie-parser`: JWT in HttpOnly cookie auth — simpler than session tables, already the right pattern for this stack
- `winston`: Structured logging — required by project standards; replaces thin console wrapper
- `dotenv`: Secret management — required before `JWT_SECRET` can be stored safely
- `jest` + `ts-jest` + `supertest`: Test foundation — nothing is currently tested; must be established before auth ships
- `tsx`: Seed script runner — zero-config TypeScript execution for one-off data import
- CSS Grid + React state (no new library): Grid builder UI — click-to-place with a flat cell map; drag-and-drop is explicitly out of scope

### Expected Features

**Must have (table stakes):**
- User accounts (signup, login, logout) — all garden ownership depends on this
- Grid builder with configurable size — the core product interaction
- Plant placement (click-to-place) with plant picker — primary user action
- Visual companion/conflict indicators (green/red cell borders) — core value proposition
- Save and reload garden layouts — without persistence the product has no value
- Hardiness zone selection on user profile — required for seasonal features
- Seasonal planting view by zone and month — already schema-modeled, needs data and UI

**Should have (competitive differentiators):**
- Inline conflict/companion explanation tooltips — why two plants conflict, not just that they do
- Full garden health score — % of good neighbor vs. conflict pairings at a glance
- Monthly planting checklist — "ready to plant now" and "start indoors in X weeks"
- Bed naming and annotation — label grids for multi-bed yards
- Clone/copy garden design — iterate on last year's layout

**Defer (v2+):**
- Print/export to PDF
- Suggested replacements for conflicting plants
- Drag-and-drop placement
- Auto-location / GPS zone detection
- Social/sharing features

### Architecture Approach

The existing layered monorepo (Express routes → controllers → repositories → SQLite) maps cleanly onto all new features with no structural changes needed. New tables (`users`, `gardens`, `garden_cells`) fold into the existing `plants.db` single-file database under the `getDatabase()` singleton. Grid state is managed client-side as a flat `Record<"row,col", CellData>` map; conflict computation runs in the browser using companion/antagonist data loaded once at garden mount time. The `userDb.ts` Deno scaffold must be deleted and replaced with a Node-compatible implementation before anything compiles.

**Major components:**
1. `GardenBuilder` page — grid state, cell map, conflict map, save/load orchestration
2. `GardenGrid` + `GridCell` — renders N×M cell matrix, applies conflict/companion CSS classes
3. `PlantPicker` — searchable plant list; emits selected plant ID to `GardenBuilder`
4. `SeasonalCalendar` page + `ZonePicker` — displays planting windows by zone and month
5. `authController` + `authMiddleware` — bcrypt password handling, JWT issuance, route guard
6. `gardenRepository` — sparse `garden_cells` SQL with JOIN to plant details in one query

### Critical Pitfalls

1. **Deno migration debt left unresolved** — 13 files still have Deno imports that block compilation. Complete the migration atomically as the first milestone; zero new features until the server compiles clean.
2. **Auth bolted on after gardens ship without `user_id`** — Adding user ownership after the fact requires data migration and risks IDOR bugs. Add `user_id` FK to the gardens table before any garden creation UI exists.
3. **Grid state stored as full 2D array or JSON blob** — Only occupied cells should be persisted as `(garden_id, row, col, plant_type_id)` rows. Empty cells are inferred by absence.
4. **Conflict state stored rather than derived** — Never persist a conflict/companion status per cell. Always derive it at render time from live companion/antagonist data loaded alongside the garden.
5. **No schema migration system before first ALTER TABLE** — `CREATE TABLE IF NOT EXISTS` breaks on schema changes. Add a sequential migration runner before any new tables or columns are added.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Migration and Infrastructure Cleanup
**Rationale:** The server does not compile cleanly today. Every other milestone is blocked until the Deno-to-Node migration is complete and baseline infrastructure (Winston, dotenv, centralized error handling, test foundation) is in place. This is not optional prep work — it is the unblock gate.
**Delivers:** Compiling server with Winston logging, dotenv secret loading, centralized error middleware, Jest test runner, and no remaining Deno imports.
**Addresses:** Pre-existing route order bug (specific routes before `/:id`), raw error objects in API responses, duplicate repository instantiation, mixed JSX/TSX files.
**Avoids:** Pitfalls 5 (Deno debt), 11 (error leakage), 13 (duplicate repo instances).

### Phase 2: User Authentication
**Rationale:** Gardens are user-owned. Auth must exist before gardens exist in production. The `user_id` FK on the gardens table must be in place even if enforcement comes later. All seasonal features depend on zone being stored on the user record.
**Delivers:** Signup, login, logout endpoints; JWT in HttpOnly cookie; `users` table with `zone_id` FK; `authMiddleware` guard on protected routes; zone selector on user profile.
**Uses:** `jsonwebtoken`, `bcrypt`, `cookie-parser`, `dotenv`
**Avoids:** Pitfalls 3 (auth after gardens), 4 (zone as string), 6 (no migration system), 10 (missing Secure/SameSite cookie flags).

### Phase 3: Garden CRUD and Grid Builder
**Rationale:** With users and auth in place, garden ownership is safe. The schema can include `user_id` from the first migration. This phase delivers the core product value — placing plants on a grid and seeing companion/conflict feedback.
**Delivers:** `gardens` + `garden_cells` tables (sparse); garden list, create, delete; grid builder UI with plant placement and visual companion/antagonist indicators.
**Uses:** CSS Grid + MUI Box, flat `Record<"row,col", CellData>` state, client-side conflict derivation, upsert pattern for cell writes.
**Avoids:** Pitfalls 1 (2D blob storage), 2 (stored conflict state), 7 (route order), 8 (N+1 queries on grid load), 14 (no UI service layer).

### Phase 4: Seasonal Planting Calendar
**Rationale:** Depends on zone preference from Phase 2. Schema already exists; this phase seeds the data and builds the UI. Can be partially parallelized with Phase 3 if zone is available from a local picker, but full integration requires the user profile from Phase 2.
**Delivers:** Seeded `planting_seasons` data (JSON seed file + `tsx` runner); `GET /api/zones/:zoneId/seasons` endpoint; `SeasonalCalendar` page with month grouping and `ZonePicker`.
**Uses:** `tsx` for seed script, existing `zones`/`planting_seasons` schema, standard axios + React state.
**Avoids:** Pitfall 9 (month ranges as strings — use `start_month`/`end_month` integers).

### Phase 5: Polish and Differentiators
**Rationale:** Once the core loop (place plants, see conflict feedback, view seasonal calendar) is working, these features improve the experience without blocking anything.
**Delivers:** Conflict/companion explanation tooltips, garden health score, monthly planting checklist, bed naming, clone garden design.
**Addresses:** Differentiators from FEATURES.md that were explicitly deferred from earlier phases.

### Phase Ordering Rationale

- Phase 1 before everything: the server must compile
- Phase 2 before Phase 3: `user_id` must be on the schema before gardens are created; no safe way to retrofit ownership
- Phase 3 before Phase 5: the conflict indicator UI must exist before tooltip overlays make sense; the grid must have placements before a health score is meaningful
- Phase 4 after Phase 2: zone is stored on the user record; seasonal data is pointless without a zone context
- Phase 4 can overlap late Phase 3: the seasonal calendar is a read-only display path with no dependency on the grid builder code itself

### Research Flags

Phases with standard patterns (skip research-phase):
- **Phase 1:** Migration and cleanup — patterns are well-documented and grounded in direct codebase analysis
- **Phase 2:** JWT auth in Express — highly documented, established patterns; no novel integration needed
- **Phase 3:** React grid with CSS Grid — no novel library; patterns are standard
- **Phase 4:** Seasonal data seed + read endpoint — standard SQL query + React display

No phases require deeper research. All patterns are well-documented or directly derived from codebase analysis.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All library choices are established Node.js standards; grid approach derived directly from stated click-to-place constraint in PROJECT.md |
| Features | MEDIUM | Domain patterns drawn from training-data knowledge of comparable tools; core expectations are stable and well-established |
| Architecture | HIGH | Directly based on codebase analysis of existing files; no speculation required |
| Pitfalls | HIGH | Most pitfalls are directly evidenced in the codebase (CONCERNS.md, existing Deno files); not hypothetical |

**Overall confidence:** HIGH

### Gaps to Address

- **Planting seasons seed data:** The `planting_seasons` table schema exists but contains no data. The content of the JSON seed file (which plants, which zones, what date ranges) must be sourced or created before Phase 4 can deliver a useful seasonal view.
- **USDA zone list:** The `zones` table likely needs seed data too. Confirm what zone data exists before Phase 4 planning.
- **Test coverage strategy:** No tests exist today. The Phase 1 deliverable includes the Jest setup, but the team should decide on coverage targets for auth and garden endpoints before Phase 2 begins.

## Sources

### Primary (HIGH confidence)
- `/home/bryce/dev/personal/gardening_planner/.planning/codebase/CONCERNS.md` — codebase audit, fragile areas, existing bugs
- `/home/bryce/dev/personal/gardening_planner/.planning/PROJECT.md` — requirements, constraints, explicit scope decisions
- `/home/bryce/dev/personal/gardening_planner/server/databases/plantDb.ts` — confirmed schema (zones, planting_seasons, existing tables)
- `/home/bryce/dev/personal/gardening_planner/.planning/codebase/ARCHITECTURE.md` — layer structure, data flow

### Secondary (MEDIUM confidence)
- Domain knowledge from training data (GrowVeg, Growstuff, Old Farmer's Almanac Garden Planner, SmartGardener) — feature expectations and table-stakes patterns

### Tertiary (LOW confidence)
- None

---
*Research completed: 2026-03-22*
*Ready for roadmap: yes*

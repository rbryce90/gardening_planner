# Domain Pitfalls

**Domain:** Grid-based garden planning tool — garden builder, user auth, seasonal planting
**Project:** Gardening Planner (brownfield Express 5 / React 19 / SQLite)
**Researched:** 2026-03-22

---

## Critical Pitfalls

Mistakes that cause rewrites or major regressions.

---

### Pitfall 1: Grid State Stored as Flat Cell Array Without Sparse Representation

**What goes wrong:** The garden grid is modeled as a full 2D array (e.g., `cells[row][col]`). Every cell — including empty ones — is serialized and persisted. A 20x20 grid produces 400 rows in the DB or a 400-element JSON blob, most of it nulls. When grids grow or users create many designs, storage balloons and loading becomes slow.

**Why it happens:** The obvious first-pass data model mirrors the visual grid 1:1.

**Consequences:** Changing grid dimensions later becomes a migration problem. Diff/merge of designs is impossible. The schema couples cell count to grid size permanently.

**Prevention:** Store only occupied cells as `(garden_id, row, col, plant_type_id)` rows — a sparse representation. Empty cells are inferred by absence. Grid dimensions are metadata on the garden record (`width`, `height`). This is trivially extensible and stores nothing for empty cells.

**Warning signs:** A `grid_cells` table with a `data` JSON blob column, or a fixed-width array column. Any schema where an empty grid has as many DB rows as a full one.

**Phase:** Address during the grid builder schema design phase, before any UI is built.

---

### Pitfall 2: Companion/Antagonist Conflict Checking Done Client-Side Only

**What goes wrong:** The React grid component calculates which cells are red (antagonist neighbors) and which get companion indicators purely in the browser. No server validation exists. This produces inconsistent states when data changes on the backend (e.g., a relationship is added/removed) and the saved design is loaded with stale relationship data.

**Why it happens:** It feels natural to compute visual state in the component. The conflict logic seems like a "display concern."

**Consequences:** A user saves a design that shows no conflicts. An admin later adds an antagonist relationship between two plants already placed adjacently. On reload, the saved design silently shows incorrect (or no) conflict data unless the client re-evaluates. Worse, if business logic ever runs server-side (e.g., a "safe to plant?" API), results will diverge from the client view.

**Prevention:** Conflict state is derived, not stored. Always derive it at render time from live relationship data. The canonical source is the companions/antagonists tables — never cache a "conflict status" per cell. On grid load, always fetch current relationship data alongside the placed plants and recompute.

**Warning signs:** A `cell_conflict` or `cell_status` column in any table. Conflict arrays stored in garden JSON blobs.

**Phase:** Grid builder design phase. Establish the derivation-not-storage rule before the first cell component is built.

---

### Pitfall 3: Auth Bolted On After Data Is Already User-Unscoped

**What goes wrong:** The grid builder ships first, allowing anyone to create and save gardens. Gardens are stored without a `user_id`. When auth is added later, existing garden records have no owner and must be migrated or discarded. Every query must be retrofitted with `WHERE user_id = ?` filtering. Missing one opens an IDOR vulnerability (user A reads user B's garden).

**Why it happens:** Auth feels like "infrastructure" that can wait. The feature is easier to demo without it.

**Consequences:** Data migration is painful. Security audit required on every endpoint. Risk of shipping IDOR bugs.

**Prevention:** Add the `user_id` foreign key to the gardens table before any garden creation UI exists, even if auth is not yet enforced. Use a placeholder/seed user during development. When auth ships, the column is already there.

**Warning signs:** A `gardens` table with no `user_id` column. Any "create garden" endpoint that does not associate a user.

**Phase:** Auth phase must precede or run concurrently with grid builder persistence. If grid builder ships first, the schema must still include `user_id` from day one.

---

### Pitfall 4: Hardiness Zone Treated as a Display Label Instead of a Query Key

**What goes wrong:** The user's zone is stored as a display string (e.g., `"Zone 6b"`) rather than a structured value. Planting season queries do string matching against zone labels. When zone data is sourced from a lookup table (the existing `zones` table), the join breaks on minor label inconsistencies (`"6b"` vs `"Zone 6b"` vs `"USDA 6b"`).

**Why it happens:** Zone is user-visible so it looks like a string field.

**Consequences:** Seasonal planting queries return no results for users whose zone string doesn't match exactly. Sorting/filtering by zone becomes unreliable. Any zone range logic (e.g., "valid for zones 5–8") is impossible with strings.

**Prevention:** Store the user's zone as a foreign key (`zone_id`) referencing the `zones` table. The existing schema already has a `zones` table — use it. Zone display label lives in the zones table; the user record holds only the ID.

**Warning signs:** A `zone` text column on the users table. Any `WHERE zone = ?` query doing string comparison.

**Phase:** Auth/user profile phase — when user zone selection is built.

---

### Pitfall 5: Deno-to-Node Migration Debt Left Unresolved Before New Features Ship

**What goes wrong:** Auth, user, zone, and session files still contain Deno imports and will not compile. Adding new features on top of a partially-migrated codebase means any refactor that touches those files triggers cascading compile errors. Developers discover the debt mid-feature and context-switch into migration work unexpectedly.

**Why it happens:** The existing files look "done" in the directory tree and get overlooked during planning.

**Consequences:** Auth feature cannot ship until migration is complete. Timeline estimates for auth are wrong because they don't account for the migration cost. Every PR touching `server/routes/` risks merge conflicts with concurrent migration work.

**Prevention:** Complete the Deno-to-Node migration as a prerequisite milestone before any new feature development begins. Treat the 13 affected files as a single atomic migration — port, delete, and verify compilation in one phase. Do not interleave with feature work.

**Warning signs:** Any `deno.land` import remaining in any `.ts` file when auth PRs open. TypeScript compilation errors in `authRoutes.ts` or `authController.ts`.

**Phase:** Must be the first milestone. Zero new features until the server compiles clean.

---

### Pitfall 6: No Schema Migration System Before Schema Changes Ship

**What goes wrong:** The database schema is initialized with `CREATE TABLE IF NOT EXISTS` in `plantDb.ts`. Adding a column (e.g., `user_id` on gardens, `zone_id` on users) requires manually altering existing SQLite databases. New developers cloning the repo get the correct schema; existing users do not. Silent data corruption or runtime errors result.

**Why it happens:** `CREATE TABLE IF NOT EXISTS` works fine for greenfield. The problem only surfaces when the schema needs to change.

**Consequences:** Any schema change that ships without a migration step breaks existing installs. Rolling back a failed migration requires manual SQL. There is no audit trail of schema history.

**Prevention:** Introduce a migration library (recommended: `better-sqlite3` with a lightweight migration runner like `umzug` or hand-rolled sequential migration files) before the first schema-altering change. Migrations run at server startup. Each migration is a numbered, append-only SQL file.

**Warning signs:** A second `ALTER TABLE` statement anywhere in `plantDb.ts`. Any comment like "run this SQL manually to upgrade."

**Phase:** Should be addressed during the auth/grid-builder schema phase — the first milestone that adds new tables.

---

## Moderate Pitfalls

---

### Pitfall 7: Express Route Order Causes Silent 404s on Specific Endpoints

**What goes wrong:** Express matches `/:id` before `/:name/types` when routes are registered in the wrong order. A GET to `/api/plants/basil/types` matches the `/:id` handler with `id = "basil"`, which does an integer lookup, finds nothing, and returns 404 — with no visible error.

**Why it happens:** Generic parameter routes feel like catch-alls and are often registered early.

**Prevention:** Always register specific routes (`/:name/types`) before generic parameter routes (`/:id`) in the same router. This bug already exists in the codebase (CONCERNS.md, fragile areas) — fix it before adding any new parameterized routes.

**Warning signs:** Any new `/:param/sub-resource` route registered after `/:id`.

**Phase:** Pre-existing bug — fix in the debt-cleanup milestone before adding new routes.

---

### Pitfall 8: N+1 Queries on Grid Load with Many Placed Plants

**What goes wrong:** Loading a garden layout triggers one query to get placed cells, then one query per cell to resolve the plant name/details. A 20-plant garden issues 21 queries. This pattern already exists for companion/antagonist resolution (CONCERNS.md) and will replicate to the grid unless explicitly avoided.

**Why it happens:** The controller fetches a list of IDs and resolves each in a loop — the same pattern already in `plantController.ts`.

**Prevention:** Use a single JOIN query to load grid cells with plant details in one round-trip. Establish this as the pattern for the grid builder repository from the start — do not copy the per-row resolution pattern from `plantController.ts`.

**Warning signs:** Any `for` loop in a controller that calls a repository method.

**Phase:** Grid builder repository phase.

---

### Pitfall 9: Seasonal Planting Data Modeled as Free-Text Notes Instead of Structured Records

**What goes wrong:** Planting seasons (already partially scaffolded in the DB) are stored as text notes or month name strings. Queries like "what should I plant in March in zone 6b?" require application-level string parsing. Filtering by month range becomes unreliable.

**Why it happens:** Planting guidance is often presented as prose ("plant after last frost") and gets stored that way.

**Prevention:** Store planting windows as structured integer fields: `start_month` (1–12), `end_month` (1–12), `zone_id` (FK). Month-based queries become simple `WHERE ? BETWEEN start_month AND end_month` SQL. Display labels are derived from month numbers in the UI.

**Warning signs:** A `planting_notes` text column used for date ranges. Month names stored as strings.

**Phase:** Seasonal planting feature phase.

---

### Pitfall 10: Session Cookie Missing Secure Flag in Production

**What goes wrong:** The `authRoutes.ts` session cookie is set with `HttpOnly` only. Without `Secure`, the cookie is transmitted over plain HTTP, allowing session hijacking on non-HTTPS connections.

**Why it happens:** The flag was omitted in the original stub. The route is currently unreachable, so it has never been tested.

**Prevention:** When porting auth to Node/Express, set `Secure: true` and `SameSite: 'strict'` on the session cookie. Gate `Secure` behind an environment check (`process.env.NODE_ENV === 'production'`) to allow HTTP in local dev.

**Warning signs:** Any `res.cookie()` call without a `secure` option.

**Phase:** Auth migration phase.

---

### Pitfall 11: Error Objects Leaked to API Clients

**What goes wrong:** All current route error handlers respond with `{ error: err }` — the raw caught error. This exposes stack traces, SQL query text, and internal file paths to any client.

**Why it happens:** The pattern was established early in the codebase and replicated across all routes.

**Prevention:** Implement a centralized Express error handler middleware that logs the full error internally (via Winston) and responds with only `{ message: "User-facing description" }`. Remove per-route `catch` blocks that serialize raw errors. This is already called out in CONCERNS.md and in the global CLAUDE.md standard.

**Warning signs:** Any `res.json({ error: err })` or `res.json({ error: e.message })` in a route handler.

**Phase:** Debt-cleanup milestone before any new routes are added.

---

## Minor Pitfalls

---

### Pitfall 12: Mixed JSX/TSX Files Create Type Blind Spots

**What goes wrong:** The UI mix of `.jsx` and `.tsx` files means TypeScript type checking is silently skipped for JSX files. Prop type errors in `.jsx` components are invisible until runtime.

**Prevention:** Migrate all `.jsx` to `.tsx` as part of the first UI milestone. TypeScript covers the full component tree.

**Phase:** UI foundation cleanup before grid builder components are written.

---

### Pitfall 13: Duplicate Repository Instantiation Causes Confusing DB State

**What goes wrong:** `plantController.ts` creates `new PlantRepository()` locally while `plantRepository.ts` exports a singleton. Two instances exist simultaneously with separate references, making it unclear which one holds a given state or open transaction.

**Prevention:** Remove the local instantiation in `plantController.ts` and import the exported singleton. Establish the singleton-import pattern as the project convention before any new repositories are written.

**Phase:** Debt-cleanup milestone.

---

### Pitfall 14: No UI Service Layer Means API Logic Is Scattered and Untestable

**What goes wrong:** Axios calls made directly inside page components cannot be mocked in tests, reused across pages, or centrally error-handled. Any API URL change requires hunting through component files.

**Prevention:** Create a `ui/src/services/` layer before the grid builder UI is built. Each service file corresponds to one backend resource (e.g., `gardenService.ts`, `plantService.ts`). Components call service functions, never axios directly.

**Phase:** UI foundation cleanup — before grid builder pages are written.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Deno migration / auth | Dead Deno imports block compilation | Complete migration atomically before any new feature |
| Auth schema | No `user_id` on gardens yet | Add `user_id` FK to gardens table before grid builder ships |
| Auth cookies | Missing Secure/SameSite flags | Add both in port from Deno; gate Secure on NODE_ENV |
| Grid builder schema | Flat cell array storage | Use sparse `(garden_id, row, col, plant_type_id)` row model |
| Grid builder UI | Conflict state stored not derived | Derive conflict from live relationship data at render time |
| Grid builder repository | N+1 query per cell | JOIN plant details in one query from the start |
| Seasonal planting | Month ranges as strings | Use `start_month`/`end_month` integers + `zone_id` FK |
| Any new routes | Express route order bug | Register specific routes before generic `/:id` routes |
| Any new schema | No migration system | Add migration runner before first ALTER TABLE |
| All new routes | Raw error objects in responses | Centralized error middleware first; no `{ error: err }` |

---

## Sources

- `/home/bryce/dev/personal/gardening_planner/.planning/codebase/CONCERNS.md` — codebase audit (HIGH confidence, primary source)
- `/home/bryce/dev/personal/gardening_planner/.planning/PROJECT.md` — project requirements and constraints (HIGH confidence)
- Domain analysis: brownfield Express/React/SQLite patterns, auth-then-features ordering, sparse grid storage, derived-state principles (MEDIUM confidence — training data, corroborated by codebase evidence)

# Architecture Patterns

**Domain:** Grid-based garden planning/design tool
**Researched:** 2026-03-22
**Confidence:** HIGH (based on codebase analysis + domain reasoning; web search unavailable)

## Recommended Architecture

The existing layered monorepo (Express backend + React SPA) maps cleanly onto all incoming features. No architectural shifts are needed. The additions are additive layers on top of what exists.

```
Browser
  └── React SPA (ui/)
        ├── Pages: GardenBuilder, SeasonalCalendar, Auth (Login/Signup)
        └── Components: GardenGrid, GridCell, PlantPicker, ConflictOverlay, ZonePicker

HTTP /api/*
  └── Express (server/)
        ├── Routes (HTTP boundary)
        ├── Controllers (business logic: grid conflict engine, season filter)
        ├── Repositories (SQL access: gardens, cells, users, zones, seasons)
        └── Databases (SQLite: plants.db — all tables in one file)
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `GardenBuilder` page | Page-level state: current grid, selected plant, save/load | `GardenGrid`, `PlantPicker`, `/api/gardens` |
| `GardenGrid` component | Renders N×M cell matrix; handles cell click events | `GridCell`, receives layout state from `GardenBuilder` |
| `GridCell` component | Single cell: displays plant name/icon, applies conflict/companion CSS class | Receives plant id + relationship status from `GardenGrid` |
| `PlantPicker` component | Searchable/filterable plant list for selecting what to place | Receives plant list; emits selected plant id to `GardenBuilder` |
| `ConflictOverlay` (logic, not separate component) | Computes which cells are in conflict or companion status | Lives in `GardenBuilder`; reads companion/antagonist data already loaded |
| `SeasonalCalendar` page | Displays planting window by month for user's zone | `/api/zones`, `/api/plants/:id/seasons` |
| `ZonePicker` component | Dropdown for USDA zone selection; persists to user profile | Emits zone id to parent page or to `/api/users/:id` |
| `Auth` pages (Login/Signup) | Form UI, calls auth endpoints, stores session token | `/api/auth/login`, `/api/auth/signup` |
| `gardenRouter` (server) | HTTP endpoints for garden CRUD | `gardenController` |
| `gardenController` (server) | Orchestrates fetching garden + cells + plant relationships for conflict computation | `gardenRepository`, `plantRepository` |
| `gardenRepository` (server) | SQL for `gardens` and `garden_cells` tables | `getDatabase()` |
| `userRepository` (server) | SQL for `users`, `sessions`, zone preference | `getDatabase()` |
| `authController` (server) | Password hashing (bcrypt), session creation, token validation | `userRepository` |

### Data Model (new tables needed)

The existing schema in `plantDb.ts` already contains `zones` and `planting_seasons`. New tables required:

```sql
-- users and sessions (migrate from userDb.ts Deno scaffold into plantDb.ts)
users (id, email, password_hash, first_name, last_name, zone_id, created_at)
sessions (id TEXT PK, user_id, expires_at)

-- garden layouts
gardens (id, user_id, name, width, height, created_at, updated_at)
garden_cells (id, garden_id, row, col, plant_type_id)
```

`garden_cells` stores which `plant_type_id` occupies each `(row, col)` position. A null `plant_type_id` means the cell is empty. This is the minimal model — no sparse storage tricks needed at this scale.

### Data Flow

**Grid render (read):**
```
GardenBuilder mounts
  → GET /api/gardens/:id
      → gardenController fetches garden + all cells + plant type data
      → returns { garden: { width, height }, cells: [{ row, col, plantTypeId, plantName }] }
  → GardenBuilder builds cellMap: { "row,col": cellData }
  → GardenBuilder computes conflictMap: { "row,col": "conflict" | "companion" | null }
      (checks all occupied neighbors against companions/antagonists)
  → passes cellMap + conflictMap to GardenGrid as props
  → GardenGrid renders N×M GridCell components, each receiving cell + status
```

**Cell placement (write):**
```
User clicks GridCell with a plant selected in PlantPicker
  → GardenBuilder handles click: optimistic local state update
  → PUT /api/gardens/:id/cells { row, col, plantTypeId }
      → gardenController upserts garden_cells row
  → GardenBuilder recomputes conflictMap from updated cellMap
  → React re-renders affected cells
```

**Conflict computation:**
```
For each occupied cell (row, col):
  check 4 orthogonal neighbors (row±1, col±1)
  for each occupied neighbor:
    if plantId in antagonists of current cell's plant → mark both "conflict"
    if plantId in companions of current cell's plant → mark "companion"
```

Conflict computation runs client-side on the already-loaded companion/antagonist data. No round-trip needed after placement. Plant relationship data is loaded once when the page mounts alongside the garden.

**Seasonal calendar (read):**
```
SeasonalCalendar mounts with user's zone_id
  → GET /api/zones/:zoneId/seasons
      → zoneController queries planting_seasons JOIN plant_types JOIN plants
      → returns [{ plantName, plantTypeName, startMonth, endMonth, method }]
  → Page groups results by month and renders calendar
```

**Auth flow:**
```
User submits login form
  → POST /api/auth/login { email, password }
      → authController: lookup user by email, bcrypt.compare password
      → create session row, return session token
  → UI stores token in localStorage or cookie
  → Subsequent requests: Authorization header or cookie
  → authMiddleware validates token on protected routes
```

## Patterns to Follow

### Pattern 1: Grid State as Flat Cell Map

**What:** Store grid state as `Record<string, CellData>` keyed by `"row,col"` rather than a 2D array.

**When:** Any time you need O(1) cell lookup by coordinates.

**Why:** Conflict computation, click handling, and cell rendering all need to look up neighbors by coordinate. A flat map makes this trivial without nested array indexing.

```typescript
type CellData = { plantTypeId: number; plantName: string };
type CellMap = Record<string, CellData>;  // key: "row,col"

function getNeighbors(map: CellMap, row: number, col: number): CellData[] {
  return [
    map[`${row-1},${col}`],
    map[`${row+1},${col}`],
    map[`${row},${col-1}`],
    map[`${row},${col+1}`],
  ].filter(Boolean);
}
```

### Pattern 2: Client-Side Conflict Computation

**What:** Compute companion/antagonist cell status in the browser after loading plant relationship data once.

**When:** Any cell placement or removal.

**Why:** Relationship data is already loaded for the plant picker. No additional API round-trip needed. The grid is small enough (even 50×50 = 2500 cells) that a full recompute on every change is fast.

```typescript
function computeConflictMap(
  cellMap: CellMap,
  companions: Record<number, number[]>,
  antagonists: Record<number, number[]>
): Record<string, "conflict" | "companion" | null> { ... }
```

### Pattern 3: Upsert for Cell Writes

**What:** `INSERT OR REPLACE INTO garden_cells` (SQLite upsert) for every cell placement.

**When:** Any PUT to `/api/gardens/:id/cells`.

**Why:** A cell can only have one plant. Upsert avoids checking existence before write. On empty cell (removing a plant), DELETE the row instead.

### Pattern 4: Single Database File, Single getDatabase() Singleton

**What:** Fold all new tables (users, sessions, gardens, garden_cells) into `plantDb.ts` / `plants.db`.

**When:** Always — do not create separate DB files per feature.

**Why:** The existing `userDb.ts` uses a Deno-era scaffold that is incompatible with the current Node/sqlite setup. Keeping everything in one SQLite file simplifies joins, backups, and connection management. The `getDatabase()` singleton pattern already handles this cleanly.

### Pattern 5: Auth Middleware Guard on Protected Routes

**What:** Express middleware that validates session token before any garden or user endpoint.

**When:** All `/api/gardens/*` and `/api/users/*` routes.

**Why:** Gardens are user-owned. Auth must be checked before any garden read/write. Middleware keeps this out of controllers.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing Grid as 2D Array in Database

**What:** Serializing the full grid as a JSON blob per garden.

**Why bad:** Impossible to query individual cells, update single placements efficiently, or join against plant data. A 50×50 grid blob grows to hundreds of KB and makes all cell access O(n).

**Instead:** Store each occupied cell as a row in `garden_cells (garden_id, row, col, plant_type_id)`. Only occupied cells need rows — sparse representation.

### Anti-Pattern 2: Server-Side Conflict Computation on Every Placement

**What:** Calling the server to recompute and return conflict status after each cell click.

**Why bad:** Adds latency to every interaction. The data needed (companions, antagonists) is already in the browser. The computation is O(cells * 4 neighbors) — trivial client-side.

**Instead:** Load companion/antagonist data once at garden load time. Recompute conflict map client-side on every change.

### Anti-Pattern 3: Two Separate SQLite Database Files

**What:** Keeping `user.db` separate from `plants.db`.

**Why bad:** Cross-file SQLite joins are not supported by the `sqlite` npm package without ATTACH. Creates two connection singletons, two schema init paths, two files to back up.

**Instead:** Consolidate all tables into `plants.db` under the single `getDatabase()` singleton.

### Anti-Pattern 4: Storing Session Tokens in localStorage Without CSRF Consideration

**What:** Storing the session token in `localStorage` and sending it in headers.

**Why bad:** XSS can steal `localStorage`. For a low-stakes app this is acceptable, but httpOnly cookies are better.

**Instead:** Use httpOnly cookies for session tokens. The existing session middleware scaffold in `server/middleware/session.ts` already points toward this pattern. Revisit during auth phase.

### Anti-Pattern 5: Bypassing the Service Layer in UI

**What:** Making `axios` calls directly from components (not pages).

**Why bad:** The current architecture has pages owning data fetching. Components receive data via props. Mixing this breaks the component/page boundary and makes testing harder.

**Instead:** All API calls originate in page-level components or (when the project adds one) a `ui/src/services/` layer. Components remain purely presentational.

## Suggested Build Order

Dependencies dictate this sequence — each phase unblocks the next.

```
1. Infrastructure: Auth + Users
   - users/sessions tables in plantDb.ts (replaces userDb.ts Deno scaffold)
   - authController (bcrypt, session create/validate)
   - authMiddleware (token guard for protected routes)
   - Login/Signup pages in React
   - Zone selection stored on user record
   - UNBLOCKS: everything that needs user ownership

2. Garden CRUD (headless)
   - gardens + garden_cells tables
   - gardenRouter/Controller/Repository
   - GET /api/gardens (list user's gardens), POST (create), DELETE
   - GET /api/gardens/:id/cells, PUT (place plant), DELETE (clear cell)
   - UNBLOCKS: the grid UI, which needs endpoints to persist to

3. Garden Grid UI
   - GardenBuilder page: grid state, cell map, conflict map
   - GardenGrid + GridCell components
   - PlantPicker component
   - Conflict/companion visual feedback (CSS classes on GridCell)
   - UNBLOCKS: full garden workflow; depends on steps 1+2

4. Seasonal Calendar
   - Zones and planting_seasons data already schema-defined
   - Seed zones + seasons data (JSON seed file)
   - GET /api/zones/:zoneId/seasons endpoint
   - SeasonalCalendar page + ZonePicker component
   - DEPENDS ON: user zone preference from step 1; otherwise can use a local picker
   - Can be built in parallel with step 3 if zone preference is stored locally first
```

## Scalability Considerations

| Concern | At current scale | At 10K users |
|---------|-----------------|--------------|
| SQLite concurrency | No issue (single user per dev) | WAL mode handles concurrent reads; writes serialize fine for hobby scale |
| Grid conflict computation | O(cells) client-side, negligible | Still client-side, still negligible |
| Session storage | Sessions table in SQLite | Fine through 10K; would need Redis at 100K+ |
| Plant relationship data size | Hundreds of rows | Thousands of rows — still loads fast |

## Sources

- Codebase analysis: `/home/bryce/dev/personal/gardening_planner/server/databases/plantDb.ts` (confirmed schema)
- Codebase analysis: `/home/bryce/dev/personal/gardening_planner/.planning/codebase/ARCHITECTURE.md` (layer structure, data flow)
- Codebase analysis: `/home/bryce/dev/personal/gardening_planner/.planning/PROJECT.md` (requirements, constraints)
- Confidence: HIGH for all structural claims (based on direct codebase analysis). Grid state patterns are well-established React patterns, not speculative.

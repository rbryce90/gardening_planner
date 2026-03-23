# Phase 3: Garden Builder - Research

**Researched:** 2026-03-22
**Domain:** Grid data model, REST API for user-owned garden layouts, React grid UI, companion/antagonist neighbor highlighting
**Confidence:** HIGH

## Summary

Phase 3 adds the core product feature: authenticated users create named garden grids of configurable size, place plants into cells, save layouts to the database, and receive immediate visual feedback on companion/antagonist relationships between neighboring cells.

The data model is the biggest design decision. A garden has rows and columns (integers). Each cell is identified by its (row, col) coordinates and holds a reference to a plant ID. Storing cells as a sparse table (only occupied cells have rows) is simpler than a flat JSON blob because it avoids full-layout serialization round-trips and supports the neighbor-lookup query naturally. The companion/antagonist tables already store symmetric relationships with the lower plant ID first — the neighbor-check logic must query both directions (`WHERE (plant_id = A AND companion_id = B) OR (plant_id = B AND companion_id = A)`).

The UI is a two-panel layout on a new `/garden` route: a list of saved gardens on the left and the selected grid on the right. Each cell is an MUI `Paper` or `Box` component with a click handler that opens a plant picker dialog. Cell background color is derived from the computed neighbor relationship status (green = all neighbors are companions or neutral, red = at least one antagonist neighbor). The relationship status is computed client-side from data fetched on load — no per-click API call needed.

**Primary recommendation:** Sparse `garden_cells` table keyed by (garden_id, row, col). Fetch all companions and antagonists for all plants in the garden on load, compute neighbor status in a client-side lookup, render grid cells as MUI `Box` with `sx` background color driven by that status.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GRID-01 | User can create a named garden grid of any size | `gardens` table with `name`, `rows`, `cols`, `user_id`; POST `/api/gardens` protected by authMiddleware |
| GRID-02 | User can click a grid cell and select a plant to place | MUI Dialog plant picker; PUT `/api/gardens/:id/cells/:row/:col`; sparse `garden_cells` table |
| GRID-03 | User can save and reload garden layouts | Garden layout persists in `garden_cells`; GET `/api/gardens/:id` returns cells array; frontend reconstructs grid from sparse data |
| GRID-04 | User can have multiple saved garden designs | `gardens` table scoped to `user_id`; GET `/api/gardens` returns all gardens for authenticated user |
| GRID-05 | Grid cells highlight red when neighboring plants are antagonists | Neighbor check on (row±1, col) and (row, col±1); client-side lookup against fetched antagonist pairs |
| GRID-06 | Grid cells highlight green when neighboring plants are companions | Same neighbor traversal as GRID-05; companion pairs from existing `companions` table |
</phase_requirements>

## Standard Stack

No new dependencies required. Everything needed is already in the project.

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| express | ^5.1.0 | Route handlers for garden CRUD | Already in deno.json; matches existing route pattern |
| node:sqlite DatabaseSync | built-in Deno 2 | Garden and cell persistence | Same pattern as plantDb.ts and userDb.ts |
| MUI Box/Paper/Dialog | 7.1 | Grid cell rendering, plant picker | Already in project; avoids introducing new deps |
| axios | 1.9 | API calls from UI service layer | Already installed; matches authService.js pattern |
| React Router DOM | 7.6 | `/garden` route | Already configured in App.jsx |

### No New Dependencies Needed
The full stack (Deno 2, Express 5, MUI 7, React 19, axios, node:sqlite) covers all requirements. The grid is a pure CSS/MUI layout — no grid library needed. The companion/antagonist logic is pure client-side JavaScript — no graph library needed.

## Architecture Patterns

### Recommended File Additions

```
server/
  databases/
    gardenDb.ts         # garden + garden_cells schema, getDatabase() singleton — separate from plantDb
  repositories/
    gardenRepository.ts # class GardenRepository with CRUD for gardens and cells
  controllers/
    gardenController.ts # exported async functions; thin wrappers over repository
  routes/
    gardenRoutes.ts     # Router; all routes protected by authMiddleware
  types/
    garden.d.ts         # Garden, GardenCell types

ui/src/
  pages/
    Garden.jsx          # page component: garden list + active grid
  components/
    GardenGrid.jsx      # renders the NxM grid of cells
    GardenCell.jsx      # single cell with color and click handler
    PlantPickerDialog.jsx  # MUI Dialog with plant list for cell assignment
  services/
    gardenService.js    # axios calls for all garden API endpoints
```

### Pattern 1: Sparse Cell Storage

Store only occupied cells. The grid dimensions live on the garden record.

```sql
-- gardens table
CREATE TABLE IF NOT EXISTS gardens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  rows INTEGER NOT NULL,
  cols INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- garden_cells table
CREATE TABLE IF NOT EXISTS garden_cells (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  garden_id INTEGER NOT NULL,
  row INTEGER NOT NULL,
  col INTEGER NOT NULL,
  plant_id INTEGER NOT NULL,
  FOREIGN KEY (garden_id) REFERENCES gardens(id) ON DELETE CASCADE,
  FOREIGN KEY (plant_id) REFERENCES plants(id),
  UNIQUE (garden_id, row, col)
);
```

The `UNIQUE (garden_id, row, col)` constraint enforces one plant per cell and enables upsert via `INSERT OR REPLACE`.

### Pattern 2: gardenDb.ts as Separate Singleton

Follow the established pattern — a dedicated `gardenDb.ts` with its own `getDatabase()` that opens the same `plants.db` file. Each database module is responsible for the CREATE TABLE statements of its own tables.

```typescript
// server/databases/gardenDb.ts — same file pattern as plantDb.ts and userDb.ts
import { DatabaseSync } from "node:sqlite";
import logger from "../utils/logger.ts";

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
    if (!dbInstance) {
        const db = new DatabaseSync("plants.db");
        db.exec("PRAGMA foreign_keys = ON;");
        db.exec(`CREATE TABLE IF NOT EXISTS gardens (...)`);
        db.exec(`CREATE TABLE IF NOT EXISTS garden_cells (...)`);
        logger.info("Garden database initialized.");
        dbInstance = db;
    }
    return dbInstance!;
}
```

**Warning:** The project has multiple `getDatabase()` singletons that each open the same `plants.db` file. SQLite allows multiple connections to the same file in WAL mode, but the default journal mode can cause locking under concurrent writes. For this single-user dev scenario it is fine, but be aware if that changes.

### Pattern 3: authMiddleware on All Garden Routes

All garden routes must pass through `authMiddleware` from `server/middleware/auth.ts`. The middleware attaches `req.user` (with `userId`). Use `req.user.userId` as the owner when creating or querying gardens.

```typescript
// server/routes/gardenRoutes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.ts";
import { getGardens, createGarden, getGardenById, upsertCell, clearCell } from "../controllers/gardenController.ts";

const gardenRouter = Router();
gardenRouter.use(authMiddleware);  // all routes below require auth

gardenRouter.get("/", async (req, res) => { ... });
gardenRouter.post("/", async (req, res) => { ... });
gardenRouter.get("/:id", async (req, res) => { ... });
gardenRouter.put("/:id/cells/:row/:col", async (req, res) => { ... });
gardenRouter.delete("/:id/cells/:row/:col", async (req, res) => { ... });

export default gardenRouter;
```

### Pattern 4: Client-Side Neighbor Relationship Computation

Do not make per-cell API calls to check companions/antagonists. Fetch once on garden load: all cells for the garden, plus the full companion and antagonist sets for every plant in the garden. Build a lookup object, then compute cell status in the render.

```javascript
// Build a Set of "companionKey" strings for O(1) lookup
// Companion pairs are stored with lower ID first — always normalize:
const companionSet = new Set();
const antagonistSet = new Set();

companions.forEach(({ plant_id, companion_id }) => {
  const key = `${Math.min(plant_id, companion_id)}-${Math.max(plant_id, companion_id)}`;
  companionSet.add(key);
});

function pairKey(a, b) {
  return `${Math.min(a, b)}-${Math.max(a, b)}`;
}

function getCellStatus(cellGrid, row, col, rows, cols) {
  const plantId = cellGrid[`${row},${col}`];
  if (!plantId) return 'empty';
  const neighbors = [
    [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]
  ].filter(([r, c]) => r >= 0 && c >= 0 && r < rows && c < cols);

  let hasCompanion = false;
  let hasAntagonist = false;
  for (const [r, c] of neighbors) {
    const neighborId = cellGrid[`${r},${c}`];
    if (!neighborId) continue;
    const key = pairKey(plantId, neighborId);
    if (antagonistSet.has(key)) hasAntagonist = true;
    if (companionSet.has(key)) hasCompanion = true;
  }
  if (hasAntagonist) return 'antagonist';
  if (hasCompanion) return 'companion';
  return 'neutral';
}
```

Cell background colors via MUI `sx`:
- `antagonist` → `background: 'error.dark'` (red)
- `companion` → `background: 'success.dark'` (green)
- `neutral` → default theme background

### Pattern 5: gardenService.js in ui/src/services/

Add a `gardenService.js` matching the existing `authService.js` pattern. All axios calls go here — not inline in components.

```javascript
// ui/src/services/gardenService.js
import axios from "axios";

export const getGardens = () =>
  axios.get("/api/gardens", { withCredentials: true });

export const createGarden = (name, rows, cols) =>
  axios.post("/api/gardens", { name, rows, cols }, { withCredentials: true });

export const getGarden = (id) =>
  axios.get(`/api/gardens/${id}`, { withCredentials: true });

export const upsertCell = (gardenId, row, col, plantId) =>
  axios.put(`/api/gardens/${gardenId}/cells/${row}/${col}`, { plantId }, { withCredentials: true });

export const clearCell = (gardenId, row, col) =>
  axios.delete(`/api/gardens/${gardenId}/cells/${row}/${col}`, { withCredentials: true });
```

### Pattern 6: Cell Grid Representation in React State

Convert the array of cell records from the API into a flat object keyed by `"row,col"` for O(1) lookup in render:

```javascript
// cells from API: [{row, col, plant_id, plant_name}, ...]
const cellGrid = {};
cells.forEach(cell => {
  cellGrid[`${cell.row},${cell.col}`] = cell;
});
```

Iterate `Array.from({ length: rows })` and `Array.from({ length: cols })` to render every grid position, looking up `cellGrid[`${r},${c}`]` for each.

### Pattern 7: Garden Owner Enforcement

The repository must enforce that the requesting user owns the garden before returning data or accepting mutations. Never trust the garden ID alone.

```typescript
// repository pattern — always include user_id in WHERE
async getGardenById(gardenId: number, userId: number): Promise<Garden | null> {
    const db = getDatabase();
    const row = db.prepare(
        "SELECT id, name, rows, cols FROM gardens WHERE id = ? AND user_id = ?"
    ).get(gardenId, userId) as any;
    return row ? { id: row.id, name: row.name, rows: row.rows, cols: row.cols } : null;
}
```

If the garden doesn't belong to the requesting user, return null and the controller responds 404 (not 403 — avoid leaking existence of other users' gardens).

### Anti-Patterns to Avoid

- **Storing the grid as JSON on the gardens table:** Tempting but makes querying individual cells, updating single cells, and joining with plant data expensive. Use the sparse cell table.
- **Fetching companion/antagonist data per cell:** N+1 query problem. Fetch all relationship data for plants present in the garden in a single query.
- **Trusting user-supplied garden IDs without owner check:** Always join with `user_id` in the WHERE clause.
- **Rendering a fixed-size grid:** Grid size comes from `garden.rows` and `garden.cols` — always derive from the record.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Symmetric pair lookup | Custom de-duplication logic | Normalize key as `min-max` string, store in a Set | Companion/antagonist pairs stored with lower ID first — key normalization is one line |
| Cell upsert | SELECT then INSERT/UPDATE | `INSERT OR REPLACE INTO garden_cells` with `UNIQUE(garden_id, row, col)` | SQLite handles the conflict atomically |
| Auth check on every route handler | Inline token verification | `authMiddleware` already exists at `server/middleware/auth.ts` | Router-level `.use(authMiddleware)` covers all routes at once |
| Grid rendering library | Any third-party grid | CSS Grid via MUI `Box` with `display: 'grid'` and `gridTemplateColumns` | No added dep; MUI `sx` handles all visual states |

**Key insight:** The companion/antagonist data model is already normalized correctly. The neighbor-highlighting feature is purely client-side math — no new server endpoints needed for it.

## Common Pitfalls

### Pitfall 1: Multiple DatabaseSync Singletons Opening the Same File

**What goes wrong:** `gardenDb.ts`, `plantDb.ts`, and `userDb.ts` each open `plants.db` as separate singletons. In default SQLite journal mode, concurrent writes from two open connections can produce "database is locked" errors.

**Why it happens:** The pattern was established in Phase 1 for a single DB module; adding more modules multiplies connections to the same file.

**How to avoid:** For Phase 3, follow the same pattern — it works in development because Deno's single-threaded event loop means writes don't actually overlap. If this becomes a problem later, consolidate all schema initialization into one `db.ts` singleton.

**Warning signs:** `SqliteError: database is locked` in server logs during rapid cell save operations.

### Pitfall 2: Companion/Antagonist Lookup Direction

**What goes wrong:** The companions and antagonists tables store pairs with the lower plant ID as `plant_id`. If you only query `WHERE plant_id = ?`, you miss all pairs where the plant is the higher-ID partner.

**Why it happens:** The seed script enforces the lower-ID-first invariant, but client code may forget about it.

**How to avoid:** Always query both directions: `WHERE plant_id = ? OR companion_id = ?`. In the client-side Set, always normalize the pair key using `Math.min/Math.max`.

**Warning signs:** Grid shows no companion/antagonist highlights even though known companion pairs are present in the garden.

### Pitfall 3: Garden ID Not Validated Against User Ownership

**What goes wrong:** A logged-in user can read or modify another user's garden by supplying a valid garden ID they don't own.

**Why it happens:** Route handler validates garden exists but not that the requesting user owns it.

**How to avoid:** Always include `AND user_id = ?` in garden queries. Return 404 (not 403) when the garden isn't found for that user.

### Pitfall 4: Dashboard Needs Garden Entry Point

**What goes wrong:** There's no navigation to the garden builder. After creating the route and page, users have no way to reach it.

**Why it happens:** App.jsx routes and Header navigation must both be updated.

**How to avoid:** Add `/garden` to `App.jsx` routes AND add a navigation link to `Header.jsx` (or add a "My Gardens" button to Dashboard).

### Pitfall 5: Plant Picker Shows All 20+ Plants Without Filtering

**What goes wrong:** A flat list of 20+ plants in a Dialog is usable but awkward.

**Why it happens:** No category filtering on the picker by default.

**How to avoid:** The requirements don't mandate filtering (that's v2 scope), but at minimum display `plant.name` and `plant.category` so users can identify plants. Keep the picker simple for v1.

### Pitfall 6: `rows` and `cols` Naming Collision with MUI Grid

**What goes wrong:** The MUI `<Grid>` component uses an `item` / `container` prop model and the term "rows" and "cols" don't map directly to it.

**Why it happens:** MUI's `Grid` component is a responsive layout grid (12-column system), not a data grid.

**How to avoid:** Do not use MUI `<Grid>` for the garden grid. Use a plain `<Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}>` with child `<Box>` cells. MUI's CSS Grid `sx` support is straightforward and avoids confusion with the existing `PlantGrid.jsx` component.

## Code Examples

### GET /api/gardens — fetch authenticated user's gardens

```typescript
// server/routes/gardenRoutes.ts
gardenRouter.get("/", async (req, res) => {
    const userId = req.user!.userId;
    const gardens = await getGardens(userId);
    res.status(200).json(gardens);
});
```

### PUT /api/gardens/:id/cells/:row/:col — upsert a cell

```typescript
gardenRouter.put("/:id/cells/:row/:col", async (req, res) => {
    const gardenId = Number(req.params.id);
    const row = Number(req.params.row);
    const col = Number(req.params.col);
    const { plantId } = req.body;
    const userId = req.user!.userId;

    if (isNaN(gardenId) || isNaN(row) || isNaN(col) || !plantId) {
        res.status(400).json({ message: "Invalid cell parameters" });
        return;
    }

    const garden = await getGardenById(gardenId, userId);
    if (!garden) {
        res.status(404).json({ message: "Garden not found" });
        return;
    }

    await upsertCell(gardenId, row, col, plantId);
    res.status(200).json({ message: "Cell saved" });
});
```

### SQLite upsert pattern for garden cells

```typescript
// server/repositories/gardenRepository.ts
async upsertCell(gardenId: number, row: number, col: number, plantId: number): Promise<void> {
    const db = getDatabase();
    db.prepare(
        "INSERT OR REPLACE INTO garden_cells (garden_id, row, col, plant_id) VALUES (?, ?, ?, ?)"
    ).run(gardenId, row, col, plantId);
}
```

### GardenGrid component structure

```jsx
// ui/src/components/GardenGrid.jsx
export default function GardenGrid({ garden, cells, companions, antagonists, onCellClick }) {
    const cellGrid = {};
    cells.forEach(c => { cellGrid[`${c.row},${c.col}`] = c; });

    const companionSet = buildRelationshipSet(companions);
    const antagonistSet = buildRelationshipSet(antagonists);

    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${garden.cols}, 60px)`,
            gap: 0.5
        }}>
            {Array.from({ length: garden.rows }, (_, r) =>
                Array.from({ length: garden.cols }, (_, c) => {
                    const cell = cellGrid[`${r},${c}`];
                    const status = getCellStatus(cellGrid, r, c, garden.rows, garden.cols, companionSet, antagonistSet);
                    return (
                        <GardenCell
                            key={`${r}-${c}`}
                            cell={cell}
                            status={status}
                            onClick={() => onCellClick(r, c, cell)}
                        />
                    );
                })
            ).flat()}
        </Box>
    );
}
```

### Garden route registration in index.ts

```typescript
// server/index.ts addition
import gardenRouter from "./routes/gardenRoutes.ts";
app.use("/api/gardens", gardenRouter);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Storing grid as JSON blob | Sparse cell table with UNIQUE constraint | Phase 3 design | Enables per-cell updates and relationship queries without full serialization |
| Per-cell relationship API calls | Batch fetch + client-side computation | Phase 3 design | Single load; no per-click latency |

## Open Questions

1. **Clear cell vs. remove plant — should clearing be a DELETE or a PUT with null plantId?**
   - What we know: SQLite's `INSERT OR REPLACE` doesn't handle null (would insert a null plant_id row). DELETE is cleaner.
   - What's unclear: Whether the UI needs an explicit "remove plant from cell" action (a second click on an occupied cell? A right-click context menu?).
   - Recommendation: Use `DELETE /api/gardens/:id/cells/:row/:col` for removal. In the UI, clicking an occupied cell opens the picker with a "Remove plant" option.

2. **Where does the garden builder live in navigation — new route or replace Dashboard?**
   - What we know: Dashboard currently shows only the user's name. It's a placeholder.
   - What's unclear: Whether Dashboard becomes the garden list, or `/garden` is a separate page.
   - Recommendation: Add `/garden` as a new route and add a "My Gardens" button on Dashboard. Keeps Dashboard as an entry point hub and avoids reworking it.

3. **Should `GET /api/gardens/:id` include cells and relationship data, or separate endpoints?**
   - What we know: The client needs the garden metadata, all cells, and all companion/antagonist pairs for plants in those cells.
   - Recommendation: Two endpoints — `GET /api/gardens/:id` returns `{ garden, cells }`, and the client uses the existing `GET /api/plants` (already fetches all plants) to get relationship data. Avoids a fat endpoint but requires two requests on load. Alternatively, one `GET /api/gardens/:id/full` endpoint returns everything. Either is fine; two simpler endpoints are more consistent with existing patterns.

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `server/databases/plantDb.ts`, `userDb.ts` — established singleton pattern
- Codebase inspection: `server/repositories/plantRepository.ts` — established repository class pattern
- Codebase inspection: `server/middleware/auth.ts` — authMiddleware API (`req.user.userId`)
- Codebase inspection: `server/routes/plantRoutes.ts` — established route pattern
- Codebase inspection: `ui/src/services/authService.js` — established service layer pattern
- Codebase inspection: `ui/src/pages/Dashboard.jsx` — 401 redirect pattern
- SQLite documentation: `INSERT OR REPLACE` / `UNIQUE` constraint behavior — standard SQLite feature

### Secondary (MEDIUM confidence)
- MUI documentation: `Box` with `sx={{ display: 'grid', gridTemplateColumns }}` — CSS Grid layout via MUI sx prop is a documented and standard MUI pattern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; all existing tools apply directly
- Architecture: HIGH — directly extends established patterns from Phases 1 and 2
- Pitfalls: HIGH — all pitfalls identified from direct codebase inspection of the existing data model

**Research date:** 2026-03-22
**Valid until:** Stable — no external dependencies added; valid until project stack changes

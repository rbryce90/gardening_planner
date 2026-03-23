# Phase 4: Seasonal Planting - Research

**Researched:** 2026-03-22
**Domain:** Express/SQLite zone management + React/MUI calendar UI
**Confidence:** HIGH

## Summary

Phase 4 adds two features: zone selection on the user profile and a monthly planting calendar. All necessary data already exists — the zones table has 13 USDA zones seeded, and planting_seasons has ~45 records linking plant types to zones with start/end months and method. The data layer is ready; the work is plumbing new Express routes/controllers/repository and building the UI.

The primary database change is adding a `zone_id` column to the users table. This is an ALTER TABLE migration, not a schema-from-scratch. The users table is managed in `userDb.ts` which creates the schema on startup; the ALTER needs to run conditionally (only if the column doesn't already exist) to keep the singleton pattern idempotent.

The old zone code (zoneRoutes.ts, zoneRepository.ts, zoneController.ts, zoneModels.ts) is Deno/Oak — it imports from `https://deno.land/x/oak/mod.ts` and `https://deno.land/std/` — entirely unusable in the current Node/Express project. Every file in that group must be deleted and rewritten from scratch following the gardenRepository/gardenController/gardenRoutes pattern.

**Primary recommendation:** Follow the gardenRepository pattern exactly. Rewrite zone layer, add zone_id to users table, then build the planting calendar page with MUI tabs for months.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Zone selection is a dropdown on the user's dashboard/profile, not a separate settings page
- **D-02:** Zone is stored as a column on the users table (zone_id INTEGER, FK to zones)
- **D-03:** Dropdown shows all USDA hardiness zones from the zones table (already seeded)
- **D-04:** Zone selection persists immediately on change (no separate save button)
- **D-05:** Monthly planting view is a grid/table — months as columns (or tabs), plant types as rows
- **D-06:** Show ALL plants in the system filtered by the user's selected zone, not just plants in their gardens
- **D-07:** Each cell shows the planting method (e.g., "direct sow", "start indoors") and any notes from planting_seasons data
- **D-08:** Highlight the current month for quick reference
- **D-09:** Rewrite zone routes/repository/controller from scratch for Express (old Deno/Oak code is unusable)
- **D-10:** GET /api/zones returns all zones (public, no auth needed — used for dropdown)
- **D-11:** PUT /api/auth/zone with { zoneId } updates the authenticated user's zone preference
- **D-12:** GET /api/planting-calendar/:zoneId returns all planting_seasons for a zone, joined with plant_type and plant names
- **D-13:** "Planting Calendar" link in header when authenticated, same pattern as "My Gardens"
- **D-14:** Route: /calendar

### Claude's Discretion

- Exact table/grid layout and styling
- How to handle users who haven't selected a zone yet (prompt or default view)
- Month tab vs scrollable table approach
- Mobile responsiveness approach

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEAS-01 | User can select their USDA hardiness zone from a dropdown | Zone data already seeded. Need: zone_id on users table (ALTER TABLE), GET /api/zones endpoint, PUT /api/auth/zone endpoint, zone dropdown in Dashboard.jsx. authService.js needs getZones() and updateZone() methods |
| SEAS-02 | User can view what to plant by month based on their zone | planting_seasons data already seeded. Need: GET /api/planting-calendar/:zoneId endpoint with JOIN query, Calendar.jsx page at /calendar route, Header.jsx nav link, App.jsx route registration |
</phase_requirements>

## Standard Stack

### Core (all already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| node:sqlite (DatabaseSync) | built-in Node | SQLite queries (synchronous) | Already used in plantDb.ts, gardenDb.ts, userDb.ts |
| express Router | 5.1 | Route definitions | All other routes use this pattern |
| MUI (Tabs, Tab, Table, Select) | 7.1 | UI components | Dark theme established, already used everywhere |
| axios | 1.9 | API calls from UI | All service files use axios |

### No new dependencies required

This phase introduces no new packages. All needed libraries are already installed.

## Architecture Patterns

### Recommended Project Structure (additions only)

```
server/
  routes/
    zoneRoutes.ts         # NEW (replaces Deno version): GET /api/zones, GET /api/planting-calendar/:zoneId
  controllers/
    zoneController.ts     # NEW (replaces Deno version): getZones(), getPlantingCalendar()
  repositories/
    zoneRepository.ts     # NEW (replaces Deno version): ZoneRepository class
  types/
    zone.d.ts             # NEW: Zone, PlantingSeason types
  databases/
    userDb.ts             # MODIFY: add zone_id column migration

ui/src/
  pages/
    Calendar.jsx          # NEW: planting calendar page
  services/
    zoneService.js        # NEW: getZones(), getPlantingCalendar(zoneId), updateUserZone(zoneId)
  components/
    Header.jsx            # MODIFY: add Planting Calendar nav link
  pages/
    Dashboard.jsx         # MODIFY: add zone dropdown with immediate-persist behavior
  App.jsx                 # MODIFY: register /calendar route
```

### Pattern 1: Zone Repository (mirrors GardenRepository)

Follow gardenRepository.ts exactly: class with async methods, `getDatabase()` from plantDb (not userDb — zones table lives in plantDb), snake_case → camelCase mapping.

```typescript
// mirrors: server/repositories/gardenRepository.ts
import { getDatabase } from "../databases/plantDb.ts";
import { Zone, PlantingSeason } from "../types/zone.d.ts";

export class ZoneRepository {
    async getZones(): Promise<Zone[]> {
        const db = getDatabase();
        const rows = db.prepare(
            "SELECT id, name, min_temperature, max_temperature FROM zones ORDER BY id"
        ).all() as any[];
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            minTemperature: row.min_temperature,
            maxTemperature: row.max_temperature,
        }));
    }

    async getPlantingCalendar(zoneId: number): Promise<PlantingSeason[]> {
        const db = getDatabase();
        const rows = db.prepare(`
            SELECT
                ps.id,
                ps.start_month,
                ps.end_month,
                ps.method,
                ps.notes,
                pt.name as plant_type_name,
                p.name as plant_name
            FROM planting_seasons ps
            JOIN plant_types pt ON ps.plant_type_id = pt.id
            JOIN plants p ON pt.plant_id = p.id
            WHERE ps.zone_id = ?
            ORDER BY p.name, pt.name
        `).all(zoneId) as any[];
        return rows.map(row => ({
            id: row.id,
            startMonth: row.start_month,
            endMonth: row.end_month,
            method: row.method,
            notes: row.notes,
            plantTypeName: row.plant_type_name,
            plantName: row.plant_name,
        }));
    }
}

export const zoneRepository = new ZoneRepository();
```

### Pattern 2: Update User Zone (in UserRepository)

Add a new method to the existing UserRepository — do not create a new repository for this.

```typescript
// add to: server/repositories/userRepository.ts
async updateZone(userId: number, zoneId: number): Promise<void> {
    const db = getDatabase();
    db.prepare("UPDATE users SET zone_id = ? WHERE id = ?").run(zoneId, userId);
}

async findById(id: number): Promise<Omit<User, "password" | "createdAt"> | null> {
    const db = getDatabase();
    const result = db.prepare(
        "SELECT id, email, first_name as firstName, last_name as lastName, zone_id as zoneId FROM users WHERE id = ?"
    ).get(id) as Omit<User, "password" | "createdAt"> | undefined;
    return result ?? null;
}
```

### Pattern 3: users table migration (ALTER TABLE)

The users table is created in userDb.ts without a zone_id column. Adding it requires a conditional ALTER TABLE that runs once. The safest Node/SQLite pattern is try/catch — attempt the ALTER and swallow the "duplicate column" error:

```typescript
// in userDb.ts initializeDatabase(), after the CREATE TABLE block:
try {
    db.exec("ALTER TABLE users ADD COLUMN zone_id INTEGER REFERENCES zones(id)");
} catch {
    // column already exists — safe to ignore
}
```

This is idempotent: first run adds the column, every subsequent run catches the error and continues. This is the standard pattern for incremental schema migrations when not using a migration library.

### Pattern 4: PUT /api/auth/zone route

The zone update belongs on the auth router (per D-11). It follows the same authMiddleware pattern as GET /me:

```typescript
// in server/routes/authRoutes.ts (add to existing file)
authRouter.put("/zone", authMiddleware, async (req, res, next) => {
    const { zoneId } = req.body;
    if (typeof zoneId !== "number") {
        res.status(400).json({ message: "zoneId is required and must be a number" });
        return;
    }
    try {
        await userRepository.updateZone(req.user!.userId, zoneId);
        res.status(200).json({ message: "Zone updated" });
    } catch (err) {
        next(err);
    }
});
```

### Pattern 5: Frontend zone service

New service file follows gardenService.js style — named exports, axios, withCredentials for auth endpoints:

```javascript
// ui/src/services/zoneService.js
import axios from "axios";

export const getZones = () =>
  axios.get("/api/zones");

export const updateUserZone = (zoneId) =>
  axios.put("/api/auth/zone", { zoneId }, { withCredentials: true });

export const getPlantingCalendar = (zoneId) =>
  axios.get(`/api/planting-calendar/${zoneId}`, { withCredentials: true });
```

### Pattern 6: Planting Calendar UI layout

The calendar data has start_month and end_month as text (e.g., "April", "June"). The UI must derive which months a plant type is active by expanding the range. Render as MUI Tabs (one tab per month) with a Table beneath showing plant name, type, method, and notes for that month. Highlight the current month tab using `new Date().toLocaleString('default', { month: 'long' })`.

### Anti-Patterns to Avoid

- **Do not reuse old Deno zone files:** zoneRoutes.ts, zoneRepository.ts, zoneController.ts all import Deno-specific modules. Edit/save will break the TypeScript build. Delete them.
- **Do not use userDb for zones:** The zones and planting_seasons tables live in plantDb.ts (plants.db). The garden and user DBs also open plants.db but import from separate db files. Zone repository must import from `../databases/plantDb.ts`.
- **Do not add zone_id to plantDb users CREATE TABLE:** The users table is defined in userDb.ts. Use ALTER TABLE in userDb.ts, not in plantDb.ts.
- **Do not store month as a number without mapping:** The planting_seasons data stores months as text strings ("January"..."December"). Any month-comparison logic must use the same text representation or a mapping array.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Month range expansion | Custom month-range parser | Simple MONTHS array + indexOf() | 12-element constant is sufficient; no library needed |
| Zone dropdown options | Hardcoded zone list | Fetch from GET /api/zones | Zones are in DB already; dropdown should be data-driven |
| Auth guard on calendar page | PrivateRoute wrapper | Component-level 401 check (same as Dashboard) | Established project pattern — redirect to /login on 401 from getMe() |

**Key insight:** The data layer is complete. All complexity is in wiring the Express layer correctly and rendering the calendar month-by-month in the UI.

## Common Pitfalls

### Pitfall 1: Wrong database import in ZoneRepository
**What goes wrong:** Importing from `../databases/userDb.ts` or `../databases/gardenDb.ts` instead of `../databases/plantDb.ts`. The zones table is only in plantDb.
**Why it happens:** There are three database files, all opening the same `plants.db` file. It's easy to reach for userDb since zones relate to users.
**How to avoid:** Zones are defined and seeded in plantDb.ts. ZoneRepository must import from plantDb.
**Warning signs:** TypeScript compiles but queries return empty results or "no such table: zones" at runtime.

### Pitfall 2: ALTER TABLE failing on repeated server restarts
**What goes wrong:** ALTER TABLE throws "duplicate column name: zone_id" on second startup, crashing the server.
**Why it happens:** The initializeDatabase() function runs on every startup.
**How to avoid:** Wrap the ALTER TABLE in a try/catch block (Pattern 3 above). The error is expected and safe to swallow.
**Warning signs:** Server crashes on restart with SQLite constraint error.

### Pitfall 3: Month range logic off-by-one or string mismatch
**What goes wrong:** A plant type with start_month "April" end_month "June" doesn't appear in the June tab.
**Why it happens:** Off-by-one in indexOf() comparisons, or months stored as abbreviated strings vs. full names.
**How to avoid:** Use a single MONTHS constant `['January','February',...,'December']` everywhere. Use `monthIndex >= startIndex && monthIndex <= endIndex` (inclusive on both ends).
**Warning signs:** Some months show no plants despite planting_seasons data existing for that zone.

### Pitfall 4: GET /api/auth/me returning user without zoneId
**What goes wrong:** Dashboard loads user from getMe() but zone dropdown can't pre-select the user's zone because zoneId is missing from the response.
**Why it happens:** The findById query in userRepository.ts doesn't select zone_id.
**How to avoid:** Update the SELECT in findById to include `zone_id as zoneId`. Update the User type to include `zoneId?: number`. Update the /me route to include zoneId in the response JSON.
**Warning signs:** Zone dropdown always defaults to unselected even after the user has set a zone.

### Pitfall 5: Dead Deno files still imported by TypeScript
**What goes wrong:** TypeScript build fails because old Deno files still exist and are referenced, or newly written files accidentally import the old ones.
**Why it happens:** The old files share the same names as the new files to be created.
**How to avoid:** Delete old files first (zoneRoutes.ts, zoneRepository.ts, zoneController.ts, zoneModels.ts) before creating replacements. Confirm server/index.ts does not import the old zoneRouter (it currently doesn't).
**Warning signs:** Build errors referencing `deno.land` import URLs.

## Code Examples

### Month expansion for calendar filtering

```javascript
// ui/src/pages/Calendar.jsx
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function getActiveEntries(calendarData, month) {
  const monthIndex = MONTHS.indexOf(month);
  return calendarData.filter(entry => {
    const start = MONTHS.indexOf(entry.startMonth);
    const end = MONTHS.indexOf(entry.endMonth);
    return monthIndex >= start && monthIndex <= end;
  });
}
```

### Immediate-persist zone dropdown in Dashboard

```jsx
// ui/src/pages/Dashboard.jsx (relevant addition)
const handleZoneChange = async (event) => {
  const newZoneId = event.target.value;
  setSelectedZone(newZoneId);
  try {
    await updateUserZone(newZoneId);
  } catch (err) {
    setError("Failed to save zone preference");
  }
};
```

### /api/zones route (public, no auth)

```typescript
// server/routes/zoneRoutes.ts
import { Router } from "express";
import { getZones } from "../controllers/zoneController.ts";

const zoneRouter = Router();

zoneRouter.get("/", async (_req, res, next) => {
    try {
        const zones = await getZones();
        res.status(200).json(zones);
    } catch (err) {
        next(err);
    }
});

export default zoneRouter;
```

### /api/planting-calendar/:zoneId route

```typescript
// add to server/routes/zoneRoutes.ts or separate calendarRoutes.ts
zoneRouter.get("/planting-calendar/:zoneId", authMiddleware, async (req, res, next) => {
    const zoneId = parseInt(req.params.zoneId, 10);
    if (isNaN(zoneId)) {
        res.status(400).json({ message: "Invalid zone ID" });
        return;
    }
    try {
        const calendar = await getPlantingCalendar(zoneId);
        res.status(200).json(calendar);
    } catch (err) {
        next(err);
    }
});
```

Note: D-12 specifies `GET /api/planting-calendar/:zoneId`. This can be mounted at `/api/zones` as a sub-path or as a separate router at `/api/planting-calendar`. Mounting it on zoneRouter keeps zone-related routes together; a separate mount in index.ts is cleaner. Either works — recommend mounting at `/api/planting-calendar` in index.ts for clarity.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Deno/Oak zone files | Node/Express zone files | Phase 1 migration | Old files must be deleted; they share names with new files |
| No zone on user | zone_id FK on users table | This phase | Requires ALTER TABLE migration |

**Dead code that must be deleted:**
- `server/routes/zoneRoutes.ts` — Deno/Oak, imports `https://deno.land/x/oak/mod.ts`
- `server/repositories/zoneRepository.ts` — Deno, imports `https://deno.land/std/uuid/mod.ts` and uses `db.query()` (Deno sqlite API)
- `server/controllers/zoneController.ts` — Deno, imports from `"../models/zoneModels"` (no .ts extension, also references old ZoneRepository)
- `server/models/zoneModels.ts` — Deno-era type, id typed as `string` (Deno used UUID strings; Node uses INTEGER)
- `server/models/plantModels.ts` — inspect before deleting; may still be referenced

## Open Questions

1. **Route mount point for planting-calendar**
   - What we know: D-12 specifies `GET /api/planting-calendar/:zoneId`
   - What's unclear: Whether this lives on zoneRouter (mounted at /api/zones) or a separate router at /api/planting-calendar
   - Recommendation: Separate router mounted at `/api/planting-calendar` in index.ts matches the decision URL exactly and keeps zone listing (public) separate from calendar (auth-required)

2. **plantModels.ts — dead or live?**
   - What we know: It's in server/models/ alongside dead Deno files
   - What's unclear: Whether any active code imports it
   - Recommendation: Grep for imports before deleting; if nothing imports it, delete it with the others

3. **No-zone-selected state in Calendar page**
   - What we know: Left to Claude's discretion
   - What's unclear: Whether to show all zones, prompt to select, or redirect to dashboard
   - Recommendation: If user has no zone set, render a prompt ("Select your zone on the dashboard to view your planting calendar") with a link to /dashboard. This is the least surprising behavior.

## Environment Availability

Step 2.6: SKIPPED — This phase is entirely code/config changes within the existing Node/Express/React project. No new external tools, services, CLIs, runtimes, or databases are required beyond what is already in use.

## Sources

### Primary (HIGH confidence)
- Direct inspection of `/home/bryce/dev/personal/gardening_planner/server/databases/plantDb.ts` — confirmed zones and planting_seasons table schema
- Direct inspection of `/home/bryce/dev/personal/gardening_planner/server/databases/userDb.ts` — confirmed users table missing zone_id column
- Direct inspection of `/home/bryce/dev/personal/gardening_planner/server/scripts/seed-data.json` — confirmed 13 zones seeded and ~45 planting_seasons records
- Direct inspection of `/home/bryce/dev/personal/gardening_planner/server/repositories/zoneRepository.ts` — confirmed Deno API (`db.query()`, `https://deno.land/std/uuid/mod.ts`)
- Direct inspection of `/home/bryce/dev/personal/gardening_planner/server/repositories/gardenRepository.ts` — confirmed correct Node/Express pattern to replicate
- Direct inspection of `/home/bryce/dev/personal/gardening_planner/server/routes/zoneRoutes.ts` — confirmed Oak import (`https://deno.land/x/oak/mod.ts`)
- Direct inspection of `/home/bryce/dev/personal/gardening_planner/ui/src/pages/Dashboard.jsx` — confirmed zone dropdown integration point
- Direct inspection of `/home/bryce/dev/personal/gardening_planner/ui/src/components/Header.jsx` — confirmed nav link pattern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed, patterns fully inspectable in existing code
- Architecture: HIGH — exact patterns are present in gardenRepository/gardenController/gardenRoutes; zone layer is a direct parallel
- Pitfalls: HIGH — database file confusion and ALTER TABLE issues are directly observable from codebase inspection; month text format confirmed from seed data

**Research date:** 2026-03-22
**Valid until:** 2026-06-22 (stable project with no external dependencies changing)

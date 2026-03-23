# Phase 4: Seasonal Planting - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can select their USDA hardiness zone and view a monthly planting calendar for their zone. Zone preference is persisted on the user profile. Calendar shows which plants to start by month based on seed data already in the database.

</domain>

<decisions>
## Implementation Decisions

### Zone selection
- **D-01:** Zone selection is a dropdown on the user's dashboard/profile, not a separate settings page
- **D-02:** Zone is stored as a column on the users table (zone_id INTEGER, FK to zones)
- **D-03:** Dropdown shows all USDA hardiness zones from the zones table (already seeded)
- **D-04:** Zone selection persists immediately on change (no separate save button)

### Calendar display
- **D-05:** Monthly planting view is a grid/table — months as columns (or tabs), plant types as rows
- **D-06:** Show ALL plants in the system filtered by the user's selected zone, not just plants in their gardens
- **D-07:** Each cell shows the planting method (e.g., "direct sow", "start indoors") and any notes from planting_seasons data
- **D-08:** Highlight the current month for quick reference

### Backend API
- **D-09:** Rewrite zone routes/repository/controller from scratch for Express (old Deno/Oak code is unusable)
- **D-10:** GET /api/zones returns all zones (public, no auth needed — used for dropdown)
- **D-11:** PUT /api/auth/zone with { zoneId } updates the authenticated user's zone preference
- **D-12:** GET /api/planting-calendar/:zoneId returns all planting_seasons for a zone, joined with plant_type and plant names

### Navigation
- **D-13:** "Planting Calendar" link in header when authenticated, same pattern as "My Gardens"
- **D-14:** Route: /calendar

### Claude's Discretion
- Exact table/grid layout and styling
- How to handle users who haven't selected a zone yet (prompt or default view)
- Month tab vs scrollable table approach
- Mobile responsiveness approach

</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements fully captured in decisions above and in:

### Requirements
- `.planning/REQUIREMENTS.md` — SEAS-01 (zone selection), SEAS-02 (monthly planting view)

### Seed data
- `server/scripts/seed-data.json` — Contains zones array and planting_seasons array with plant_type_name, zone_name, start_month, end_month, method, notes

### Database schema
- `server/databases/plantDb.ts` — zones table (id, name, min_temperature, max_temperature) and planting_seasons table (plant_type_id, zone_id, start_month, end_month, method, notes)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- zones and planting_seasons tables already exist with seeded data (Phase 1)
- Auth middleware pattern from gardenRoutes.ts for protected endpoints
- gardenService.js pattern for Axios service layer
- Header.jsx auth-aware navigation pattern (from Phase 3)
- Dashboard.jsx for zone dropdown integration point

### Established Patterns
- Database singleton pattern (gardenDb.ts, plantDb.ts, userDb.ts) — use plantDb since zones table is there
- Repository class with camelCase mapping from snake_case columns
- Thin controller wrappers over repository
- Express Router with authMiddleware
- Axios service with withCredentials for auth endpoints

### Integration Points
- users table needs zone_id column (ALTER TABLE or schema update in userDb.ts)
- server/index.ts for mounting new routes
- ui/src/App.jsx for /calendar route
- ui/src/components/Header.jsx for navigation link

### Dead Code to Remove
- server/routes/zoneRoutes.ts (old Deno/Oak — rewrite)
- server/repositories/zoneRepository.ts (old Deno — rewrite)
- server/controllers/zoneController.ts (old Deno — rewrite)
- server/models/zoneModels.ts (old Deno — replace with types)
- server/models/plantModels.ts (if also dead Deno code)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Calendar should be clear and functional, matching the existing MUI dark theme.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-seasonal-planting*
*Context gathered: 2026-03-22*

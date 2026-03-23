---
phase: 04-seasonal-planting
plan: 01
subsystem: api
tags: [express, sqlite, zones, planting-calendar, auth]

# Dependency graph
requires:
  - phase: 02-user-authentication
    provides: User type, userRepository, authMiddleware, authRoutes — needed to add zoneId field and PUT /zone endpoint
  - phase: 01-deno-migration-and-infrastructure
    provides: plantDb with zones and planting_seasons tables, Express server structure
provides:
  - GET /api/zones — public endpoint returning all USDA hardiness zones
  - GET /api/planting-calendar/:zoneId — auth-protected endpoint returning planting seasons joined with plant/type names
  - PUT /api/auth/zone — auth-protected endpoint to update user's zone selection
  - GET /api/auth/me now includes zoneId field
  - users table gains zone_id column via idempotent ALTER TABLE migration
affects:
  - 04-seasonal-planting plan 02 (frontend zone picker and planting calendar UI)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - ZoneRepository follows same getDatabase()/prepare()/all() pattern as GardenRepository
    - Named calendarRouter export from zoneRoutes.ts allows two routers in one file for related resources
    - Idempotent ALTER TABLE in try/catch for safe column migrations

key-files:
  created:
    - server/types/zone.d.ts
    - server/repositories/zoneRepository.ts
    - server/controllers/zoneController.ts
  modified:
    - server/routes/zoneRoutes.ts (full rewrite from Deno/Oak to Express)
    - server/databases/userDb.ts (zone_id migration)
    - server/repositories/userRepository.ts (findById + updateZone)
    - server/routes/authRoutes.ts (PUT /zone, /me zoneId)
    - server/index.ts (zone and calendar route mounting)
    - server/types/user.d.ts (zoneId field)

key-decisions:
  - "calendarRouter exported as named export from zoneRoutes.ts — keeps related routes co-located without a new file"
  - "GET /api/zones is public (no auth) — needed for zone picker on registration/profile page before login"
  - "zone_id ALTER TABLE in userDb.ts uses try/catch to be idempotent — safe to run on existing databases"

patterns-established:
  - "Two routers from one route file: default export for primary resource, named export for related sub-resource"
  - "Idempotent column migration: wrap ALTER TABLE in try/catch, ignore duplicate column error"

requirements-completed: [SEAS-01, SEAS-02]

# Metrics
duration: 3min
completed: 2026-03-23
---

# Phase 4 Plan 01: Seasonal Planting Backend Summary

**Zone listing, planting calendar, and user zone selection endpoints using Express + SQLite with zones/planting_seasons tables**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-23T04:21:16Z
- **Completed:** 2026-03-23T04:23:08Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Replaced dead Deno/Oak zoneRoutes.ts, zoneController.ts, zoneRepository.ts with Express equivalents
- Created Zone and PlantingSeason TypeScript types in server/types/zone.d.ts
- Built GET /api/zones (public) and GET /api/planting-calendar/:zoneId (auth-protected) endpoints
- Added PUT /api/auth/zone endpoint and updated GET /api/auth/me to include zoneId
- Deleted three dead Deno-era model files (server/models/zoneModels.ts, plantModels.ts, models.ts)

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete old Deno zone files and create zone types** - `3732229` (chore)
2. **Task 2: Create zone repository, controller, routes, and wire into server** - `7bbfd32` (feat)

## Files Created/Modified
- `server/types/zone.d.ts` - Zone and PlantingSeason type definitions (new)
- `server/types/user.d.ts` - Added zoneId?: number field
- `server/repositories/zoneRepository.ts` - Rewritten: getZones() and getPlantingCalendar() with SQL joins
- `server/controllers/zoneController.ts` - Rewritten: thin wrappers over zoneRepository
- `server/routes/zoneRoutes.ts` - Rewritten: Express Router for /api/zones and /api/planting-calendar
- `server/databases/userDb.ts` - Added idempotent zone_id column migration
- `server/repositories/userRepository.ts` - Updated findById to return zoneId, added updateZone method
- `server/routes/authRoutes.ts` - Added PUT /zone endpoint, zoneId in /me response
- `server/index.ts` - Mounted /api/zones and /api/planting-calendar routers
- Deleted: `server/models/zoneModels.ts`, `server/models/plantModels.ts`, `server/models/models.ts`

## Decisions Made
- `calendarRouter` exported as named export from zoneRoutes.ts — keeps related routes co-located
- GET /api/zones is public (no auth required) — needed for zone picker during/after registration
- zone_id ALTER TABLE wrapped in try/catch for idempotent migration on existing databases

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing bcryptjs type definition error in tsc output — unrelated to this plan, pre-existing issue.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All backend zone/planting-calendar endpoints are ready for frontend consumption
- Plan 02 (UI) can now fetch zones for picker, update user zone selection, and display planting calendar
- No blockers

---
*Phase: 04-seasonal-planting*
*Completed: 2026-03-23*

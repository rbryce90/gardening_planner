---
phase: 03-garden-builder
plan: 01
subsystem: backend-api
tags: [garden, crud, auth, sqlite, rest-api]
dependency_graph:
  requires: [02-user-authentication]
  provides: [garden-api, bulk-relationship-endpoints]
  affects: [server/index.ts, server/routes, server/controllers, server/repositories, server/databases]
tech_stack:
  added: []
  patterns: [ownership-enforced-queries, singleton-database, thin-controller]
key_files:
  created:
    - server/types/garden.d.ts
    - server/databases/gardenDb.ts
    - server/repositories/gardenRepository.ts
    - server/controllers/gardenController.ts
    - server/routes/gardenRoutes.ts
  modified:
    - server/index.ts
    - server/repositories/plantRepository.ts
    - server/controllers/plantController.ts
    - server/routes/plantRoutes.ts
decisions:
  - Separate gardenDb.ts opens same plants.db file — single database, foreign keys enforced at schema level
  - UNIQUE (garden_id, row, col) constraint enables INSERT OR REPLACE for upsert semantics
  - /companions and /antagonists registered before /:id in plantRoutes to prevent Express parameter shadowing
metrics:
  duration: 88s
  completed: "2026-03-23T03:57:35Z"
  tasks_completed: 2
  files_changed: 9
---

# Phase 03 Plan 01: Garden Builder Backend API Summary

Garden CRUD REST API with auth-enforced ownership and bulk plant relationship endpoints wired into the Express server.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Garden types, DB, repository, controller, routes, server wiring | 9cea955 | garden.d.ts, gardenDb.ts, gardenRepository.ts, gardenController.ts, gardenRoutes.ts, index.ts |
| 2 | Bulk companion and antagonist endpoints | f9f1d7d | plantRepository.ts, plantController.ts, plantRoutes.ts |

## What Was Built

### Garden API (`/api/gardens`)

All routes require an authenticated session (JWT cookie). Every query includes `user_id` in the WHERE clause — no cross-user access is possible.

- `GET /api/gardens` — list all gardens for the authenticated user
- `POST /api/gardens` — create a named garden with rows/cols validation (1-20)
- `GET /api/gardens/:id` — get garden metadata plus all placed cells (joined with plant names)
- `PUT /api/gardens/:id/cells/:row/:col` — upsert a plant into a cell (bounds-checked)
- `DELETE /api/gardens/:id/cells/:row/:col` — clear a single cell
- `DELETE /api/gardens/:id` — delete a garden (CASCADE removes all cells)

### Bulk Relationship Endpoints

- `GET /api/plants/companions` — all companion pairs as `[{ plantId, companionId }]`
- `GET /api/plants/antagonists` — all antagonist pairs as `[{ plantId, antagonistId }]`

These are public (no auth) and enable the frontend to load all relationship data once, then compute neighbor highlighting client-side without N+1 queries.

## Key Decisions

- **Single database file**: `gardenDb.ts` opens `plants.db` (same file as `plantDb.ts`) to keep the single-database architecture. Foreign key constraints to `users` and `plants` tables are enforced by `PRAGMA foreign_keys = ON`.
- **UNIQUE constraint on (garden_id, row, col)**: Enables `INSERT OR REPLACE` semantics for upsert — simpler than INSERT ... ON CONFLICT DO UPDATE.
- **Route ordering**: `/companions` and `/antagonists` registered before `/:id` in `plantRoutes.ts` to prevent Express from treating "companions" as an `:id` value.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

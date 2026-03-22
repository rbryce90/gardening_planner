# Roadmap: Gardening Planner

## Overview

Starting from a brownfield Express/React codebase with Deno migration debt, this roadmap migrates the server to latest Deno, establishes infrastructure, then layers in user accounts, the core grid-based garden builder with companion/antagonist indicators, and finally the seasonal planting calendar. Each phase delivers a complete, verifiable capability before the next begins.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Deno Migration and Infrastructure** - Migrate server to latest Deno, clean up debt, establish logging, error handling, and seed data
- [ ] **Phase 2: User Authentication** - Signup, login, JWT session persistence, and hardiness zone on user profile
- [ ] **Phase 3: Garden Builder** - Grid creation, plant placement, save/load, and visual companion/antagonist indicators
- [ ] **Phase 4: Seasonal Planting** - Zone-based monthly planting view

## Phase Details

### Phase 1: Deno Migration and Infrastructure
**Goal**: The server runs cleanly on latest Deno with structured logging, centralized error handling, and importable seed data
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, SEED-01, SEED-02
**Success Criteria** (what must be TRUE):
  1. Server starts and all existing plant/plant-type/companion/antagonist API endpoints respond correctly
  2. Any unhandled route error returns a structured JSON response with an appropriate HTTP status — no stack traces leak to the client
  3. Winston log entries appear in the console for server start and incoming requests — no console.log calls remain in server code
  4. Running the seed import script populates plants, types, companions, antagonists, zones, and planting seasons from a single JSON file without errors
  5. Re-running the seed import script completes without duplicate data errors
**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Deno migration, node:sqlite, Winston logger, centralized error handler
- [ ] 01-02-PLAN.md — Seed data JSON file and re-runnable import script

### Phase 2: User Authentication
**Goal**: Users can create accounts, log in, and stay authenticated across browser sessions
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02
**Success Criteria** (what must be TRUE):
  1. A new user can register with an email and password and is redirected to their dashboard
  2. A returning user can log in and remain logged in after closing and reopening the browser tab
  3. An unauthenticated request to a protected API route returns 401
**Plans**: TBD

### Phase 3: Garden Builder
**Goal**: Authenticated users can create named garden grids, place plants into cells, save their layouts, and see visual companion/antagonist feedback
**Depends on**: Phase 2
**Requirements**: GRID-01, GRID-02, GRID-03, GRID-04, GRID-05, GRID-06
**Success Criteria** (what must be TRUE):
  1. User can create a new named garden of any row/column size and see it appear in their garden list
  2. User can click a grid cell, select a plant from a picker, and see the plant name displayed in that cell
  3. User can save a garden layout and reload it in a later session with all placements intact
  4. A cell with a neighboring antagonist plant shows a red visual indicator; a cell with a neighboring companion shows a green indicator
  5. User can have multiple saved garden designs and switch between them
**Plans**: TBD

### Phase 4: Seasonal Planting
**Goal**: Users can select their USDA hardiness zone and see a monthly planting calendar for their zone
**Depends on**: Phase 2
**Requirements**: SEAS-01, SEAS-02
**Success Criteria** (what must be TRUE):
  1. User can select their USDA hardiness zone from a dropdown and have that preference saved
  2. User can view a planting calendar that shows which plants to start by month based on their selected zone
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Deno Migration and Infrastructure | 0/2 | Not started | - |
| 2. User Authentication | 0/TBD | Not started | - |
| 3. Garden Builder | 0/TBD | Not started | - |
| 4. Seasonal Planting | 0/TBD | Not started | - |

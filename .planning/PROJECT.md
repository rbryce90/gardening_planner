# Gardening Planner

## What This Is

A garden design tool where users create grid-based garden layouts, place plants into beds, and get visual feedback on companion/antagonist relationships. The app shows what to plant and when based on the user's USDA hardiness zone. Users sign up, save their garden designs, and manage plant data.

## Core Value

Users can visually design their garden on a grid and immediately see which plant placements work well together and which conflict — so they grow better gardens.

## Requirements

### Validated

- ✓ CRUD operations for plants (name, category, growth form, edible part, family) — existing
- ✓ Plant types/varieties with scientific name, description, planting notes — existing
- ✓ Companion and antagonist relationships between plants (symmetric, many-to-many) — existing
- ✓ Plant list and detail views in React UI with MUI dark theme — existing
- ✓ REST API for plants, plant types, companions, antagonists — existing

### Active

- [ ] User accounts (signup, login, session persistence)
- [ ] Grid-based garden builder — user creates grids of any size, representing beds or whole yards
- [ ] Place plants into grid cells and save the layout
- [ ] Visual conflict warnings — cells turn red when neighboring plants are antagonists
- [ ] Visual companion indicators — show when neighbors are beneficial pairings
- [ ] Seasonal planting view — show what to plant by month based on user's hardiness zone
- [ ] User selects their USDA hardiness zone (dropdown)
- [ ] Save and load multiple garden designs per user
- [ ] Seed data file for plants, types, companions, antagonists — importable and re-runnable

### Out of Scope

- Auto-detection of hardiness zone via location/GPS — user picks manually
- Stripe/payments — scaffolding exists but not part of current goals
- Mobile app — web only
- Drag-and-drop plant placement — click-to-place is sufficient for v1

## Context

- Brownfield project: Express 5 + TypeScript backend, React 19 + Vite + MUI 7 frontend
- SQLite database with schema for plants, plant_types, companions, antagonists, zones, planting_seasons
- Auth, user, zone, and Stripe routes are scaffolded but commented out
- Server follows Routes → Controllers → Repositories → Database layered architecture
- Frontend uses local React state, axios for API calls, React Router v7
- Mix of JSX and TSX files in the UI
- No test framework set up yet
- No centralized error handling — per-route try/catch currently

## Constraints

- **Database**: SQLite — local-first, no hosted database
- **Tech stack**: Build on existing Express/React/MUI stack — don't introduce new frameworks
- **Seed data**: Plant relationship data maintained in a file (JSON) that can be re-imported as needed

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Grid is flexible size | Users may model a single bed or a whole yard — don't constrain | — Pending |
| User-selected hardiness zone | Simpler than geo-detection; user knows their zone | — Pending |
| JSON for seed data | Structured, easy to parse, can represent nested relationships | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-22 after initialization*

---
phase: 03-garden-builder
plan: 02
subsystem: frontend-ui
tags: [garden, grid, companion, antagonist, react, mui]
dependency_graph:
  requires: [03-01]
  provides: [garden-builder-ui, garden-grid, companion-highlighting]
  affects: [ui/src/services, ui/src/pages, ui/src/components, ui/src/App.jsx]
tech_stack:
  added: []
  patterns: [service-layer, two-panel-layout, css-grid, min-max-pair-key]
key_files:
  created:
    - ui/src/services/gardenService.js
    - ui/src/pages/Garden.jsx
    - ui/src/components/GardenGrid.jsx
    - ui/src/components/GardenCell.jsx
    - ui/src/components/PlantPickerDialog.jsx
  modified:
    - ui/src/App.jsx
    - ui/src/components/Header.jsx
decisions:
  - antagonist-takes-priority: getCellStatus returns antagonist before checking companion — any red neighbor wins
  - css-grid-not-mui-grid: GardenGrid uses Box sx display:grid to avoid MUI Grid overhead for fixed-size cells
  - min-max-pair-key: companion and antagonist pairs normalized by Math.min/Math.max to match DB storage order
metrics:
  duration: 94s
  completed: "2026-03-23T04:01:41Z"
  tasks_completed: 3
  files_changed: 7
---

# Phase 03 Plan 02: Garden Builder Frontend UI Summary

Complete garden builder UI: service layer, two-panel Garden page with list/create sidebar and grid area, companion/antagonist color highlighting, plant picker dialog, and navigation wiring.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Garden service layer, Garden page, and all grid components | b8c2f67 | gardenService.js, Garden.jsx, GardenGrid.jsx, GardenCell.jsx, PlantPickerDialog.jsx |
| 2 | Route wiring and navigation | cdef521 | App.jsx, Header.jsx |
| 3 | Verify complete garden builder flow | auto-approved | (checkpoint) |

## What Was Built

### Garden Service (`ui/src/services/gardenService.js`)

Axios wrappers for all garden API endpoints, all using `withCredentials: true` for the auth cookie:
- `getGardens`, `createGarden`, `getGarden` — garden CRUD
- `upsertCell`, `clearCell` — cell management
- `deleteGarden` — garden deletion
- `getAllCompanions`, `getAllAntagonists` — public relationship endpoints (no credentials needed)

### Garden Page (`ui/src/pages/Garden.jsx`)

Two-panel layout:
- Left sidebar (280px): garden list as `ListItemButton` with selected state, "New Garden" button opens create dialog
- Right panel: renders `GardenGrid` when a garden is selected, fallback copy when none
- Auth check on mount via `getMe()` — redirects to `/login` on 401
- Parallel fetch of gardens, plants, companions, antagonists using `Promise.all`
- Full create → select → place → clear flow: create dialog with name/rows/cols, cell click opens picker, upsert/clear refreshes garden data

### GardenGrid (`ui/src/components/GardenGrid.jsx`)

- Builds `cellGrid` keyed by `"row,col"` for O(1) cell lookup
- Builds `companionSet` and `antagonistSet` using normalized `min-max` pair keys to match DB storage
- `getCellStatus` checks 4 orthogonal neighbors within bounds; antagonist takes priority over companion
- CSS grid via `Box sx={{ display: 'grid', gridTemplateColumns: ... }}` — no MUI Grid component

### GardenCell (`ui/src/components/GardenCell.jsx`)

64x64 clickable cell with background color driven by status:
- `error.dark` for antagonist, `success.dark` for companion, `background.paper` for neutral, `background.default` for empty
- Displays `plantName` when occupied

### PlantPickerDialog (`ui/src/components/PlantPickerDialog.jsx`)

MUI Dialog listing all plants with name and category as secondary text. Shows "Remove Plant" button (outlined, error color) when a plant is already in the cell.

### Navigation

- `App.jsx` — added `Garden` import and `/garden` route
- `Header.jsx` — added "My Gardens" `RouterLink` button in authenticated user section

## Key Decisions

- **Antagonist takes priority**: `getCellStatus` short-circuits and returns `"antagonist"` immediately if any neighbor pair is in the antagonist set. Companion status is only returned if no antagonist was found. This ensures red always overrides green.
- **CSS grid not MUI Grid**: Fixed 64px cells render cleanly with `display: 'grid'` and `gridTemplateColumns: repeat(N, 64px)`. MUI Grid would add unnecessary flex complexity for a fixed-size layout.
- **Min-max pair key normalization**: Both `companionSet` and `antagonistSet` use `Math.min(a,b)-Math.max(a,b)` as the key, matching the DB constraint that stores pairs with the lower ID first.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

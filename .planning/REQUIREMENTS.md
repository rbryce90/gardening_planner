# Requirements: Gardening Planner

**Defined:** 2026-03-22
**Core Value:** Users can visually design their garden on a grid and immediately see which plant placements work well together and which conflict

## v1 Requirements

### Infrastructure

- [x] **INFRA-01**: Server migrated to latest Deno, all existing endpoints working
- [x] **INFRA-02**: Centralized error handler middleware catches all route errors
- [x] **INFRA-03**: Winston logger replaces console.log/error throughout server

### Authentication

- [x] **AUTH-01**: User can create account with email and password
- [x] **AUTH-02**: User can log in and stay logged in across browser refresh (JWT HttpOnly cookie)

### Garden Builder

- [x] **GRID-01**: User can create a named garden grid of any size
- [x] **GRID-02**: User can click a grid cell and select a plant to place in it
- [x] **GRID-03**: User can save and reload their garden layouts
- [x] **GRID-04**: User can have multiple saved garden designs
- [x] **GRID-05**: Grid cells highlight red when neighboring plants are antagonists
- [x] **GRID-06**: Grid cells highlight green when neighboring plants are companions

### Seasonal Planting

- [ ] **SEAS-01**: User can select their USDA hardiness zone from a dropdown
- [ ] **SEAS-02**: User can view what to plant by month based on their zone

### Seed Data

- [x] **SEED-01**: JSON file containing plants, types, companions, antagonists, zones, and planting seasons
- [x] **SEED-02**: Re-runnable import script that loads JSON seed data into the database

## v2 Requirements

### Garden Builder Enhancements

- **GRID-07**: Inline tooltip explaining why two plants conflict or complement
- **GRID-08**: Full garden health score (% good neighbors vs conflicts)
- **GRID-09**: Bed naming and annotation
- **GRID-10**: Clone/copy a garden design

### Seasonal Enhancements

- **SEAS-03**: Monthly planting checklist ("plant now" / "start seeds indoors")

### Authentication Enhancements

- **AUTH-03**: User can log out from any page

## Out of Scope

| Feature | Reason |
|---------|--------|
| Auto-location / GPS zone detection | User picks zone manually; adds complexity and privacy surface |
| Drag-and-drop plant placement | Click-to-place covers core use case; drag-and-drop adds accessibility and mobile complexity |
| Stripe / payments | Scaffolded but not part of current goals |
| Mobile app | Web only |
| Social / sharing features | Single-user scope per account |
| AI planting suggestions | Companion data already encodes this explicitly |
| Real-time collaborative editing | No stated need; one owner per garden |
| Weather integration | Zone-based seasonal data covers the core need |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| SEED-01 | Phase 1 | Complete |
| SEED-02 | Phase 1 | Complete |
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Complete |
| GRID-01 | Phase 3 | Complete |
| GRID-02 | Phase 3 | Complete |
| GRID-03 | Phase 3 | Complete |
| GRID-04 | Phase 3 | Complete |
| GRID-05 | Phase 3 | Complete |
| GRID-06 | Phase 3 | Complete |
| SEAS-01 | Phase 4 | Pending |
| SEAS-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-22 after roadmap creation*

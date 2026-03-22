# Requirements: Gardening Planner

**Defined:** 2026-03-22
**Core Value:** Users can visually design their garden on a grid and immediately see which plant placements work well together and which conflict

## v1 Requirements

### Infrastructure

- [ ] **INFRA-01**: Dead Deno code removed, server compiles cleanly under Node/Express
- [ ] **INFRA-02**: Centralized error handler middleware catches all route errors
- [ ] **INFRA-03**: Winston logger replaces console.log/error throughout server

### Authentication

- [ ] **AUTH-01**: User can create account with email and password
- [ ] **AUTH-02**: User can log in and stay logged in across browser refresh (JWT HttpOnly cookie)

### Garden Builder

- [ ] **GRID-01**: User can create a named garden grid of any size
- [ ] **GRID-02**: User can click a grid cell and select a plant to place in it
- [ ] **GRID-03**: User can save and reload their garden layouts
- [ ] **GRID-04**: User can have multiple saved garden designs
- [ ] **GRID-05**: Grid cells highlight red when neighboring plants are antagonists
- [ ] **GRID-06**: Grid cells highlight green when neighboring plants are companions

### Seasonal Planting

- [ ] **SEAS-01**: User can select their USDA hardiness zone from a dropdown
- [ ] **SEAS-02**: User can view what to plant by month based on their zone

### Seed Data

- [ ] **SEED-01**: JSON file containing plants, types, companions, antagonists, zones, and planting seasons
- [ ] **SEED-02**: Re-runnable import script that loads JSON seed data into the database

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
| INFRA-01 | Pending | Pending |
| INFRA-02 | Pending | Pending |
| INFRA-03 | Pending | Pending |
| AUTH-01 | Pending | Pending |
| AUTH-02 | Pending | Pending |
| GRID-01 | Pending | Pending |
| GRID-02 | Pending | Pending |
| GRID-03 | Pending | Pending |
| GRID-04 | Pending | Pending |
| GRID-05 | Pending | Pending |
| GRID-06 | Pending | Pending |
| SEAS-01 | Pending | Pending |
| SEAS-02 | Pending | Pending |
| SEED-01 | Pending | Pending |
| SEED-02 | Pending | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 0
- Unmapped: 15 ⚠️

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-22 after initial definition*

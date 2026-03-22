# Feature Landscape

**Domain:** Grid-based garden planning tool with companion planting and seasonal scheduling
**Researched:** 2026-03-22
**Confidence:** MEDIUM — domain patterns drawn from training-data knowledge of tools like GrowVeg, Growstuff, Old Farmer's Almanac Garden Planner, and SmartGardener. No live web research available. Core patterns are well-established and stable.

---

## Table Stakes

Features users expect from any grid-based garden planning tool. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Grid-based layout canvas | The core interaction — users need a visual spatial representation of their garden bed(s) | High | Flexible grid size is already a project decision; React rendering of a 2D grid with clickable cells |
| Plant placement into grid cells | Primary user action — drag or click to place a plant in a cell | Medium | Project scoped to click-to-place for v1; one plant per cell is standard |
| Plant search / browse when placing | Users need to pick which plant to place; a searchable list is expected | Medium | Plants data already exists; needs a picker UI on cell click |
| Visual companion indicator | Show beneficial pairings at a glance — colored border or icon on cell | Medium | Already in requirements; green highlight or checkmark on neighboring cells |
| Visual conflict/antagonist warning | Show harmful pairings — red highlight is the universal convention | Medium | Already in requirements; red cell border when neighbor is an antagonist |
| Save and reload a garden layout | Users invest time in layouts and expect persistence | Medium | Multi-garden-per-user already in requirements |
| User accounts (signup, login, logout) | Layouts must be owned by someone; anonymous layouts are a usability dead end | High | Scaffolded but not wired; Deno-to-Node migration required first |
| Plant detail access while planning | Users need to recall spacing, notes, season info while placing plants | Low | Existing plant detail view; needs to be accessible from the grid view (modal or panel) |
| Hardiness zone selection | Drives seasonal scheduling; without zone the planting calendar is meaningless | Low | Dropdown on user profile or onboarding; already in requirements |
| Seasonal planting view | Show what to plant by month for the user's zone | High | Planting_seasons table already in schema; needs data and UI |
| Multiple garden designs per user | Users have multiple beds or iterate designs over years | Medium | Already in requirements |

---

## Differentiators

Features that set the product apart. Not expected, but valued when present.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Inline conflict/companion explanation | Hovering a red cell tells you *why* two plants conflict, not just that they do | Low | Tooltip on the visual indicator; relationship data already exists |
| Full garden health score | Summarize the % of plantings with good neighbors vs. conflicts — gives at-a-glance garden quality | Medium | Derived from relationship data already in DB; display in grid header |
| Monthly planting checklist | List of "ready to plant now" and "start seeds indoors in X weeks" for the user's zone and current month | Medium | Requires planting_seasons data to be populated; date-aware filtering |
| Bed naming and annotation | Label a grid "Front Bed" or "Raised Bed 1" so users manage multi-bed yards clearly | Low | Simple label field on the grid/garden design record |
| Clone / copy a garden design | Duplicate last year's layout as a starting point for iteration | Low | Copy the grid structure and cell assignments |
| Print / export to PDF | Users bring plans to the garden; printable grid is a common ask in this domain | Medium | CSS print stylesheet or server-side PDF generation |
| Suggested replacements for conflicts | When a conflict is detected, suggest which other plants would be compatible in that cell | High | Requires querying companion data and rendering suggestions; deferred past v1 |
| Seed data import via JSON | Lets the operator bulk-load plant relationships; rerunnable seeding | Low | Already in requirements as a seed data file; not a user-facing feature |

---

## Anti-Features

Features to explicitly NOT build in this project.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Auto-location / GPS zone detection | Project already scoped this out; adds complexity and privacy surface for minimal gain | User picks their USDA zone from a dropdown during onboarding |
| Drag-and-drop plant placement | Higher complexity, accessibility burden, mobile mismatch; click-to-place covers the core use case | Click-to-place with a plant picker per cell |
| Stripe / payments | Scaffolded but explicitly out of scope for current goals | Leave commented out; do not wire up |
| Mobile-native or PWA features | Web only; mobile layout can be responsive but no offline/service worker complexity | Responsive MUI layout is sufficient |
| Social / sharing features | Garden sharing, public profiles, community feeds — adds auth complexity with no stated value yet | Single-user scope per account |
| AI planting suggestions | Trendy but out of scope; requires a data model and prompt engineering investment | Companion relationship data already encodes this logic explicitly |
| Real-time collaborative editing | Multi-user concurrent grid editing is complex WebSocket work with no stated need | One owner per garden design |
| Weather integration | Actual-weather-based advice requires API keys and sync; zone-based seasonal data covers the core need | Static planting_seasons data per zone |
| In-app plant marketplace / affiliate links | Monetization concern not in current scope | Keep plant data focused on botanical/horticultural attributes |

---

## Feature Dependencies

```
User accounts → Save/load garden designs
User accounts → Hardiness zone selection (stored on user profile)
Hardiness zone selection → Seasonal planting view
Plant data (existing) → Grid cell placement
Plant data + companion/antagonist relationships (existing) → Visual conflict/companion indicators
Grid placement → Visual indicators (need cells to have plants before relationships render)
Grid placement → Full garden health score
Plant placement → Seasonal planting view (optionally filtered to planted species)
Planting_seasons data populated → Monthly planting checklist
Planting_seasons data populated → Seasonal planting view
```

---

## MVP Recommendation

Prioritize in this order:

1. **User accounts** — signup, login, session persistence. Unlocks everything else. Migration of existing scaffolded auth from Deno to Node/Express is the main work.
2. **Grid builder** — create a named grid of configurable size, save it to a user, load it back.
3. **Plant placement** — click a cell, pick a plant from a list, save the assignment.
4. **Visual companion/conflict indicators** — color cells based on neighbor relationships. This is the core value of the product.
5. **Hardiness zone on user profile** — dropdown selection, saved with user record.
6. **Seasonal planting view** — list of what to plant by month for the user's zone. Requires planting_seasons data to be seeded.

Defer to later milestones:
- **Full garden health score** — valuable but not blocking core UX; add after indicators work
- **Monthly planting checklist** — needs planting_seasons seed data to be useful; tie to a data-population milestone
- **Inline conflict explanation tooltips** — low complexity but not blocking; add once indicators are working
- **Clone garden design** — convenience feature; add when multi-garden management is proven out

---

## Notes on Existing State

The following table-stakes features already exist in the backend and UI:

- Plant CRUD (name, category, growth form, edible part, family)
- Plant type/variety detail (scientific name, description, planting notes)
- Companion and antagonist relationships (symmetric many-to-many)
- Plant list and detail views in React

The schema already has `zones` and `planting_seasons` tables, but routes and controllers for those are dead Deno code. The planting_seasons table likely has no seed data. Both need to be rebuilt in Node/Express before seasonal features can ship.

---

## Sources

- Domain knowledge from training data (tools: GrowVeg Vegetable Garden Planner, Growstuff, Old Farmer's Almanac Garden Planner, SmartGardener)
- Confidence: MEDIUM — these tools represent stable, well-known patterns in this domain. Live verification was not available.
- Project context: `.planning/PROJECT.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/CONCERNS.md`

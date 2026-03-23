# Phase 4: Seasonal Planting - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-22
**Phase:** 04-seasonal-planting
**Areas discussed:** Zone selection, Calendar display, Backend API, Navigation
**Mode:** Auto (all decisions auto-selected with recommended defaults)

---

## Zone Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Dashboard dropdown | Zone dropdown on user dashboard/profile | ✓ |
| Separate settings page | Dedicated settings page for zone | |
| First-login wizard | Prompt during onboarding | |

**User's choice:** [auto] Dashboard dropdown (recommended default)
**Notes:** Zone stored on users table as zone_id FK. Immediate persistence on change.

---

## Calendar Display

| Option | Description | Selected |
|--------|-------------|----------|
| Grid/table (months x plants) | Compact tabular view with months as columns | ✓ |
| Card-based monthly view | One card per month with plant list | |
| Timeline/Gantt style | Horizontal bars showing planting windows | |

**User's choice:** [auto] Grid/table (recommended default)
**Notes:** Shows all plants filtered by zone, not just user's garden plants. Current month highlighted.

---

## Backend API

| Option | Description | Selected |
|--------|-------------|----------|
| Rewrite zone routes for Express | Fresh Express routes following established patterns | ✓ |
| Adapt existing Deno routes | Convert Oak syntax to Express | |

**User's choice:** [auto] Rewrite for Express (recommended — old code uses Oak/Deno patterns)
**Notes:** Three new endpoints: GET /api/zones, PUT /api/auth/zone, GET /api/planting-calendar/:zoneId

---

## Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Header link (auth-aware) | "Planting Calendar" in header when logged in | ✓ |
| Dashboard widget link | Access from dashboard only | |

**User's choice:** [auto] Header link (recommended — matches garden builder pattern)
**Notes:** Route at /calendar

---

## Claude's Discretion

- Table layout and styling details
- Empty state for users without zone selected
- Month tab vs scrollable table
- Mobile responsiveness

## Deferred Ideas

None

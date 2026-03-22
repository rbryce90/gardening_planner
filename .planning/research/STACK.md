# Technology Stack — Milestone Additions

**Project:** Gardening Planner
**Researched:** 2026-03-22
**Scope:** New libraries needed for grid builder, user auth, seasonal views, and seed data import. Existing stack (Express 5.1, React 19, MUI 7, sqlite/sqlite3, axios, React Router 7) is not re-evaluated.

---

## New Dependencies by Feature Area

### 1. User Authentication (Server)

| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `jsonwebtoken` | ^9.0.0 | Sign and verify JWTs for stateless session tokens | HIGH |
| `bcrypt` | ^5.1.1 | Hash passwords before storage | HIGH |
| `@types/jsonwebtoken` | ^9.0.0 | TypeScript types | HIGH |
| `@types/bcrypt` | ^5.0.2 | TypeScript types | HIGH |
| `cookie-parser` | ^1.4.7 | Parse `HttpOnly` cookie containing JWT on each request | HIGH |
| `@types/cookie-parser` | ^1.4.7 | TypeScript types | HIGH |

**Why JWT over session-based:** The existing scaffolded auth used Deno-era session IDs stored in SQLite. For the Node/Express rewrite, JWTs stored in `HttpOnly` cookies are simpler — no sessions table needed, no session lookup on every request. The existing `sessions` table schema (in the commented-out Deno code) can be dropped.

**Why bcrypt over argon2:** bcrypt is the established Node.js choice with mature types, broad deployment history, and no native compile issues on common platforms. argon2 is theoretically stronger but adds native build complexity for no practical gain at this scale.

**Do NOT use:** `express-session` + `connect-sqlite3` — that pattern adds a sessions table, a store dependency, and more moving parts. JWT in cookies is simpler to implement and test.

---

### 2. Grid Builder (Frontend)

No dedicated grid library is needed or recommended.

**Rationale:** The grid is a static CSS Grid layout with click-to-place interaction. Each cell is a React component (`<div>`) rendered from a 2D array in state. MUI already provides `Box` with `sx` grid props and `Paper` for cell styling. A dedicated library (react-grid-layout, react-dnd) would introduce drag-and-drop complexity that PROJECT.md explicitly defers ("click-to-place is sufficient for v1").

**Pattern to use:** `state: PlantId | null[][]` (2D array, rows x cols). Each cell click sets `state[row][col] = selectedPlantId`. Companion/antagonist conflict detection runs as a derived value (useMemo) over the grid state, checking each cell's four neighbors against the companions/antagonists data already in app state.

**Do NOT use:** `react-grid-layout` — designed for draggable/resizable dashboard widgets, not fixed-cell garden grids. `react-dnd` — overkill for click-to-place.

---

### 3. Seasonal Planting View (Frontend + Backend)

No new libraries required.

**Rationale:** Seasonal data (zones, planting_seasons) is already modeled in the SQLite schema (`zones`, `planting_seasons` tables, `zoneRoutes.ts` scaffolded). The view is a read-only display of filtered planting_seasons records by zone and month. Standard React state + axios GET calls to the existing zone route pattern is sufficient.

The zone selector (USDA hardiness zone dropdown) is a standard MUI `Select` component populated from a `/api/zones` endpoint.

---

### 4. Seed Data Import (Server)

| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `tsx` | ^4.19.0 | Run a TypeScript seed script directly without a separate tsconfig or build step | HIGH |

**Why `tsx` for the seed script:** The seed file is a one-off Node.js script that imports the existing `getDatabase()` helper and reads a JSON file. `ts-node` is already present but requires `tsconfig` module resolution adjustments for ESM/CommonJS consistency. `tsx` (esbuild-based) runs TypeScript files directly with zero config and handles both CJS and ESM contexts cleanly. It is a devDependency only.

**Seed format:** JSON file at `server/seeds/plants.json`. The import script reads it and runs upsert-style inserts (INSERT OR IGNORE for plants/types, then conditional inserts for relationships). No migration library is needed.

**Do NOT use:** `sequelize`, `knex`, or any ORM/query builder for seed data — the project uses raw `sqlite` queries throughout and introducing a query builder for a single seed script would be inconsistent.

---

### 5. Infrastructure / Cross-Cutting

| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `winston` | ^3.17.0 | Replace the hand-rolled logger (`server/utils/logger.ts`) with structured logging | HIGH |
| `dotenv` | ^16.5.0 | Load `.env` for `JWT_SECRET`, `NODE_ENV` — not currently wired in | HIGH |
| `@types/dotenv` | n/a (types included in package) | — | HIGH |
| `jest` | ^29.7.0 | Test runner (no test framework currently exists) | HIGH |
| `ts-jest` | ^29.3.0 | Jest transformer for TypeScript server tests | HIGH |
| `@types/jest` | ^29.5.0 | TypeScript types for Jest | HIGH |
| `supertest` | ^7.0.0 | HTTP integration tests against the Express app | HIGH |
| `@types/supertest` | ^6.0.0 | TypeScript types | HIGH |

**Why Winston:** The current logger is a thin console wrapper. Winston adds log levels, transports (file + console), and structured JSON output — all needed once auth and multi-user sessions are in play. The PROJECT.md global instructions require Winston explicitly.

**Why dotenv now:** `JWT_SECRET` must not be hardcoded. This is the first milestone that requires a secret. Wire it up before auth routes are implemented.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Auth tokens | JWT in HttpOnly cookie | Session IDs in SQLite | More tables, more queries per request, already tried in Deno era and abandoned |
| Auth tokens | JWT in HttpOnly cookie | JWT in localStorage | Vulnerable to XSS; HttpOnly cookie is the secure default |
| Password hashing | `bcrypt` | `argon2` | argon2 requires native build; bcrypt is well-established with no practical security gap at this scale |
| Grid rendering | CSS Grid + React state | `react-grid-layout` | Drag-and-drop not required; library designed for resizable dashboard panels |
| Seed runner | `tsx` script | SQL migration file | JSON seed with upsert logic is easier to maintain and re-run; SQL files can't express conditional relationship inserts cleanly |
| Testing | Jest + ts-jest | Vitest | Server is CommonJS/ts-node; Jest + ts-jest is the standard pairing for Express. Vitest is Vite-native (better fit for the UI side, if UI tests are added later) |

---

## Installation

```bash
# Server — runtime dependencies
cd server
npm install jsonwebtoken bcrypt cookie-parser winston dotenv

# Server — dev dependencies
npm install -D @types/jsonwebtoken @types/bcrypt @types/cookie-parser jest ts-jest @types/jest supertest @types/supertest tsx
```

```bash
# UI — no new dependencies for grid builder or seasonal view
# MUI Box/Grid + local React state covers all new UI needs
```

---

## Environment Variables

Add to `server/.env` (create this file; add to `.gitignore`):

```
JWT_SECRET=<random 256-bit string>
NODE_ENV=development
```

---

## Confidence Notes

- **jsonwebtoken, bcrypt, cookie-parser, dotenv, winston, jest, supertest:** HIGH — these are the established, long-stable Node.js choices. No external verification needed.
- **tsx as seed runner:** HIGH — well-established as a zero-config ts runner; version range based on knowledge through August 2025. Verify latest version before install.
- **No grid library needed:** HIGH — based on the click-to-place constraint in PROJECT.md and the fact that CSS Grid with React state is idiomatic for fixed-cell grids.
- **No new UI libraries for seasonal view:** HIGH — data is already modeled; this is purely a display concern.

---

*Researched: 2026-03-22*

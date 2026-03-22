# Architecture

**Analysis Date:** 2026-03-22

## Pattern Overview

**Overall:** Layered monorepo with a React SPA frontend (`ui/`) and an Express/TypeScript backend (`server/`). The server follows a 4-layer architecture: Routes → Controllers → Repositories → Databases.

**Key Characteristics:**
- Backend layers are strictly separated: routes handle HTTP, controllers hold business logic, repositories handle queries, databases manage connections and schema
- Frontend makes direct axios calls to `/api/*` endpoints — no service abstraction layer exists yet
- SQLite is the sole data store, initialized and schema-migrated on startup via `server/databases/plantDb.ts`
- Session, auth, stripe, and zone features are fully commented out — only plant data is active

## Layers

**Routes:**
- Purpose: HTTP endpoint definitions, request validation, response serialization
- Location: `server/routes/`
- Contains: Express Router instances; one file per resource
- Depends on: Controllers
- Used by: Express app (`server/index.ts`)

**Controllers:**
- Purpose: Business logic, data assembly, orchestration across repository calls
- Location: `server/controllers/`
- Contains: Exported async functions (not classes); one file per resource
- Depends on: Repositories
- Used by: Routes

**Repositories:**
- Purpose: All database access — SQL queries, row mapping to typed objects
- Location: `server/repositories/`
- Contains: Classes (e.g., `PlantRepository`) with async methods; one class per resource
- Depends on: `server/databases/`
- Used by: Controllers

**Databases:**
- Purpose: SQLite connection management and schema initialization (CREATE TABLE IF NOT EXISTS)
- Location: `server/databases/`
- Contains: Singleton database instance via `getDatabase()`; schema DDL inline
- Depends on: `sqlite`, `sqlite3` packages
- Used by: Repositories

**Middleware:**
- Purpose: Cross-cutting HTTP concerns
- Location: `server/middleware/`
- Contains: `requestLogger.ts` (Winston-based), `requestId.ts` (UUID injection); session middleware is fully commented out
- Depends on: `server/utils/logger.ts`
- Used by: `server/index.ts` (currently commented out in app bootstrap)

**Types:**
- Purpose: Shared TypeScript type definitions for domain objects
- Location: `server/types/`
- Contains: `plant.d.ts` (Plant, PlantType), `express.d.ts` (Request augmentation for `requestId`)
- Used by: Routes, controllers, repositories

**UI Pages:**
- Purpose: Page-level components, own data fetching via axios
- Location: `ui/src/pages/`
- Contains: `Plants.jsx` (plant list/CRUD), `PlantType.jsx` (plant detail with types, companions, antagonists)
- Depends on: `ui/src/components/`

**UI Components:**
- Purpose: Reusable display and form components
- Location: `ui/src/components/`
- Contains: `PlantGrid`, `PlantCard`, `PlantList`, `AddPlantCard`, `EditPlantDialog`, `Header`
- Depends on: MUI component library; props passed from pages

## Data Flow

**Read Plants (list):**

1. Browser loads `/plants` → React renders `Plants.jsx`
2. `useEffect` fires `axios.get('/api/plants')`
3. Express routes to `plantRouter.get('/')` in `server/routes/plantRoutes.ts`
4. Route calls `getPlants()` in `server/controllers/plantController.ts`
5. Controller calls `plantRepository.getPlants()` in `server/repositories/plantRepository.ts`
6. Repository calls `getDatabase()` from `server/databases/plantDb.ts`, executes SQL, maps rows to `Plant[]`
7. Response propagates back up as JSON

**Read Plant Detail (types + companions + antagonists):**

1. Browser navigates to `/plants/:plantName/types`
2. `PlantType.jsx` calls `axios.get('/api/plants/:name/types')`
3. Route calls `getPlantByName()` then `getPlantTypesByPlantIdWithCompanionsAndAtagonists()`
4. Controller makes multiple sequential repository calls to fetch types, companions, antagonists; enriches each companion/antagonist with full plant data via `getPlantById()`
5. Returns merged object: `{ ...plant, types, companions, antagonists }`

**State Management:**
- Local React state only (`useState`). No global state management. Pages own their own data and pass it down via props to components.

## Key Abstractions

**PlantRepository:**
- Purpose: All SQL access for plants, plant_types, companions, antagonists, planting_seasons
- Examples: `server/repositories/plantRepository.ts`
- Pattern: Class instantiated once at module level (`const plantRepository = new PlantRepository()`); controller imports the instance

**getDatabase() singleton:**
- Purpose: Lazy-initialized SQLite connection; schema creation runs on first call
- Examples: `server/databases/plantDb.ts`
- Pattern: Module-level `dbInstance` variable; `initializeDatabase()` runs CREATE TABLE IF NOT EXISTS for all tables

**Plant / PlantType types:**
- Purpose: Canonical domain types shared across routes, controllers, repositories
- Examples: `server/types/plant.d.ts`
- Pattern: TypeScript `type` declarations; camelCase in code, snake_case in DB columns (mapped explicitly in repository)

## Entry Points

**Server:**
- Location: `server/index.ts`
- Triggers: `node` / `ts-node` invocation; listens on port 8000
- Responsibilities: Creates Express app, registers JSON middleware, mounts `plantRouter` at `/api/plants`

**UI:**
- Location: `ui/src/main.jsx`
- Triggers: Vite dev server or build
- Responsibilities: Renders `<App />` into DOM; `App.jsx` sets up MUI ThemeProvider, React Router, and route definitions

## Error Handling

**Strategy:** Per-route try/catch in route files; no centralized error handler middleware exists.

**Patterns:**
- `console.error()` is used for logging errors in routes (not Winston)
- 500 responses return `{ error: err }` — the raw error object, not a user-facing message
- 400 responses return `{ error: "description string" }` for invalid inputs
- No global error boundary on the frontend

## Cross-Cutting Concerns

**Logging:** Custom `logger` util at `server/utils/logger.ts` — wraps `console.log/warn/error/debug` with timestamps and level prefixes. Winston is NOT used despite being in project plans. `requestLogger` middleware exists but is commented out in `server/index.ts`.

**Validation:** Manual field checks in route handlers (e.g., `if (!plant.name || !plant.category || !plant.growthForm)`). No schema validation library.

**Authentication:** Fully commented out. Session middleware (`server/middleware/session.ts`), auth routes (`server/routes/authRoutes.ts`), and user routes are all disabled.

---

*Architecture analysis: 2026-03-22*

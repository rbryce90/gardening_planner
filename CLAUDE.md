<!-- GSD:project-start source:PROJECT.md -->
## Project

**Gardening Planner**

A garden design tool where users create grid-based garden layouts, place plants into beds, and get visual feedback on companion/antagonist relationships. The app shows what to plant and when based on the user's USDA hardiness zone. Users sign up, save their garden designs, and manage plant data.

**Core Value:** Users can visually design their garden on a grid and immediately see which plant placements work well together and which conflict — so they grow better gardens.

### Constraints

- **Database**: SQLite — local-first, no hosted database
- **Tech stack**: Build on existing Express/React/MUI stack — don't introduce new frameworks
- **Seed data**: Plant relationship data maintained in a file (JSON) that can be re-imported as needed
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.8 - Server (`server/`) and shared type definitions
- JavaScript (JSX) - UI components (`ui/src/`)
- TypeScript (TSX) - Some UI components (`ui/src/components/AddPlantCard.tsx`, `ui/src/models/models.ts`, `ui/src/utils/utils.ts`)
## Runtime
- Node.js (version not pinned; no `.nvmrc` or `.node-version` present)
- npm
- Lockfiles: present in both `server/package-lock.json` (lockfileVersion 3) and `ui/package-lock.json`
## Frameworks
- Express 5.1 - HTTP server and routing (`server/index.ts`)
- React 19.1 - UI framework (`ui/src/`)
- React Router DOM 7.6 - Client-side routing (`ui/src/`)
- MUI (Material UI) 7.1 + Emotion - Component library and styling (`ui/src/components/`)
- Vite 6.3 with `@vitejs/plugin-react` - UI build tool and dev server (`ui/vite.config.js`)
- TypeScript compiler (`tsc`) - Server build (`server/tsconfig.json`)
- ts-node 10.9 - Server TypeScript execution in development
- nodemon 3.1 - Server hot reload in development
## Key Dependencies
- `sqlite3` 5.1 + `sqlite` 5.1 - Local SQLite database driver and async wrapper (`server/databases/plantDb.ts`)
- `axios` 1.9 - HTTP client for all API calls from the UI (`ui/src/`)
- `uuid` 11.1 - Request ID generation (`server/middleware/requestId.ts`)
- `@emotion/react` + `@emotion/styled` 11.14 - Required by MUI for runtime CSS-in-JS
- `@mui/icons-material` 7.1 - Material icon set used in UI components
## Configuration
- No `.env` file present in current node-based server (`.env` is not in `.gitignore`)
- `DEBUG=true` env var enables debug-level logging via `server/utils/logger.ts`
- Stripe accessor (`server/accessors/stripeAccessor.ts`) references `STRIPE_SECRET_KEY` via Deno-era dotenv — not wired into current Node server
- Target: ES6, module: CommonJS
- Strict mode enabled
- Output: `server/dist/`
- Config: `server/tsconfig.json`
- ESLint 9.25 with flat config format
- Plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Config: `ui/eslint.config.js`
- Server: `npm run build` → `tsc` → output to `server/dist/`
- Server dev: `npm run dev` → nodemon + ts-node watching `./**/*.ts`
- UI: `npm run dev` → Vite dev server with proxy to `http://localhost:8000`
- UI: `npm run build` → Vite production build
## Platform Requirements
- Node.js required (version not pinned)
- Two separate npm workspaces: `server/` and `ui/` (no root package.json)
- Server runs on port 8000; UI dev server proxies `/api` to it
- Server: `node dist/index.js` after `tsc` build
- UI: static files from `vite build` output
- Deployment target: not defined
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Server: camelCase for all files — `plantController.ts`, `plantRepository.ts`, `plantDb.ts`
- UI: PascalCase for component files — `PlantCard.jsx`, `AddPlantCard.tsx`, `PlantGrid.jsx`
- UI: camelCase for non-component files — `utils.ts`, `models.ts`
- Mixed extensions in UI: both `.jsx` and `.tsx` are used; `.tsx` for newer components (e.g., `AddPlantCard.tsx`)
- Server: camelCase exports — `getPlants`, `createPlant`, `deletePlant`, `updatePlant`
- UI: PascalCase for React components exported as default — `function PlantCard(...)`, `function Plants(...)`
- UI: camelCase for handlers — `handleCardClick`, `handleDeletePlant`, `handleChange`, `handleSubmit`
- camelCase throughout — `plantRepository`, `dbInstance`, `userInput`, `plantData`
- Mixed naming in some params: `plant_id`, `companion_id` (snake_case) used in repository methods alongside camelCase
- PascalCase — `Plant`, `PlantType`, `User`, `UserLoginInterface`
- `type` preferred over `interface` for data shapes; `interface` used for behavior contracts (`UserLoginInterface`)
- Enums: PascalCase name, SCREAMING_SNAKE_CASE values — `enum AuthHeaders { SESSION_ID = "session_id" }`
- snake_case in SQL — `growth_form`, `plant_id`, `companion_id`, `planting_notes`
- Mapped to camelCase in TypeScript on read
## Code Style
- No Prettier config detected; formatting appears manual
- 4-space indentation (server TypeScript)
- 2-space indentation (UI JSX/TSX)
- ESLint v9 with flat config — `ui/eslint.config.js`
- Applies only to `**/*.{js,jsx}` (does not lint `.tsx` files)
- Rules: `js.configs.recommended`, `eslint-plugin-react-hooks` recommended
- `no-unused-vars` error with `varsIgnorePattern: '^[A-Z_]'`
- `react-refresh/only-export-components` warning
- `strict: true` in `server/tsconfig.json`
- `esModuleInterop: true`, `skipLibCheck: true`
- Target: ES6, module: commonjs
## Import Organization
## Error Handling
- Every route handler wraps logic in try/catch
- Errors returned as `{ error: err }` — not a consistent user-facing message shape
- No centralized error handler middleware — each route handles its own errors
- `console.error` used directly in routes (not the custom logger)
- Custom logger (`server/utils/logger.ts`) exists but is not used in routes or controllers
- Axios calls use `.then/.catch` in pages, `async/await` with try/catch in components
- Error state stored as a string, displayed via MUI `<Alert severity="error">`
- `console.error` used for non-fatal errors
## Logging
- Routes use `console.error` directly (logger is not imported in routes)
- `requestLogger` middleware uses the custom logger
- `plantDb.ts` uses `console.log` directly
- The logger is partially adopted — use it for all new server code
## Comments
- Inline comments label route sections: `// Get all plants`, `// Create a new plant`
- Validate sections commented inline: `// Validate the required fields`
- Large blocks of commented-out code remain in files (`plantController.ts`, `plantRepository.ts`) representing unfinished/deferred features
- Not used anywhere in the codebase
## Function Design
- Thin wrappers over repository — one controller function per repository method
- Return values passed through directly; no transformation layer
- `async/await` throughout
- Class-based (`class PlantRepository`)
- Each method opens DB connection via `getDatabase()` — no connection passed in
- SQL written inline as strings
- Methods return typed values where possible, `any` used heavily for complex types
- Functional components only — no class components
- Props destructured inline: `function PlantCard({ plant, onEdit, onDelete })`
- Local state with `useState`; data fetching in pages via `useEffect`
- API calls made directly with `axios` in component/page files — no service layer
## Module Design
- Named function exports from controllers: `export const getPlants = async () => ...`
- Default exports for routers: `export default plantRouter`
- Class exports for repositories: `export class PlantRepository`; singleton also exported: `export const plantRepository = new PlantRepository()`
- Default exports for all components and pages: `export default function PlantCard(...)`
- Named exports for types and constants from `models.ts`
- Not used — imports point directly to individual files
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Backend layers are strictly separated: routes handle HTTP, controllers hold business logic, repositories handle queries, databases manage connections and schema
- Frontend makes direct axios calls to `/api/*` endpoints — no service abstraction layer exists yet
- SQLite is the sole data store, initialized and schema-migrated on startup via `server/databases/plantDb.ts`
- Session, auth, stripe, and zone features are fully commented out — only plant data is active
## Layers
- Purpose: HTTP endpoint definitions, request validation, response serialization
- Location: `server/routes/`
- Contains: Express Router instances; one file per resource
- Depends on: Controllers
- Used by: Express app (`server/index.ts`)
- Purpose: Business logic, data assembly, orchestration across repository calls
- Location: `server/controllers/`
- Contains: Exported async functions (not classes); one file per resource
- Depends on: Repositories
- Used by: Routes
- Purpose: All database access — SQL queries, row mapping to typed objects
- Location: `server/repositories/`
- Contains: Classes (e.g., `PlantRepository`) with async methods; one class per resource
- Depends on: `server/databases/`
- Used by: Controllers
- Purpose: SQLite connection management and schema initialization (CREATE TABLE IF NOT EXISTS)
- Location: `server/databases/`
- Contains: Singleton database instance via `getDatabase()`; schema DDL inline
- Depends on: `sqlite`, `sqlite3` packages
- Used by: Repositories
- Purpose: Cross-cutting HTTP concerns
- Location: `server/middleware/`
- Contains: `requestLogger.ts` (Winston-based), `requestId.ts` (UUID injection); session middleware is fully commented out
- Depends on: `server/utils/logger.ts`
- Used by: `server/index.ts` (currently commented out in app bootstrap)
- Purpose: Shared TypeScript type definitions for domain objects
- Location: `server/types/`
- Contains: `plant.d.ts` (Plant, PlantType), `express.d.ts` (Request augmentation for `requestId`)
- Used by: Routes, controllers, repositories
- Purpose: Page-level components, own data fetching via axios
- Location: `ui/src/pages/`
- Contains: `Plants.jsx` (plant list/CRUD), `PlantType.jsx` (plant detail with types, companions, antagonists)
- Depends on: `ui/src/components/`
- Purpose: Reusable display and form components
- Location: `ui/src/components/`
- Contains: `PlantGrid`, `PlantCard`, `PlantList`, `AddPlantCard`, `EditPlantDialog`, `Header`
- Depends on: MUI component library; props passed from pages
## Data Flow
- Local React state only (`useState`). No global state management. Pages own their own data and pass it down via props to components.
## Key Abstractions
- Purpose: All SQL access for plants, plant_types, companions, antagonists, planting_seasons
- Examples: `server/repositories/plantRepository.ts`
- Pattern: Class instantiated once at module level (`const plantRepository = new PlantRepository()`); controller imports the instance
- Purpose: Lazy-initialized SQLite connection; schema creation runs on first call
- Examples: `server/databases/plantDb.ts`
- Pattern: Module-level `dbInstance` variable; `initializeDatabase()` runs CREATE TABLE IF NOT EXISTS for all tables
- Purpose: Canonical domain types shared across routes, controllers, repositories
- Examples: `server/types/plant.d.ts`
- Pattern: TypeScript `type` declarations; camelCase in code, snake_case in DB columns (mapped explicitly in repository)
## Entry Points
- Location: `server/index.ts`
- Triggers: `node` / `ts-node` invocation; listens on port 8000
- Responsibilities: Creates Express app, registers JSON middleware, mounts `plantRouter` at `/api/plants`
- Location: `ui/src/main.jsx`
- Triggers: Vite dev server or build
- Responsibilities: Renders `<App />` into DOM; `App.jsx` sets up MUI ThemeProvider, React Router, and route definitions
## Error Handling
- `console.error()` is used for logging errors in routes (not Winston)
- 500 responses return `{ error: err }` — the raw error object, not a user-facing message
- 400 responses return `{ error: "description string" }` for invalid inputs
- No global error boundary on the frontend
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

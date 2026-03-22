# Codebase Structure

**Analysis Date:** 2026-03-22

## Directory Layout

```
gardening_planner/
├── server/                   # Express/TypeScript API server
│   ├── index.ts              # App entry point, port 8000
│   ├── routes/               # Express Router definitions (one file per resource)
│   ├── controllers/          # Business logic functions
│   ├── repositories/         # SQLite query classes
│   ├── databases/            # DB connection + schema init
│   ├── middleware/           # Express middleware (logger, requestId, session stub)
│   ├── types/                # TypeScript type/interface declarations
│   ├── models/               # Supplemental model files (partially used)
│   ├── utils/                # Shared utilities (logger, hash, name helpers)
│   ├── accessors/            # External service clients (Stripe stub)
│   ├── scripts/              # Shell scripts for DB seeding
│   │   └── plants/           # Plant seed data scripts
│   └── test/                 # Manual test scripts (not Jest)
├── ui/                       # React/Vite frontend
│   └── src/
│       ├── main.jsx          # React entry point
│       ├── App.jsx           # Router + theme setup
│       ├── index.css         # Global styles
│       ├── pages/            # Page-level components (own data fetching)
│       ├── components/       # Reusable UI components
│       ├── models/           # Frontend type definitions + lookup arrays
│       ├── utils/            # Frontend utility functions
│       └── assets/           # Static assets
└── .planning/                # Planning documents (not shipped)
    └── codebase/             # Codebase analysis docs
```

## Directory Purposes

**`server/routes/`:**
- Purpose: HTTP route definitions, request/response handling
- Contains: One `*Routes.ts` file per resource (plantRoutes, zoneRoutes, authRoutes, userRoutes, stripeRoutes)
- Key files: `server/routes/plantRoutes.ts` (only active routes)

**`server/controllers/`:**
- Purpose: Business logic, data assembly, orchestration
- Contains: One `*Controller.ts` file per resource; exports named async functions
- Key files: `server/controllers/plantController.ts`

**`server/repositories/`:**
- Purpose: All SQL queries and row-to-object mapping
- Contains: One class per resource (e.g., `PlantRepository`)
- Key files: `server/repositories/plantRepository.ts`

**`server/databases/`:**
- Purpose: Database connection singleton and schema DDL
- Contains: `plantDb.ts` (active), `userDb.ts` (inactive)
- Key files: `server/databases/plantDb.ts` — `getDatabase()` exported for all repository use; schema init runs on first call

**`server/middleware/`:**
- Purpose: Express middleware pipeline
- Contains: `requestLogger.ts`, `requestId.ts`, `session.ts` (fully commented out)
- Key files: `server/middleware/requestLogger.ts`

**`server/types/`:**
- Purpose: TypeScript declarations for domain types and Express augmentation
- Contains: `plant.d.ts`, `express.d.ts`
- Key files: `server/types/plant.d.ts` — defines `Plant` and `PlantType`

**`server/utils/`:**
- Purpose: Shared server-side utilities
- Contains: `logger.ts` (custom log wrapper), `hash.ts`, `createFullName.ts`
- Key files: `server/utils/logger.ts`

**`server/accessors/`:**
- Purpose: External API clients
- Contains: `stripeAccessor.ts` (inactive/stub)

**`server/scripts/plants/`:**
- Purpose: Shell scripts for seeding database with plant data
- Contains: `insert_plants.sh`, `insert_plant_types.sh`, `insert_zones.sh`, `drop_all_tables.sh`, `reload_tables.sh`
- Generated: No. Committed: Yes.

**`ui/src/pages/`:**
- Purpose: Page-level React components; each page owns its data fetching with axios
- Contains: `Plants.jsx` (plant CRUD list), `PlantType.jsx` (plant detail view)
- Key files: `ui/src/pages/Plants.jsx`, `ui/src/pages/PlantType.jsx`

**`ui/src/components/`:**
- Purpose: Reusable UI components, receive data via props
- Contains: `PlantGrid.jsx`, `PlantCard.jsx`, `PlantList.jsx`, `AddPlantCard.tsx`, `EditPlantDialog.jsx`, `Header.jsx`

**`ui/src/models/`:**
- Purpose: Frontend TypeScript types and enum-like constants/lookups
- Key files: `ui/src/models/models.ts` — exports `EdiblePart`, `GrowthType`, `CategoryType` union types and corresponding arrays/lookup objects

## Key File Locations

**Entry Points:**
- `server/index.ts`: Express server bootstrap, port 8000
- `ui/src/main.jsx`: React app mount point
- `ui/src/App.jsx`: Route definitions, MUI theme setup

**Configuration:**
- `server/tsconfig.json`: TypeScript config for server
- `server/package.json`: Server dependencies and scripts

**Core Logic:**
- `server/databases/plantDb.ts`: DB init, schema, connection singleton
- `server/repositories/plantRepository.ts`: All plant-related SQL
- `server/controllers/plantController.ts`: Business logic including companion/antagonist enrichment

**Active API Routes:**
- `server/routes/plantRoutes.ts`: `GET /api/plants`, `GET /api/plants/:id`, `GET /api/plants/:name/types`, `POST /api/plants`, `PUT /api/plants/:id`, `DELETE /api/plants/:id`, `POST /api/plants/:id/companion/:companionId`, `POST /api/plants/:id/antagonist/:antagonistId`

**Domain Types:**
- `server/types/plant.d.ts`: Server-side `Plant`, `PlantType`
- `ui/src/models/models.ts`: Frontend union types and lookup arrays

## Naming Conventions

**Files:**
- Server: `camelCase` with resource name + layer suffix — e.g., `plantController.ts`, `plantRepository.ts`, `plantRoutes.ts`
- UI: PascalCase for components/pages — e.g., `PlantGrid.jsx`, `AddPlantCard.tsx`; camelCase for utilities — e.g., `utils.ts`

**Directories:**
- Server: lowercase plural — `routes/`, `controllers/`, `repositories/`, `databases/`, `middleware/`, `types/`, `utils/`
- UI: lowercase plural — `pages/`, `components/`, `models/`, `utils/`

**Functions:**
- Controllers: named exports, verb + noun — e.g., `getPlants`, `createPlant`, `deletePlant`
- Repositories: class methods, same verb + noun pattern

**Types:**
- PascalCase for type names — `Plant`, `PlantType`, `EdiblePart`, `GrowthType`

## Where to Add New Code

**New resource (e.g., zones):**
- Route file: `server/routes/zoneRoutes.ts`
- Controller file: `server/controllers/zoneController.ts`
- Repository class: `server/repositories/zoneRepository.ts`
- DB schema: add tables to `server/databases/plantDb.ts` (or create `server/databases/zoneDb.ts`)
- Types: `server/types/zone.d.ts`
- Mount router in: `server/index.ts`

**New UI page:**
- Page component: `ui/src/pages/NewPage.jsx`
- Add route in: `ui/src/App.jsx`

**New UI component:**
- Reusable component: `ui/src/components/NewComponent.jsx` (or `.tsx` for TypeScript)

**New frontend type/enum:**
- Add to: `ui/src/models/models.ts`

**Shared server utility:**
- Add to: `server/utils/`

## Special Directories

**`server/test/`:**
- Purpose: Contains manual test scripts (`testing.ts`, `testing-action.ts`), not a Jest test suite
- Generated: No
- Committed: Yes

**`server/scripts/`:**
- Purpose: Shell scripts for seeding and resetting the SQLite database
- Generated: No
- Committed: Yes

**`.planning/`:**
- Purpose: GSD planning documents, not shipped code
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-03-22*

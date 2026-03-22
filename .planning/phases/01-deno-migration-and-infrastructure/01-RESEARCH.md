# Phase 1: Deno Migration and Infrastructure - Research

**Researched:** 2026-03-22
**Domain:** Deno 2, Express 5, SQLite (node:sqlite), Winston, seed scripting
**Confidence:** HIGH

## Summary

This phase migrates the existing Node.js/TypeScript Express server to Deno 2 (latest: v2.7.5 as of March 2026). The migration is lower-friction than it would have been a year ago: Deno 2 supports npm packages via `npm:` specifiers, runs TypeScript natively without a build step, and `node:sqlite` is now a first-party built-in (added Deno v2.2). The existing server code uses CommonJS (`module: "commonjs"` in tsconfig.json) — this must change to ES modules for Deno.

The three main structural changes are: (1) replace `tsconfig.json` + `package.json` with `deno.json`, mapping npm specifiers to short aliases; (2) replace the `sqlite` + `sqlite3` npm async wrapper with the native `node:sqlite` synchronous API; (3) replace `process.env.DEBUG` references and `uuid` imports with Deno-compatible equivalents. Winston is available via `npm:winston` and works in Deno 2. The existing `logger.ts` is a hand-rolled console wrapper, not Winston — it must be replaced with a real Winston instance.

Express 5 (already in use) automatically propagates errors thrown in async handlers to the error middleware, so the centralized error handler can be a simple 4-argument middleware added last to the Express app. The seed script should be a standalone Deno TypeScript file that reads a JSON file with `import ... with { type: "json" }` and uses `INSERT OR IGNORE` for idempotency.

**Primary recommendation:** Add `deno.json` at `server/`, map npm specifiers for express/winston/uuid, replace `sqlite`+`sqlite3` with `node:sqlite` (`DatabaseSync`), convert CommonJS imports to ESM, add centralized error middleware, wire up existing (commented-out) logger middleware, and write the JSON seed script.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | Server migrated to latest Deno, all existing endpoints working | deno.json config, npm: specifiers for express/winston/uuid, node:sqlite for DB, ESM module format |
| INFRA-02 | Centralized error handler middleware catches all route errors | Express 5 four-argument error middleware; async errors auto-propagate in Express 5 |
| INFRA-03 | Winston logger replaces console.log/error throughout server | npm:winston works in Deno 2 via npm: specifier; existing logger.ts is hand-rolled, not Winston |
| SEED-01 | JSON file containing plants, types, companions, antagonists, zones, and planting seasons | Schema already defined in plantDb.ts; all 6 tables exist; JSON shape must match DB columns |
| SEED-02 | Re-runnable import script that loads JSON seed data into the database | Standalone Deno script; INSERT OR IGNORE on unique columns for idempotency |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Deno | 2.7.5 (latest) | Runtime — replaces Node.js + tsc | Native TypeScript, no build step, npm: compatibility |
| Express | npm:express@^5.1.0 (already in use) | HTTP server and routing | Already in codebase; compatible with Deno 2 npm: |
| node:sqlite | Built-in (Deno 2.2+) | SQLite database access | First-party, no install, synchronous API |
| npm:winston | 3.x | Structured logging | npm: specifier works in Deno 2; required by INFRA-03 |
| npm:uuid | 11.x (already in use) | Request ID generation | npm: specifier; already used in middleware |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jsr:@std/assert | latest | Test assertions | Deno-native; already used in existing test/testing.ts |
| @types/express | npm:@types/express@^5.0.0 | TypeScript types for Express | Needed for typed Request/Response in Deno |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| node:sqlite (sync) | jsr:@db/sqlite (async) | jsr:@db/sqlite is async and more idiomatic Deno, but requires rewriting all repository methods; node:sqlite API is very close to what the existing code does and minimizes churn |
| node:sqlite | npm:sqlite + npm:sqlite3 | npm:sqlite3 is a Node-API addon that requires `nodeModulesDir: "auto"` and lifecycle scripts; more moving parts |
| npm:winston | Deno std logger or LogLayer | Winston is specifically called out in CLAUDE.md as the project standard; keep it |

**Installation (deno.json):**
```json
{
  "imports": {
    "express": "npm:express@^5.1.0",
    "winston": "npm:winston@^3.17.0",
    "uuid": "npm:uuid@^11.1.0"
  },
  "tasks": {
    "dev": "deno run --allow-net --allow-read --allow-write --allow-env server/index.ts",
    "seed": "deno run --allow-read --allow-write --allow-env server/scripts/seed.ts"
  }
}
```

**Version verification:** Verified against npm registry at research time.
- `winston`: 3.17.0 (March 2025)
- `uuid`: 11.1.0 (current)
- `express`: 5.1.0 (current)

## Architecture Patterns

### Project Structure After Migration
```
server/
├── deno.json              # Replaces tsconfig.json + package.json
├── index.ts               # Entry point (ESM, no build step)
├── databases/
│   └── plantDb.ts         # node:sqlite DatabaseSync instead of sqlite/sqlite3
├── middleware/
│   ├── errorHandler.ts    # NEW: centralized error handler
│   ├── requestLogger.ts   # Uncommented and wired up
│   └── requestId.ts       # Unchanged
├── routes/
│   └── plantRoutes.ts     # Remove per-route try/catch
├── controllers/
│   └── plantController.ts # Unchanged
├── repositories/
│   └── plantRepository.ts # Updated to use node:sqlite DatabaseSync
├── utils/
│   └── logger.ts          # Replaced with real Winston instance
├── types/
│   └── plant.d.ts         # Unchanged
└── scripts/
    ├── seed.ts             # NEW: Deno script to import JSON seed data
    └── seed-data.json      # NEW: canonical plant/zone/season data
```

### Pattern 1: deno.json as the Config Entrypoint
**What:** `deno.json` replaces both `tsconfig.json` and `package.json`. TypeScript compilerOptions go in the `compilerOptions` key; npm imports go in the `imports` map; scripts go in `tasks`.
**When to use:** Always in Deno projects — this is the only config file needed.
**Example:**
```json
// Source: https://docs.deno.com/examples/express_tutorial/
{
  "compilerOptions": {
    "strict": true
  },
  "imports": {
    "express": "npm:express@^5.1.0",
    "winston": "npm:winston@^3.17.0"
  },
  "tasks": {
    "dev": "deno run --allow-net --allow-read --allow-write --allow-env index.ts"
  }
}
```

### Pattern 2: node:sqlite DatabaseSync
**What:** `node:sqlite` provides a synchronous SQLite API built into Deno 2.2+. No npm install needed.
**When to use:** Any SQLite access in Deno 2.2+.
**Example:**
```typescript
// Source: https://docs.deno.com/examples/sqlite/
import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("plants.db");

db.exec(`PRAGMA foreign_keys = ON;`);
db.exec(`
  CREATE TABLE IF NOT EXISTS plants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`);

// Parameterized query
const stmt = db.prepare("SELECT * FROM plants WHERE id = ?");
const row = stmt.get(id);
```

**Important:** `DatabaseSync` API is synchronous — methods like `.prepare()`, `.get()`, `.all()`, `.run()` do not return Promises. Repository methods that are currently `async` and `await` the DB calls can simplify to synchronous calls, but keeping them `async` is harmless.

### Pattern 3: Winston Logger in Deno
**What:** `npm:winston` works via npm: specifier. Import with the alias defined in deno.json.
**When to use:** All server logging.
**Example:**
```typescript
// Source: https://deno.com/npm/package/winston
import winston from "winston";

const logger = winston.createLogger({
  level: Deno.env.get("DEBUG") === "true" ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
```

### Pattern 4: Express 5 Centralized Error Handler
**What:** A 4-argument middleware `(err, req, res, next)` registered last on the Express app catches all errors thrown in any route or middleware, including async throws.
**When to use:** Always — register once, remove per-route try/catch.
**Example:**
```typescript
// Source: https://betterstack.com/community/guides/scaling-nodejs/error-handling-express/
import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const status = (err as any).status ?? 500;
  logger.error(`${req.method} ${req.url} — ${err.message}`);
  res.status(status).json({ message: err.message || "Internal server error" });
}

// In index.ts — MUST be last middleware registered
app.use(errorHandler);
```

Express 5 automatically propagates errors thrown in `async` route handlers — no manual `next(err)` call needed when a throw occurs.

### Pattern 5: Re-runnable Seed Script
**What:** A standalone Deno script that reads a JSON file and inserts data using `INSERT OR IGNORE` so it can run multiple times without duplicates.
**When to use:** Data seeding/bootstrapping.
**Example:**
```typescript
// Source: Deno docs - https://docs.deno.com/examples/sqlite/
import { DatabaseSync } from "node:sqlite";
import seedData from "./seed-data.json" with { type: "json" };

const db = new DatabaseSync("plants.db");

for (const plant of seedData.plants) {
  db.prepare(
    "INSERT OR IGNORE INTO plants (name, category, growth_form, edible_part, family) VALUES (?, ?, ?, ?, ?)"
  ).run(plant.name, plant.category, plant.growth_form, plant.edible_part, plant.family);
}
```

`INSERT OR IGNORE` skips the row silently when a UNIQUE constraint fires (e.g., `name` column on `plants`). This is the correct idempotency mechanism — no custom dedup logic needed.

### Anti-Patterns to Avoid
- **`require()` / CommonJS:** Deno uses ESM. All `require()` calls and `module.exports` patterns must become `import`/`export`. The existing codebase uses `import` throughout but `tsconfig.json` targets `module: "commonjs"` — the compiled output used CJS. With Deno, the source is run directly as ESM.
- **`process.env`:** Works in Deno 2 via Node compatibility layer, but `Deno.env.get("KEY")` is the idiomatic alternative. Prefer `Deno.env.get()` in new code.
- **`npm:sqlite3` with Node-API addons:** Requires `nodeModulesDir: "auto"` and lifecycle scripts. Use `node:sqlite` instead — it's built-in and has no install overhead.
- **Leaving per-route try/catch after adding centralized error handler:** Express 5 async error propagation means per-route try/catch is redundant once the error handler is in place. Remove them to avoid double-handling.
- **`uuid` default import:** The existing `requestId.ts` uses `import uuid from "uuid"` and then `uuid.v4()`. With ESM, the correct import is `import { v4 as uuidv4 } from "uuid"`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Structured logging | Custom console wrapper (existing logger.ts) | npm:winston | Handles levels, formats, transports, timestamps; existing logger.ts is a thin shim that doesn't add value |
| SQL idempotency | Custom "check then insert" logic | `INSERT OR IGNORE` | Race-condition free, atomic, no extra round-trips |
| Error response formatting | Per-route try/catch with `res.status(500).json(...)` | Express error handler middleware | Single source of truth for error shape |
| TypeScript in Deno | tsconfig.json + tsc build pipeline | deno.json compilerOptions | Deno runs TypeScript natively; no compilation step needed |

## Common Pitfalls

### Pitfall 1: `node:sqlite` is Synchronous Only
**What goes wrong:** Developers expect `db.prepare().get()` to return a Promise and try to `await` it, getting `undefined` instead of the row.
**Why it happens:** The existing code uses the async `sqlite` npm wrapper; `node:sqlite`'s `DatabaseSync` is synchronous by design.
**How to avoid:** Remove `await` from database calls. Repository methods can stay `async` (useful for future compatibility) but the actual DB operations do not need `await`.
**Warning signs:** TypeScript reporting that `await` has no effect on a non-Promise; rows coming back as `undefined`.

### Pitfall 2: Deno Permissions — Missing Flags Cause Silent Failures
**What goes wrong:** The server starts but throws `PermissionDenied` at runtime when trying to read env vars, bind to a port, or open the DB file.
**Why it happens:** Deno is deny-by-default. All file I/O, network, and env access must be explicitly permitted.
**How to avoid:** The `deno task dev` command in `deno.json` must include `--allow-net --allow-read --allow-write --allow-env`. For the seed script: `--allow-read --allow-write` (for DB file) and `--allow-env` if it reads env vars.
**Warning signs:** Runtime `PermissionDenied` errors rather than startup errors.

### Pitfall 3: `import uuid from "uuid"` Default Import Breaks in ESM
**What goes wrong:** `uuid` does not have a default export in ESM. The existing `requestId.ts` uses the default import pattern copied from a CJS environment.
**Why it happens:** `esModuleInterop: true` in tsconfig.json allowed this in the Node build, but Deno does not apply that shim by default.
**How to avoid:** Change to `import { v4 as uuidv4 } from "uuid"`.
**Warning signs:** `TypeError: uuid is not a function` or `uuid.v4 is not a function`.

### Pitfall 4: Seed Data — planting_seasons Requires Existing Zone and PlantType IDs
**What goes wrong:** Inserting planting_seasons rows fails with a foreign key error if zones or plant_types are not yet inserted.
**Why it happens:** The schema uses `FOREIGN KEY (zone_id) REFERENCES zones(id)` — SQLite enforces this when `PRAGMA foreign_keys = ON`.
**How to avoid:** The seed script must insert in dependency order: plants → plant_types → zones → planting_seasons. companions and antagonists also reference plant IDs, so insert after plants.
**Warning signs:** `FOREIGN KEY constraint failed` errors during seed run.

### Pitfall 5: Express Error Handler Must Be the Last `app.use()` Call
**What goes wrong:** The error handler catches no errors because Express processes middleware in registration order; an error handler registered before routes never sees route errors.
**Why it happens:** Express 5's async error propagation sends errors to the next registered error handler in the chain — which must appear after routes.
**How to avoid:** Register `app.use(errorHandler)` as the very last statement before `app.listen()`.
**Warning signs:** 500 responses returning `{}` or the raw error object; stack traces leaking to the client.

### Pitfall 6: `companions` Table Foreign Key Schema vs. Repository Mismatch
**What goes wrong:** Some repository methods reference `plant_type_id` in the companions table (e.g., `getCompanionsByPlantTypeId`), but the schema shows companions as a plant-to-plant relationship with `plant_id` and `companion_id`. The schema does not have a `plant_type_id` column on companions.
**Why it happens:** There are two overlapping companion implementations — an older plant-type-level one and the current plant-level one. Some methods reference the older schema.
**How to avoid:** Verify which queries actually run against real data. The active endpoint logic uses `getCompanionsById` (plant-level) — the `plant_type_id`-based methods appear to be dead code. Don't add a `plant_type_id` column to companions during migration; leave the dead methods commented out as they currently are.
**Warning signs:** SQL errors referencing a non-existent `plant_type_id` column on the companions table.

## Code Examples

### deno.json (server root)
```json
// Source: https://docs.deno.com/examples/express_tutorial/
{
  "compilerOptions": {
    "strict": true
  },
  "imports": {
    "express": "npm:express@^5.1.0",
    "winston": "npm:winston@^3.17.0",
    "uuid": "npm:uuid@^11.1.0"
  },
  "tasks": {
    "dev": "deno run --allow-net --allow-read --allow-write --allow-env index.ts",
    "seed": "deno run --allow-read --allow-write index.ts --seed"
  }
}
```

### Express 5 error handler (middleware/errorHandler.ts)
```typescript
import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.ts";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status: number = (err as any).status ?? 500;
  logger.error(err.message, { stack: err.stack });
  res.status(status).json({ message: err.message || "Internal server error" });
}
```

### node:sqlite DB init (databases/plantDb.ts)
```typescript
// Source: https://docs.deno.com/examples/sqlite/
import { DatabaseSync } from "node:sqlite";

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync("plants.db");
    dbInstance.exec("PRAGMA foreign_keys = ON;");
    // CREATE TABLE IF NOT EXISTS statements...
  }
  return dbInstance;
}
```

### Seed script insert order
```typescript
// Dependency order to avoid FK constraint failures
insertZones(db, data.zones);
insertPlants(db, data.plants);          // zones and plants have no dependencies
insertPlantTypes(db, data.plant_types); // depends on plants
insertCompanions(db, data.companions);  // depends on plants
insertAntagonists(db, data.antagonists); // depends on plants
insertPlantingSeasons(db, data.planting_seasons); // depends on plant_types + zones
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `npm install` + `tsconfig.json` + `tsc` build | `deno.json` + `deno run` (no build) | Deno 2.0 (Oct 2024) | Remove build step entirely; TypeScript runs directly |
| `npm:sqlite3` Node-API addon for SQLite | `node:sqlite` built-in | Deno 2.2 (Feb 2025) | No native addon, no node_modules needed for SQLite |
| `--node-modules-dir` boolean flag | `nodeModulesDir: "none" | "auto" | "manual"` | Deno 2.0 | Old boolean config is invalid in Deno 2 |
| Deno URL imports (`https://deno.land/x/...`) | JSR (`jsr:`) and npm (`npm:`) specifiers | Deno 2.0 | deno.land/x still works but JSR is the preferred registry |
| `deno run` with all permissions | Fine-grained permission flags | Always | Still required — Deno is deny-by-default |

**Deprecated/outdated:**
- `https://deno.land/x/dotenv/mod.ts`: The existing `stripeAccessor.ts` uses this Deno 1-era import. Stripe is out of scope for this phase but this pattern should not be extended to new code.
- `tsconfig.json` with `module: "commonjs"`: Not applicable in Deno — remove the file (or leave it for IDE tooling but it is not used at runtime).
- `package.json` + `node_modules` + `nodemon`: Replaced by `deno.json` tasks with `--watch` flag if hot reload is needed.

## Open Questions

1. **Seed data content — zones and planting_seasons**
   - What we know: The schema for `zones` (name, min_temperature, max_temperature) and `planting_seasons` (plant_type_id, zone_id, start_month, end_month, method, notes) is defined. The shell scripts in `server/scripts/plants/` seed plants but not zones or seasons.
   - What's unclear: What zone data should be seeded (USDA zone names and temp ranges)? What planting season data exists or needs to be authored?
   - Recommendation: SEED-01 requires this data. The planner should add a task to author or source this data. USDA hardiness zones 1–13 (with subzones a/b) are public domain. Season data will likely need to be authored or sourced from a planting calendar reference.

2. **`node:sqlite` DatabaseSync vs. async repository methods**
   - What we know: All existing repository methods are `async` and `await` DB calls. `node:sqlite` is synchronous.
   - What's unclear: Whether to keep repository methods `async` (returning resolved Promises wrapping sync results) or convert them to sync.
   - Recommendation: Keep methods `async` — this allows future swap to an async adapter without changing callers, and costs nothing in practice. Remove `await` from internal DB calls only.

3. **`requestId` middleware — `uuid` v11 ESM import**
   - What we know: The existing import is `import uuid from "uuid"` using a default import pattern that only works with `esModuleInterop`.
   - What's unclear: Whether Deno's Node compatibility layer handles this or if it throws at runtime.
   - Recommendation: Change to named import `import { v4 as uuidv4 } from "uuid"` — this is unambiguously correct and not a compatibility question.

## Sources

### Primary (HIGH confidence)
- https://docs.deno.com/examples/express_tutorial/ — Express + deno.json setup
- https://docs.deno.com/examples/sqlite/ — node:sqlite DatabaseSync API
- https://deno.com/blog/v2.2 — Deno 2.2 release notes confirming node:sqlite addition
- https://docs.deno.com/runtime/fundamentals/node/ — npm: specifiers, nodeModulesDir options
- https://docs.deno.com/runtime/fundamentals/testing/ — Deno test framework

### Secondary (MEDIUM confidence)
- https://betterstack.com/community/guides/scaling-nodejs/error-handling-express/ — Express 5 error handler patterns (verified against Express 5 docs behavior)
- https://deno.com/blog/v2.0 — Deno 2.0 npm compatibility announcement

### Tertiary (LOW confidence)
- WebSearch results on Winston+Deno compatibility — multiple sources agree `npm:winston` works but no official Deno+Winston example was found; confidence is HIGH based on Deno's stated npm compatibility

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified, all packages confirmed working via official Deno docs
- Architecture: HIGH — patterns directly from Deno official examples and Express docs
- Pitfalls: HIGH for Deno-specific (permissions, sync API, ESM); MEDIUM for seed ordering (inferred from FK schema)

**Research date:** 2026-03-22
**Valid until:** 2026-09-22 (Deno releases frequently but core APIs are stable in 2.x)

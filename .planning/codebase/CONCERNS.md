# Codebase Concerns

**Analysis Date:** 2026-03-22

## Tech Debt

**Deno-to-Node migration incomplete:**
- Issue: Several server files still contain Deno-specific imports (`https://deno.land/x/oak`, `https://deno.land/std`, `npm:stripe`, `.ts` extensions on imports) and have not been ported to Node/Express.
- Files: `server/routes/authRoutes.ts`, `server/routes/zoneRoutes.ts`, `server/controllers/authController.ts`, `server/controllers/userController.ts`, `server/controllers/zoneController.ts`, `server/controllers/stripeController.ts`, `server/repositories/authRepository.ts`, `server/repositories/userRepository.ts`, `server/repositories/zoneRepository.ts`, `server/databases/userDb.ts`, `server/accessors/stripeAccessor.ts`, `server/models/models.ts`, `server/middleware/session.ts`
- Impact: All auth, user, zone, and Stripe functionality is entirely unreachable. The server only exposes plant routes. These files will not compile with the Node/ts-node toolchain in `server/package.json`.
- Fix approach: Port each file to Node/Express conventions — replace Oak Router with Express Router, replace Deno std imports with Node equivalents, remove `.ts` extensions from imports.

**Commented-out routes and controllers in index.ts:**
- Issue: Auth, user, zone, and Stripe routers are commented out in `server/index.ts` (lines 6–11). `requestLogger` and `requestId` middleware are also commented out.
- Files: `server/index.ts`
- Impact: No auth or zone endpoints are served. Middleware providing observability is disabled.
- Fix approach: Uncomment once Deno migration is complete.

**Massive dead code in plantController.ts:**
- Issue: ~70 lines of commented-out functions covering updatePlantType, deletePlantType, all planting season CRUD, and more.
- Files: `server/controllers/plantController.ts` (lines 61–128), `server/repositories/plantRepository.ts` (lines 70–80, 102–106, 137–141, 156–166)
- Impact: Unclear which features are planned vs. permanently dropped. Adds noise to every review.
- Fix approach: Delete dead code or track as open issues; do not leave in place.

**Duplicate PlantRepository instantiation:**
- Issue: `plantController.ts` creates its own `new PlantRepository()` (line 5) while `plantRepository.ts` also exports a singleton `plantRepository` (line 169). Both exist simultaneously with no clear convention.
- Files: `server/controllers/plantController.ts`, `server/repositories/plantRepository.ts`
- Impact: Confusing; two instances of the same class hold separate DB references in the same process.
- Fix approach: Use the exported singleton consistently; remove the local instantiation in the controller.

**Mixed directory naming (repositories vs. repository):**
- Issue: The global CLAUDE.md standard calls the layer `repository/` (singular). The project uses `repositories/` (plural). Similarly, `databases/` is used instead of a standard layer name.
- Files: `server/repositories/`, `server/databases/`
- Impact: Minor inconsistency with project-level conventions; creates friction for new contributors.
- Fix approach: Rename to `repository/` and move DB init into a `utilities/` or `databases/` module that aligns with the standard structure.

**Test files are orphaned Deno tests:**
- Issue: Both test files import from `jsr:@std/assert` and use `Deno.test()`. The server toolchain is now Node/Jest. The tests contain only trivial `1 + 2 === 3` assertions with no coverage of actual code.
- Files: `server/test/testing.ts`, `server/test/testing-action.ts`
- Impact: There is effectively zero automated test coverage for the server. No Jest config exists.
- Fix approach: Delete Deno test stubs; set up Jest with a `jest.config.ts`; write real unit/integration tests for repositories and routes.

**Logger is a hand-rolled console wrapper, not Winston:**
- Issue: `server/utils/logger.ts` is a custom object wrapping `console.log/warn/error`. The CLAUDE.md standard requires Winston.
- Files: `server/utils/logger.ts`
- Impact: No structured log output, no log levels/transports, no easy integration with log aggregators.
- Fix approach: Replace with `winston` — add it as a dependency and create a standard Winston logger instance.

## Known Bugs

**POST /api/plants returns wrong response body:**
- Symptoms: The create-plant route responds with `{ id: plant }` (the full plant object) instead of `{ id: <new id> }`.
- Files: `server/routes/plantRoutes.ts` (line 78)
- Trigger: POST `/api/plants` with valid body.
- Workaround: None; client receives the full plant object under the `id` key.

**createCompanion SQL has wrong parameter count:**
- Symptoms: Runtime error when calling `createCompanion` — the SQL has 2 placeholders but `db.run` is passed 3 values.
- Files: `server/repositories/plantRepository.ts` (line 90): `"INSERT INTO companions (plant_type_id, companion_id) VALUES (?, ?, ?)"` — 3 `?` for 2 columns.
- Trigger: Any call to `POST /api/plants/:id/companion/:companionId` that hits the old `createCompanion` path.
- Workaround: The newer `addCompanion` method (line 94) has correct SQL and is actually used by the route.

**deletePlant always returns true regardless of whether the row existed:**
- Symptoms: DELETE on a non-existent plant ID returns 204 instead of 404.
- Files: `server/repositories/plantRepository.ts` (line 43), `server/routes/plantRoutes.ts` (lines 114–119)
- Trigger: DELETE `/api/plants/<nonexistent-id>`.
- Workaround: None; callers cannot distinguish successful delete from no-op.

**Companion resolution only resolves companionId, not plantId:**
- Symptoms: When a plant is the *first* plant in the companions row (stored as `plant_id`), its companion entry shows `undefined` for name/category because the code always resolves `companion.companionId` but deletes both `companionId` and `plantId` before resolution.
- Files: `server/controllers/plantController.ts` (lines 31–40)
- Trigger: GET `/api/plants/:name/types` for a plant that appears as `plant_id` rather than `companion_id` in a companions row.
- Workaround: None at the API level.

**handleAddCompanion and handleAddAntagonist on PlantType page are stubs:**
- Symptoms: Clicking "Add Companion Plant" or "Add Antagonist Plant" buttons only logs to console; no UI action occurs.
- Files: `ui/src/pages/PlantType.jsx` (lines 31–38)
- Trigger: User interaction on the PlantType detail page.
- Workaround: None; feature is non-functional.

## Security Considerations

**No authentication on any active endpoint:**
- Risk: All plant CRUD routes (create, update, delete) are publicly accessible without any auth check.
- Files: `server/index.ts`, `server/routes/plantRoutes.ts`
- Current mitigation: None — auth routes and session middleware are entirely commented out.
- Recommendations: Complete the Deno-to-Node migration, uncomment auth routes, and apply session middleware to mutation endpoints.

**Error objects leaked to API clients:**
- Risk: Routes respond with `{ error: err }` — the raw caught error object. This can expose stack traces, SQL query structure, or internal file paths.
- Files: `server/routes/plantRoutes.ts` (lines 14, 34, 62, 81, 101, 122, 139, 157)
- Current mitigation: None.
- Recommendations: Respond with `{ message: "User-facing description" }` and log the full error internally.

**Session cookie missing Secure flag:**
- Risk: Auth session cookie is set with `HttpOnly` only; `Secure` flag is absent in `authRoutes.ts`.
- Files: `server/routes/authRoutes.ts` (line 37)
- Current mitigation: None (route currently unreachable due to commented-out import).
- Recommendations: Add `; Secure; SameSite=Strict` when setting the session cookie.

**Port hardcoded, no environment-based config:**
- Risk: Server always binds to port 8000 with no way to override via environment.
- Files: `server/index.ts` (line 14)
- Current mitigation: Acceptable for local dev only.
- Recommendations: Use `process.env.PORT || 8000`.

## Performance Bottlenecks

**N+1 query pattern for companion/antagonist resolution:**
- Problem: `getPlantTypesByPlantIdWithCompanionsAndAtagonists` fetches all companion IDs then issues one `getPlantById` query per companion in a loop, and repeats the same for antagonists.
- Files: `server/controllers/plantController.ts` (lines 30–53)
- Cause: Sequential per-row DB calls instead of a JOIN or an `IN (...)` query.
- Improvement path: Replace with a single JOIN query that fetches companion plant details alongside companion rows in `plantRepository.ts`.

**New DB connection opened per-request for plant operations:**
- Problem: `getDatabase()` is called at the start of every repository method. While it returns a cached singleton, the async call adds overhead on every operation.
- Files: `server/databases/plantDb.ts`, `server/repositories/plantRepository.ts`
- Cause: Lazy initialization pattern with no connection lifecycle management.
- Improvement path: Initialize the DB once at server startup and inject via constructor or module-level singleton.

## Fragile Areas

**`/:id` and `/:name/types` route conflict:**
- Files: `server/routes/plantRoutes.ts` (lines 19 and 39)
- Why fragile: Express matches `/:id` before `/:name/types` unless routes are ordered carefully. Currently `/:name/types` is defined after `/:id`, but the `/:id` handler will match a plant name string (since Express does not type-check params), silently returning a 404 from the ID lookup instead of the types endpoint.
- Safe modification: Always define specific routes (`/:name/types`) before generic parameter routes (`/:id`), or use distinct path prefixes.
- Test coverage: No tests exist for routing behavior.

**`plantData` assumed non-null in PlantType UI:**
- Files: `ui/src/pages/PlantType.jsx` (line 61)
- Why fragile: `plantData.name` is accessed directly without a null guard after the loading/error states are handled. A race condition or unexpected `null` from the API would cause an uncaught runtime error.
- Safe modification: Add a null check before rendering plant data fields.
- Test coverage: None.

## Scaling Limits

**SQLite single-writer constraint:**
- Current capacity: Suitable for a single local user or very low concurrency.
- Limit: SQLite serializes all writes; concurrent mutations will queue and eventually time out under load.
- Scaling path: Migrate to PostgreSQL when multi-user or production deployment is needed.

## Dependencies at Risk

**`express` pinned to v5 (release candidate):**
- Risk: `express@^5.1.0` is a major version that was still in pre-release/RC status at the time of the project's last update. APIs may break.
- Impact: Unexpected runtime behavior; limited community support and documentation.
- Migration plan: Pin to `express@^4.x` for stability, or accept v5 deliberately and test thoroughly.

## Missing Critical Features

**No input sanitization or validation library:**
- Problem: Request bodies are validated with manual `if (!field)` checks. There is no schema validation (e.g., Zod, Joi, class-validator).
- Blocks: Type safety at the API boundary; consistent 400 error responses with field-level detail.

**No migration system for the database:**
- Problem: The database schema is defined inline in `server/databases/plantDb.ts` using `CREATE TABLE IF NOT EXISTS`. There is no migration history, no way to apply schema changes to an existing database, and no rollback support.
- Blocks: Any schema change (e.g., adding a column) must be applied manually to existing databases.

**No UI service layer:**
- Problem: Axios calls are made directly inside page components (`Plants.jsx`, `PlantType.jsx`) and a component (`AddPlantCard.tsx`). There is no `services/` layer as specified in `CLAUDE.md`.
- Blocks: Reuse of API logic; consistent error handling; easy mocking in tests.

## Test Coverage Gaps

**Server has zero effective test coverage:**
- What's not tested: All routes, controllers, repository methods, and database operations.
- Files: `server/routes/`, `server/controllers/`, `server/repositories/`
- Risk: Any refactor or schema change can silently break the API.
- Priority: High

**UI has zero test coverage:**
- What's not tested: All components and pages — add plant, edit plant, delete plant, companion/antagonist display.
- Files: `ui/src/components/`, `ui/src/pages/`
- Risk: Regressions in user-facing flows go undetected.
- Priority: High

---

*Concerns audit: 2026-03-22*

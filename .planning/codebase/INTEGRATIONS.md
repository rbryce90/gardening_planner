# External Integrations

**Analysis Date:** 2026-03-22

## APIs & External Services

**Payment Processing:**
- Stripe - Customer management and billing
  - SDK/Client: `npm:stripe` (referenced via Deno import in `server/accessors/stripeAccessor.ts` — not wired into the active Node.js server)
  - Auth: `STRIPE_SECRET_KEY` env var
  - API Version pinned: `2024-06-20`
  - Operations implemented: `balance.retrieve()`, `customers.create()`
  - Status: inactive — `stripeRoutes.ts` and `stripeController.ts` exist but the route is commented out in `server/index.ts`

## Data Storage

**Databases:**
- SQLite (plant data) — active
  - File: `plants.db` (relative to server working directory, excluded from git via `server/.gitignore`)
  - Client: `sqlite3` 5.1 + `sqlite` 5.1 async wrapper
  - Initialization: `server/databases/plantDb.ts` — singleton pattern with lazy init
  - Tables: `plants`, `plant_types`, `companions`, `antagonists`, `zones`, `planting_seasons`
  - Foreign keys enabled via `PRAGMA foreign_keys = ON`

- SQLite (user data) — inactive/legacy
  - File: `user.db`
  - Client: Deno `https://deno.land/x/sqlite/mod.ts` — not compatible with current Node.js runtime
  - Location: `server/databases/userDb.ts`
  - Tables: `users`, `sessions`
  - Status: leftover from Deno era; not used by active Node.js server

**File Storage:**
- Local filesystem only (SQLite `.db` files on disk)

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- Custom session-based auth (legacy, currently inactive)
  - Implementation: session ID stored in cookie, session record in `sessions` table
  - Repository: `server/repositories/authRepository.ts`
  - Middleware: `server/middleware/session.ts` — fully commented out
  - Routes: `server/routes/authRoutes.ts` — commented out in `server/index.ts`
  - Password hashing: `server/utils/hash.ts` — fully commented out (was bcrypt via Deno)
  - Status: all auth code is inactive; no auth protection on any current route

**User Registration Flow (inactive):**
- Creating a user triggers Stripe customer creation first; `stripe_customer_id` is stored in `users` table

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- Custom lightweight logger at `server/utils/logger.ts`
- Outputs `[INFO]`, `[WARN]`, `[ERROR]`, `[DEBUG]` prefixed lines with ISO timestamps to stdout/stderr
- Not Winston — a hand-rolled wrapper around `console.log/warn/error/debug`
- `[DEBUG]` level gated on `DEBUG=true` env var
- Request logging middleware exists at `server/middleware/requestLogger.ts` but is commented out in `server/index.ts`
- Request ID middleware exists at `server/middleware/requestId.ts` but is commented out in `server/index.ts`

## CI/CD & Deployment

**Hosting:**
- Not configured

**CI Pipeline:**
- None

## Environment Configuration

**Required env vars (active):**
- None currently required by the running server

**Required env vars (inactive code):**
- `STRIPE_SECRET_KEY` — needed by `server/accessors/stripeAccessor.ts` when Stripe is re-enabled
- `DEBUG` — optional; enables debug log output

**Secrets location:**
- No `.env` file present; secrets would need to be added at project root when enabling Stripe or auth

## Webhooks & Callbacks

**Incoming:**
- None active

**Outgoing:**
- None active

---

*Integration audit: 2026-03-22*

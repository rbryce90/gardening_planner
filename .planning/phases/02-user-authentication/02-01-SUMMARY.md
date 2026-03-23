---
phase: 02-user-authentication
plan: 01
subsystem: auth
tags: [jwt, bcryptjs, jose, cookie-parser, sqlite, express]

# Dependency graph
requires:
  - phase: 01-deno-migration-and-infrastructure
    provides: DatabaseSync singleton pattern, Express 5 server with errorHandler middleware
provides:
  - POST /api/auth — register with HttpOnly JWT cookie
  - POST /api/auth/login — login with HttpOnly JWT cookie
  - GET /api/auth/me — protected user info endpoint
  - authMiddleware — reusable JWT verification middleware for route protection
  - userRepository — createUser/findByEmail/findById database operations
affects: [02-02-frontend-auth, 03-garden-builder, 04-seasonal-calendar]

# Tech tracking
tech-stack:
  added: [bcryptjs, jose, cookie-parser]
  patterns: [HttpOnly JWT cookies, Express auth middleware, DatabaseSync user repository]

key-files:
  created:
    - server/types/user.d.ts
    - server/databases/userDb.ts
    - server/utils/hash.ts
    - server/repositories/userRepository.ts
    - server/controllers/authController.ts
    - server/middleware/auth.ts
    - server/routes/authRoutes.ts
  modified:
    - server/deno.json
    - server/types/express.d.ts
    - server/index.ts

key-decisions:
  - "JWT stored in HttpOnly cookie (not localStorage) for XSS protection"
  - "Users table added to plants.db (same file) to keep single-DB architecture"
  - "7-day token expiry with no refresh rotation — sufficient for v1"

patterns-established:
  - "Auth pattern: register/login return token via res.cookie with httpOnly:true, sameSite:lax"
  - "Protected routes: apply authMiddleware inline as second argument to router method"
  - "Error propagation: throw Object.assign(new Error(msg), { status: N }) to hit centralized errorHandler"

requirements-completed: [AUTH-01, AUTH-02]

# Metrics
duration: 17min
completed: 2026-03-23
---

# Phase 02 Plan 01: Server-Side Authentication Summary

**HttpOnly JWT cookie auth via jose/bcryptjs with register, login, and /me endpoints wired into Express 5 server**

## Performance

- **Duration:** 17 min
- **Started:** 2026-03-23T00:33:00Z
- **Completed:** 2026-03-23T00:50:49Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Users table added to plants.db via DatabaseSync singleton pattern consistent with plantDb.ts
- bcryptjs password hashing (12 rounds) and jose HS256 JWT signing/verification
- POST /api/auth register returns 201 with Set-Cookie token, 409 on duplicate email
- POST /api/auth/login returns 200 with Set-Cookie token, 401 on wrong credentials
- GET /api/auth/me returns user data with valid cookie, 401 without
- Reusable authMiddleware exports for protecting future routes

## Task Commits

Each task was committed atomically:

1. **Task 1: Add dependencies, user types, userDb, hash utility, and userRepository** - `5c7d423` (feat)
2. **Task 2: Auth controller, auth middleware, auth routes, and wire into server entry point** - `58ec069` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `server/deno.json` - Added bcryptjs, jose, cookie-parser deps; updated dev task with --env-file=.env
- `server/types/user.d.ts` - User type definition
- `server/types/express.d.ts` - Added user?: { userId, email } to Express Request augmentation
- `server/databases/userDb.ts` - DatabaseSync singleton creating users table in plants.db
- `server/utils/hash.ts` - bcryptjs hashPassword/comparePassword wrappers
- `server/repositories/userRepository.ts` - Class-based createUser/findByEmail/findById
- `server/controllers/authController.ts` - signToken/verifyToken/register/login using jose
- `server/middleware/auth.ts` - JWT cookie verification middleware attaching req.user
- `server/routes/authRoutes.ts` - Express Router for POST /, POST /login, GET /me
- `server/index.ts` - Added cookieParser and authRouter at /api/auth
- `server/.gitignore` - Added .env entry

## Decisions Made
- JWT stored in HttpOnly cookie (not localStorage) for XSS protection, consistent with plan spec
- Users table added to plants.db (same file as plant data) to maintain single-database architecture
- 7-day token expiry with no refresh rotation — sufficient for v1 garden planner
- bcryptjs salt rounds set to 12 (plan specified 12) — reasonable security/performance balance

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Ran deno install after adding new dependencies**
- **Found during:** Task 1 (type check verification)
- **Issue:** deno check failed because bcryptjs package was not downloaded yet
- **Fix:** Ran `deno install` to fetch and cache new npm packages
- **Files modified:** server/deno.lock
- **Verification:** All deno check calls passed after install
- **Committed in:** 5c7d423 (Task 1 commit, deno.lock included)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Single `deno install` needed after adding npm deps — standard workflow, no scope change.

## Issues Encountered
None beyond the expected `deno install` step for new packages.

## User Setup Required
None — server/.env with JWT_SECRET=dev-secret-change-in-production is created locally and gitignored. No external services needed.

## Next Phase Readiness
- All auth endpoints functional and verified via curl
- authMiddleware ready to protect garden/layout routes in Phase 3
- Frontend auth forms (Phase 02 Plan 02) can now wire against working endpoints

---
*Phase: 02-user-authentication*
*Completed: 2026-03-23*

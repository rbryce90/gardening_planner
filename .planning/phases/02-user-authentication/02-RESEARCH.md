# Phase 2: User Authentication - Research

**Researched:** 2026-03-22
**Domain:** Express 5 + Deno 2 JWT authentication with HttpOnly cookies
**Confidence:** HIGH

## Summary

Phase 2 adds user registration and login backed by JWT tokens stored in HttpOnly cookies. The server runs on Deno 2 with Express 5, so the npm package choices must work within that runtime. The scaffolded auth code (authController, authRepository, userRepository, authRoutes, userDb, session.ts, hash.ts) is written for the old Deno/Oak framework and needs to be fully rewritten to use Express patterns matching Phase 1.

The existing `userDb.ts` uses `https://deno.land/x/sqlite/mod.ts` (the old Deno sqlite package), which must be replaced with the Phase 1 pattern: `node:sqlite` `DatabaseSync`, initialized via a `getDatabase()` singleton in a new `userDb.ts`. The existing `users` and `sessions` table schema from `userDb.ts` defines the data model — sessions will be dropped in favor of stateless JWT.

The existing `hash.ts` was written for a Deno-era bcrypt module that is now commented out. The replacement is `npm:bcryptjs`, which is pure JavaScript and works reliably in Deno 2 (the `npm:bcrypt` C++ native addon has known compatibility issues in Deno). For JWT, `npm:jsonwebtoken` does not work with ESM/Deno — use `npm:jose` (v6) instead, which is explicitly designed for Deno 2 and all Web-interoperable runtimes.

**Primary recommendation:** `npm:bcryptjs` for password hashing, `npm:jose` for JWT sign/verify, `npm:cookie-parser` for reading the cookie on the server, and `axios` with `withCredentials: true` on the frontend.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | User can create account with email and password | userRepository.createUser pattern exists; needs bcryptjs for password hashing, userDb rewrite for node:sqlite, stripped-down User model (no Stripe, no phone) |
| AUTH-02 | User can log in and stay logged in across browser refresh (JWT HttpOnly cookie) | jose SignJWT/jwtVerify replaces sessions table; cookie-parser reads the token; auth middleware guards protected routes; React axios needs withCredentials:true |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| bcryptjs | 3.0.3 | Password hashing | Pure JS — no native C++ addon, works in Deno 2 without issues; `npm:bcrypt` has known Deno compatibility failures |
| jose | 6.2.2 | JWT sign and verify | Explicitly built for Deno, Bun, Cloudflare Workers — `jsonwebtoken` does not work with ESM/Deno |
| cookie-parser | 1.4.7 | Parse incoming cookies on req.cookies | Standard Express middleware; needed to read the JWT HttpOnly cookie |
| @types/cookie-parser | ^1.4.x | TypeScript types for cookie-parser | cookie-parser has no bundled types |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| node:crypto | built-in | JWT secret generation | Deno 2 exposes Node built-ins; use `crypto.randomBytes(64).toString('hex')` to generate JWT_SECRET in .env |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jose | jsonwebtoken | jsonwebtoken does not support ESM and breaks in Deno — do not use |
| jose | djwt (deno.land/x) | djwt works but is Deno-specific; jose works everywhere and is in deno.json import map cleanly as npm: |
| bcryptjs | bcrypt (native) | bcrypt uses C++ native bindings that fail in Deno 2; bcryptjs is pure JS with the same API |
| bcryptjs | Deno Web Crypto (manual) | Bcryptjs is simpler and already proven; Web Crypto is lower-level and more error-prone |
| JWT stateless | sessions table | Sessions require DB lookups on every request; JWT is stateless and simpler for this app |

**Installation (add to `server/deno.json` imports):**
```json
"bcryptjs": "npm:bcryptjs@^3.0.3",
"@types/bcryptjs": "npm:@types/bcryptjs@^3.0.0",
"jose": "npm:jose@^6.0.0",
"cookie-parser": "npm:cookie-parser@^1.4.7",
"@types/cookie-parser": "npm:@types/cookie-parser@^1.4.8"
```

**Version verification:** Verified via npm registry data gathered during research session (2026-03-22):
- bcryptjs: 3.0.3 (last published ~5 months ago)
- jose: 6.2.2 (current)
- cookie-parser: 1.4.7 (current)
- jsonwebtoken: 9.0.2 — confirmed NOT usable in Deno due to ESM incompatibility

## Architecture Patterns

### Recommended Project Structure

The Phase 1 architecture pattern (Routes → Controllers → Repositories → Database) must be followed. All new files go in the existing directories:

```
server/
├── databases/
│   └── userDb.ts         # NEW — rewrite using DatabaseSync (node:sqlite), same singleton pattern as plantDb.ts
├── repositories/
│   └── userRepository.ts # REWRITE — replace deno.land/x/sqlite calls with DatabaseSync prepare().get/run
├── controllers/
│   └── authController.ts # REWRITE — remove Stripe dependency, return userId on register, return JWT on login
├── routes/
│   └── authRoutes.ts     # REWRITE — replace Oak Router with Express Router, same pattern as plantRoutes.ts
├── middleware/
│   └── auth.ts           # NEW — JWT verification middleware; attaches user to req; throws 401 if missing/invalid
├── utils/
│   └── hash.ts           # REWRITE — uncomment and replace deno.land/x/bcrypt with npm:bcryptjs
├── types/
│   └── user.d.ts         # NEW — User type; update express.d.ts to augment req.user
└── index.ts              # UPDATE — add cookie-parser middleware; mount authRouter at /api/auth
```

### Pattern 1: userDb.ts — DatabaseSync singleton matching plantDb.ts

**What:** Lazy-initialized `DatabaseSync` instance from `node:sqlite`. Schema runs once on first call.
**When to use:** All user and auth-related DB access.

```typescript
// Matches plantDb.ts pattern from Phase 1
import { DatabaseSync } from "node:sqlite";
import logger from "../utils/logger.ts";

let dbInstance: DatabaseSync | null = null;

const initializeDatabase = (): DatabaseSync => {
    if (dbInstance) return dbInstance;
    const db = new DatabaseSync("plants.db"); // use same DB file, add users table
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );
    `);
    logger.info("User database initialized.");
    dbInstance = db;
    return db;
};

export function getDatabase(): DatabaseSync { ... }
```

**Important:** Use a single `plants.db` file for all tables (plants + users). Do not create a separate `user.db`. The existing `userDb.ts` creates `user.db` — that will be replaced.

**User schema simplification:** The scaffolded `users` table has `stripe_customer_id`, `phone_number`, and `middle_name` — all Stripe-era fields. Phase 2 only needs: `id`, `email`, `password`, `first_name`, `last_name`. The sessions table is dropped entirely (stateless JWT).

### Pattern 2: Repository — DatabaseSync prepare().get/run pattern

**What:** Follows the established Phase 1 pattern from `plantRepository.ts`.

```typescript
// Source: Phase 1 plantRepository.ts pattern
import { getDatabase } from "../databases/userDb.ts";
import bcrypt from "bcryptjs";

export class UserRepository {
    async createUser(email: string, password: string, firstName: string, lastName: string): Promise<number> {
        const db = getDatabase();
        const hashed = await bcrypt.hash(password, 12);
        const result = db.prepare(
            "INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?) RETURNING id"
        ).get(email, hashed, firstName, lastName) as { id: number };
        return result.id;
    }

    async findByEmail(email: string): Promise<{ id: number; email: string; password: string } | null> {
        const db = getDatabase();
        return db.prepare("SELECT id, email, password, first_name, last_name FROM users WHERE email = ?")
            .get(email) as any ?? null;
    }
}

export const userRepository = new UserRepository();
```

### Pattern 3: JWT sign and verify with jose

**What:** Sign a JWT on login; verify on protected routes.

```typescript
// Source: jose docs — https://github.com/panva/jose
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(Deno.env.get("JWT_SECRET")!);

// Sign
const token = await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

// Verify
const { payload } = await jwtVerify(token, secret);
```

### Pattern 4: Set JWT as HttpOnly cookie on login response

```typescript
// In auth route POST /login
res.cookie("token", token, {
    httpOnly: true,
    secure: false,       // set true in production (HTTPS)
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in ms
});
res.status(200).json({ message: "Login successful" });
```

### Pattern 5: Auth middleware for protected routes

```typescript
// server/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(Deno.env.get("JWT_SECRET")!);

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
    const token = req.cookies?.token;
    if (!token) {
        const err = new Error("Unauthorized") as any;
        err.status = 401;
        return next(err);
    }
    try {
        const { payload } = await jwtVerify(token, secret);
        (req as any).user = payload;
        next();
    } catch {
        const err = new Error("Unauthorized") as any;
        err.status = 401;
        next(err);
    }
}
```

This follows the centralized error handler pattern from Phase 1: throw/next(err) with `err.status`, caught by `errorHandler` in `middleware/errorHandler.ts`.

### Pattern 6: Express Request augmentation for req.user

```typescript
// server/types/express.d.ts (update existing file)
declare namespace Express {
    interface Request {
        requestId?: string;    // already present
        user?: { userId: number; email: string };  // ADD THIS
    }
}
```

### Pattern 7: Frontend axios withCredentials

```javascript
// All axios calls that need auth — must include credentials so browser sends the cookie
axios.get("/api/gardens", { withCredentials: true });

// Or configure globally in a service setup
const api = axios.create({ baseURL: "/api", withCredentials: true });
```

### Anti-Patterns to Avoid

- **Using `npm:bcrypt` instead of `npm:bcryptjs`:** The native bcrypt addon fails in Deno 2 with known issues (see GitHub issue #24937). Always use bcryptjs.
- **Using `npm:jsonwebtoken`:** Does not support ESM and is incompatible with Deno. Use `npm:jose` instead.
- **Storing JWT in localStorage:** XSS-accessible. Use HttpOnly cookies only.
- **Creating a separate user.db file:** Adds complexity with no benefit. Add the `users` table to the existing `plants.db`.
- **Reusing the sessions table approach:** The old code stores sessions in SQLite. Replace entirely with stateless JWT — no sessions table needed.
- **Importing from `https://deno.land/x/`:** The scaffolded authRoutes.ts and userDb.ts still import from Oak (`https://deno.land/x/oak`) and old sqlite (`https://deno.land/x/sqlite`). These must be replaced with Express and `node:sqlite` respectively.
- **Including Stripe in createUser:** The existing `authController.ts` calls `createCustomer` (Stripe) during registration. Stripe is out of scope for Phase 2 — remove this entirely.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | Custom crypto hash | `bcryptjs.hash(pwd, 12)` | Salt, cost factor, timing-safe compare are all handled |
| JWT creation | Manual base64+HMAC | `jose SignJWT` | Header/payload encoding, algorithm handling, expiry math |
| JWT verification | Manual decode+verify | `jose jwtVerify` | Clock skew, expiry check, signature verification, error typing |
| Cookie parsing | Manual `req.headers.cookie` parse | `cookie-parser` middleware | URL encoding, signed cookies, edge cases |
| Timing-safe password compare | `===` string compare | `bcryptjs.compare()` | Prevents timing attacks that reveal whether email or password is wrong |

**Key insight:** Password hashing and JWT both have subtle security edge cases (timing attacks, algorithm confusion, expiry bypass) that are easy to get wrong. The listed libraries have years of security audits behind them.

## Common Pitfalls

### Pitfall 1: Using npm:bcrypt instead of npm:bcryptjs in Deno
**What goes wrong:** `bcrypt` uses a prebuilt C++ native binary addon. In Deno 2, this either fails to load or (post-2.5) runs ~600x slower than expected.
**Why it happens:** Deno's node compatibility layer handles pure-JS npm packages well but struggles with native bindings.
**How to avoid:** Always use `npm:bcryptjs` (pure JavaScript implementation with the same API).
**Warning signs:** Unusually slow bcrypt calls (>10 seconds) or import errors mentioning native bindings.

### Pitfall 2: jsonwebtoken ESM incompatibility
**What goes wrong:** `import jwt from "npm:jsonwebtoken"` fails at runtime in Deno or produces CJS/ESM interop errors.
**Why it happens:** jsonwebtoken uses CommonJS and relies on Node-specific crypto APIs that aren't fully shimmed in Deno's ESM environment.
**How to avoid:** Use `npm:jose` which is written as ESM and targets Web Crypto API directly.
**Warning signs:** Runtime error about `require` or module resolution failures on first import.

### Pitfall 3: Missing withCredentials on frontend axios calls
**What goes wrong:** The browser does not send the HttpOnly cookie on API requests, so all authenticated calls get 401.
**Why it happens:** By default, axios does not send cookies on cross-origin requests (and the dev server proxies make this technically cross-origin at the transport level).
**How to avoid:** Set `withCredentials: true` on every axios call or on the base axios instance.
**Warning signs:** 401 responses despite just logging in; `req.cookies.token` is undefined on the server.

### Pitfall 4: Cookie SameSite causing login cookie to not be sent
**What goes wrong:** Login succeeds and sets the cookie, but subsequent requests don't include it.
**Why it happens:** `SameSite: "strict"` blocks cookies on redirects; browser default may block cross-context POST.
**How to avoid:** Use `sameSite: "lax"` for development. This allows cookie on top-level navigation and same-origin requests.
**Warning signs:** Cookie visible in browser DevTools but not sent in request headers.

### Pitfall 5: Forgetting to initialize userDb in the server entry point
**What goes wrong:** The `users` table never gets created; first registration call fails with "no such table".
**Why it happens:** DatabaseSync schema runs lazily on first `getDatabase()` call — if nothing calls it at startup, the table won't exist until the route hits it, which is actually fine, but if the DB file from Phase 1 doesn't have the table it fails silently until a user tries to register.
**How to avoid:** Call `initializeDatabase()` or ensure it runs at startup, same pattern as plantDb. Alternatively, ensure `getDatabase()` is called from `userRepository` on module load or accept lazy init works fine.
**Warning signs:** `SQLITE_ERROR: no such table: users` on first POST /api/auth/register.

### Pitfall 6: Scaffolded authController creates a Stripe customer
**What goes wrong:** `authController.ts` calls `createCustomer` on every registration, which tries to hit the Stripe API and fails without credentials.
**Why it happens:** Old scaffolding assumed Stripe integration.
**How to avoid:** Rewrite authController entirely — do not import or use stripeController.
**Warning signs:** Registration returns 500 with "Error creating customer".

### Pitfall 7: Oak Router patterns carried into Express authRoutes
**What goes wrong:** The scaffolded `authRoutes.ts` uses `context.request.body.json()`, `context.response.status`, and imports from `https://deno.land/x/oak`. None of this is valid in Express.
**Why it happens:** It was written for Oak and never migrated.
**How to avoid:** Rewrite completely, following `plantRoutes.ts` as the template (`req.body`, `res.status().json()`, `express Router()`).

## Code Examples

### bcryptjs hash and compare (verified via npm:bcryptjs 3.0.3)
```typescript
import bcrypt from "bcryptjs";

// Hash during registration (cost factor 12 is standard)
const hashed = await bcrypt.hash(password, 12);

// Compare during login
const valid = await bcrypt.compare(password, storedHash);
if (!valid) throw Object.assign(new Error("Invalid credentials"), { status: 401 });
```

### jose JWT sign and verify
```typescript
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(Deno.env.get("JWT_SECRET")!);

// Sign — called in auth controller on successful login
export const signToken = async (userId: number, email: string): Promise<string> => {
    return await new SignJWT({ userId, email })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
};

// Verify — called in auth middleware
export const verifyToken = async (token: string) => {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: number; email: string };
};
```

### cookie-parser setup in index.ts
```typescript
import cookieParser from "cookie-parser";

app.use(express.json());
app.use(cookieParser());          // must come before routes
app.use(requestIdMiddleware);
app.use(requestLogger);
app.use("/api/auth", authRouter);
app.use(errorHandler);
```

### Applying auth middleware to a route
```typescript
import { authMiddleware } from "../middleware/auth.ts";

// Future garden routes — not in Phase 2 but shows the pattern
gardenRouter.use(authMiddleware);

// Or per-route
router.get("/profile", authMiddleware, async (req, res) => { ... });
```

### React login form pattern (axios withCredentials)
```javascript
// ui/src/services/authService.js (new file following project convention)
import axios from "axios";

export const register = (firstName, lastName, email, password) =>
    axios.post("/api/auth/register", { firstName, lastName, email, password }, { withCredentials: true });

export const login = (email, password) =>
    axios.post("/api/auth/login", { email, password }, { withCredentials: true });
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| sessions table in SQLite | Stateless JWT in HttpOnly cookie | Post-2018 ecosystem shift | No server-side session store needed |
| `deno.land/x/bcrypt` | `npm:bcryptjs` via Deno npm specifier | Deno 2 npm compatibility | Simpler, more reliable in Deno |
| `jsonwebtoken` | `jose` | ~2023 (ESM ecosystem shift) | Works in Deno, Bun, edge runtimes |
| Oak Router (deno.land/x/oak) | Express 5 via npm: specifier | Phase 1 migration | Already done in Phase 1 |
| `deno.land/x/sqlite` | `node:sqlite` DatabaseSync | Phase 1 migration | Already done in Phase 1 |

**Deprecated/outdated in this codebase:**
- `https://deno.land/x/sqlite/mod.ts` in userDb.ts: replaced by `node:sqlite`
- `https://deno.land/x/oak` in authRoutes.ts and userRoutes.ts: replaced by `npm:express`
- `https://deno.land/x/bcrypt` in hash.ts (commented out): replaced by `npm:bcryptjs`
- `https://deno.land/std@0.62.0/uuid/v4.ts` in authRepository.ts: replaced by `npm:uuid` (already in deno.json)
- Sessions table approach: replaced by stateless JWT

## Open Questions

1. **Single DB file vs separate user.db**
   - What we know: Phase 1 uses `plants.db` via the singleton in `plantDb.ts`. The old scaffold created `user.db` separately.
   - What's unclear: Whether the planner wants one DB file or two.
   - Recommendation: Use a single `plants.db` for simplicity. Add the `users` table to the existing `plantDb.ts` initialization, or create a `userDb.ts` that opens the same file. A single file is simpler and SQLite handles multiple tables fine.

2. **User model scope**
   - What we know: The old `User` type includes `stripeCustomerId`, `phoneNumber`, `middleName` — all out of scope.
   - What's unclear: Whether `firstName`/`lastName` are required or just `email`+`password` is enough for Phase 2.
   - Recommendation: Keep `firstName` and `lastName` — they appear in the success criteria ("redirected to their dashboard") and are useful for UI display. Drop Stripe and phone fields.

3. **JWT_SECRET in .env**
   - What we know: The project has no `.env` file currently. The CLAUDE.md says to load via `dotenv`.
   - What's unclear: Phase 1 did not add dotenv support to the Deno server.
   - Recommendation: Use `Deno.env.get("JWT_SECRET")` directly — Deno reads env vars natively without dotenv. Add a `.env` file and pass `--env-file=.env` to the deno task, or set `JWT_SECRET` in the `dev` task in `deno.json`. This is a Phase 2 task item.

## Sources

### Primary (HIGH confidence)
- Phase 1 codebase (plantDb.ts, plantRepository.ts, plantRoutes.ts, errorHandler.ts) — established patterns to follow
- Scaffolded auth code (authController.ts, authRepository.ts, userRepository.ts, authRoutes.ts, userDb.ts, hash.ts, session.ts) — existing structure, needs full rewrite
- https://github.com/panva/jose — jose official repo, Deno support documented
- bcryptjs npm page — version 3.0.3, types bundled, pure JS

### Secondary (MEDIUM confidence)
- https://github.com/denoland/deno/issues/24937 — `npm:bcrypt` native addon failures in Deno (confirmed by multiple reporters)
- WebSearch: bcryptjs 3.0.3 bundles its own TypeScript types (verified by libraries.io and npm search result)
- WebSearch: jose 6.2.2 is current version (npm search result, 2026-03-22)
- WebSearch: cookie-parser 1.4.7 is current stable (npm search result)

### Tertiary (LOW confidence)
- WebSearch: jsonwebtoken ESM incompatibility with Deno — flagged in multiple community posts; treat as HIGH risk until verified in project

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — bcryptjs/jose/cookie-parser are well-documented and their Deno 2 compatibility is verified via issues and official docs
- Architecture: HIGH — directly mirrors Phase 1 patterns from the existing codebase
- Pitfalls: HIGH for bcrypt/jsonwebtoken (verified via Deno GitHub issues); MEDIUM for cookie/CORS pitfalls (community sources)

**Research date:** 2026-03-22
**Valid until:** 2026-06-22 (jose and bcryptjs are stable; Deno 2 npm compat evolves faster — re-verify in 90 days)

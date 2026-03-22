# Technology Stack

**Analysis Date:** 2026-03-22

## Languages

**Primary:**
- TypeScript 5.8 - Server (`server/`) and shared type definitions
- JavaScript (JSX) - UI components (`ui/src/`)

**Secondary:**
- TypeScript (TSX) - Some UI components (`ui/src/components/AddPlantCard.tsx`, `ui/src/models/models.ts`, `ui/src/utils/utils.ts`)

## Runtime

**Environment:**
- Node.js (version not pinned; no `.nvmrc` or `.node-version` present)

**Package Manager:**
- npm
- Lockfiles: present in both `server/package-lock.json` (lockfileVersion 3) and `ui/package-lock.json`

## Frameworks

**Server:**
- Express 5.1 - HTTP server and routing (`server/index.ts`)

**Frontend:**
- React 19.1 - UI framework (`ui/src/`)
- React Router DOM 7.6 - Client-side routing (`ui/src/`)
- MUI (Material UI) 7.1 + Emotion - Component library and styling (`ui/src/components/`)

**Build/Dev:**
- Vite 6.3 with `@vitejs/plugin-react` - UI build tool and dev server (`ui/vite.config.js`)
- TypeScript compiler (`tsc`) - Server build (`server/tsconfig.json`)
- ts-node 10.9 - Server TypeScript execution in development
- nodemon 3.1 - Server hot reload in development

## Key Dependencies

**Critical:**
- `sqlite3` 5.1 + `sqlite` 5.1 - Local SQLite database driver and async wrapper (`server/databases/plantDb.ts`)
- `axios` 1.9 - HTTP client for all API calls from the UI (`ui/src/`)
- `uuid` 11.1 - Request ID generation (`server/middleware/requestId.ts`)

**Infrastructure:**
- `@emotion/react` + `@emotion/styled` 11.14 - Required by MUI for runtime CSS-in-JS
- `@mui/icons-material` 7.1 - Material icon set used in UI components

## Configuration

**Environment:**
- No `.env` file present in current node-based server (`.env` is not in `.gitignore`)
- `DEBUG=true` env var enables debug-level logging via `server/utils/logger.ts`
- Stripe accessor (`server/accessors/stripeAccessor.ts`) references `STRIPE_SECRET_KEY` via Deno-era dotenv — not wired into current Node server

**TypeScript (server):**
- Target: ES6, module: CommonJS
- Strict mode enabled
- Output: `server/dist/`
- Config: `server/tsconfig.json`

**Linting (UI):**
- ESLint 9.25 with flat config format
- Plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Config: `ui/eslint.config.js`

**Build:**
- Server: `npm run build` → `tsc` → output to `server/dist/`
- Server dev: `npm run dev` → nodemon + ts-node watching `./**/*.ts`
- UI: `npm run dev` → Vite dev server with proxy to `http://localhost:8000`
- UI: `npm run build` → Vite production build

## Platform Requirements

**Development:**
- Node.js required (version not pinned)
- Two separate npm workspaces: `server/` and `ui/` (no root package.json)
- Server runs on port 8000; UI dev server proxies `/api` to it

**Production:**
- Server: `node dist/index.js` after `tsc` build
- UI: static files from `vite build` output
- Deployment target: not defined

---

*Stack analysis: 2026-03-22*

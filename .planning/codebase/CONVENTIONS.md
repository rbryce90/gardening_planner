# Coding Conventions

**Analysis Date:** 2026-03-22

## Naming Patterns

**Files:**
- Server: camelCase for all files — `plantController.ts`, `plantRepository.ts`, `plantDb.ts`
- UI: PascalCase for component files — `PlantCard.jsx`, `AddPlantCard.tsx`, `PlantGrid.jsx`
- UI: camelCase for non-component files — `utils.ts`, `models.ts`
- Mixed extensions in UI: both `.jsx` and `.tsx` are used; `.tsx` for newer components (e.g., `AddPlantCard.tsx`)

**Functions:**
- Server: camelCase exports — `getPlants`, `createPlant`, `deletePlant`, `updatePlant`
- UI: PascalCase for React components exported as default — `function PlantCard(...)`, `function Plants(...)`
- UI: camelCase for handlers — `handleCardClick`, `handleDeletePlant`, `handleChange`, `handleSubmit`

**Variables:**
- camelCase throughout — `plantRepository`, `dbInstance`, `userInput`, `plantData`
- Mixed naming in some params: `plant_id`, `companion_id` (snake_case) used in repository methods alongside camelCase

**Types/Interfaces:**
- PascalCase — `Plant`, `PlantType`, `User`, `UserLoginInterface`
- `type` preferred over `interface` for data shapes; `interface` used for behavior contracts (`UserLoginInterface`)
- Enums: PascalCase name, SCREAMING_SNAKE_CASE values — `enum AuthHeaders { SESSION_ID = "session_id" }`

**Database Columns:**
- snake_case in SQL — `growth_form`, `plant_id`, `companion_id`, `planting_notes`
- Mapped to camelCase in TypeScript on read

## Code Style

**Formatting:**
- No Prettier config detected; formatting appears manual
- 4-space indentation (server TypeScript)
- 2-space indentation (UI JSX/TSX)

**Linting (UI):**
- ESLint v9 with flat config — `ui/eslint.config.js`
- Applies only to `**/*.{js,jsx}` (does not lint `.tsx` files)
- Rules: `js.configs.recommended`, `eslint-plugin-react-hooks` recommended
- `no-unused-vars` error with `varsIgnorePattern: '^[A-Z_]'`
- `react-refresh/only-export-components` warning

**Server TypeScript:**
- `strict: true` in `server/tsconfig.json`
- `esModuleInterop: true`, `skipLibCheck: true`
- Target: ES6, module: commonjs

## Import Organization

**Server pattern:**
```typescript
import express from 'express';
import RequestLogger from "./middleware/requestLogger";
import { Plant } from "../types/plant";
import { PlantRepository } from "../repositories/plantRepository";
```

**Order observed:**
1. Third-party packages (`express`, `sqlite3`, `uuid`)
2. Local middleware/utilities (relative paths)
3. Local types/models
4. Local repositories/controllers

**UI pattern:**
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import PlantGrid from '../components/PlantGrid';
import { capitalize } from '../utils/utils';
```

**Order observed:**
1. React core
2. Third-party packages (axios, react-router-dom)
3. MUI components
4. Local components
5. Local utilities/models

**No path aliases** — all imports use relative paths.

## Error Handling

**Server routes pattern:**
```typescript
plantRouter.get("/", async (req, res) => {
    try {
        const plants = await getPlants();
        res.status(200).json(plants);
    } catch (err) {
        console.error("Error fetching plants:", err);
        res.status(500).json({ error: err });
    }
});
```

- Every route handler wraps logic in try/catch
- Errors returned as `{ error: err }` — not a consistent user-facing message shape
- No centralized error handler middleware — each route handles its own errors
- `console.error` used directly in routes (not the custom logger)
- Custom logger (`server/utils/logger.ts`) exists but is not used in routes or controllers

**UI pattern:**
```jsx
axios.get('/api/plants')
  .then((res) => { ... })
  .catch((err) => { setError('Failed to fetch plants'); });
```
- Axios calls use `.then/.catch` in pages, `async/await` with try/catch in components
- Error state stored as a string, displayed via MUI `<Alert severity="error">`
- `console.error` used for non-fatal errors

## Logging

**Server logger:** `server/utils/logger.ts` — custom wrapper around `console.*` with timestamps and level prefixes (`[INFO]`, `[WARN]`, `[ERROR]`, `[DEBUG]`)

**Actual usage:**
- Routes use `console.error` directly (logger is not imported in routes)
- `requestLogger` middleware uses the custom logger
- `plantDb.ts` uses `console.log` directly
- The logger is partially adopted — use it for all new server code

## Comments

**When to Comment:**
- Inline comments label route sections: `// Get all plants`, `// Create a new plant`
- Validate sections commented inline: `// Validate the required fields`
- Large blocks of commented-out code remain in files (`plantController.ts`, `plantRepository.ts`) representing unfinished/deferred features

**JSDoc/TSDoc:**
- Not used anywhere in the codebase

## Function Design

**Server controllers:**
- Thin wrappers over repository — one controller function per repository method
- Return values passed through directly; no transformation layer
- `async/await` throughout

**Server repositories:**
- Class-based (`class PlantRepository`)
- Each method opens DB connection via `getDatabase()` — no connection passed in
- SQL written inline as strings
- Methods return typed values where possible, `any` used heavily for complex types

**UI components:**
- Functional components only — no class components
- Props destructured inline: `function PlantCard({ plant, onEdit, onDelete })`
- Local state with `useState`; data fetching in pages via `useEffect`
- API calls made directly with `axios` in component/page files — no service layer

## Module Design

**Server exports:**
- Named function exports from controllers: `export const getPlants = async () => ...`
- Default exports for routers: `export default plantRouter`
- Class exports for repositories: `export class PlantRepository`; singleton also exported: `export const plantRepository = new PlantRepository()`

**UI exports:**
- Default exports for all components and pages: `export default function PlantCard(...)`
- Named exports for types and constants from `models.ts`

**Barrel Files:**
- Not used — imports point directly to individual files

---

*Convention analysis: 2026-03-22*

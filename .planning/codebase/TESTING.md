# Testing Patterns

**Analysis Date:** 2026-03-22

## Test Framework

**Runner:**
- No Jest, Vitest, or other test runner is configured in either `server/package.json` or `ui/package.json`
- No `jest.config.*`, `vitest.config.*`, or similar config files exist

**What exists:**
- `server/test/testing.ts` and `server/test/testing-action.ts` — two files using **Deno's test runner** (`Deno.test`) and `jsr:@std/assert`
- These files are incompatible with the Node.js/TypeScript server (which uses `ts-node` and CommonJS)
- No test scripts in either `package.json`

**Run Commands:**
```bash
# No test commands configured
# Deno test files (server/test/) would require:
deno test server/test/
```

## Test File Organization

**Location:**
- `server/test/` directory — two stub files only
- No test files co-located with source
- No test files in UI

**Naming:**
- `testing.ts`, `testing-action.ts` — non-standard naming (not `*.test.ts` or `*.spec.ts`)

## Test Structure

**Current state of test files:**
```typescript
// server/test/testing.ts
import { assertEquals } from "jsr:@std/assert";

Deno.test("simple test", () => {
    const x = 1 + 2;
    assertEquals(x, 3);
});

// server/test/testing-action.ts
Deno.test("simple test 2", () => {
    const x = 1 + 2;
    assertEquals(x, 3);
});
```

Both files contain only placeholder arithmetic assertions — no actual application logic is tested.

## Mocking

**Framework:** None — no mocking library configured

**Patterns:** None established

## Fixtures and Factories

**Test Data:** None — no fixtures, factories, or seed data for tests

**Location:** Not applicable

## Coverage

**Requirements:** None enforced

**View Coverage:** Not configured

## Test Types

**Unit Tests:** Not implemented

**Integration Tests:** Not implemented

**E2E Tests:** Not implemented; no Puppeteer or Playwright configuration

## Shell Script Tests

The `server/scripts/` directory contains manual integration scripts used for ad-hoc testing:
- `server/scripts/test_flow.sh` — manual end-to-end flow script
- `server/scripts/login.sh`, `server/scripts/get_users.sh`, `server/scripts/create_new_user.sh` — individual API call scripts
- `server/scripts/plants/insert_plants.sh`, `insert_plant_types.sh`, etc. — data seeding scripts

These are curl-based shell scripts, not automated tests.

## Recommended Setup

To match the project's Node.js stack, use **Jest** with `ts-jest` for the server:

```bash
# Install
npm install --save-dev jest ts-jest @types/jest

# jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
};
```

Test files should follow `*.test.ts` naming and be placed co-located with source or in `server/test/` using Jest syntax:

```typescript
import { PlantRepository } from '../repositories/plantRepository';

describe('PlantRepository', () => {
  it('getPlants returns array', async () => {
    const repo = new PlantRepository();
    const plants = await repo.getPlants();
    expect(Array.isArray(plants)).toBe(true);
  });
});
```

---

*Testing analysis: 2026-03-22*

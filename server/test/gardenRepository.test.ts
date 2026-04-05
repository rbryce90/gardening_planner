import { setupTestDb, cleanupTestDb, initAllTables } from "./testDbHelper";

beforeAll(() => {
  setupTestDb();
  initAllTables();
});

afterAll(() => {
  cleanupTestDb();
});

import { gardenRepository } from "../repositories/gardenRepository.ts";
import { plantRepository } from "../repositories/plantRepository.ts";
import { getDb } from "../databases/db.ts";

// Create a test user directly in the db
function createTestUser(email: string): number {
  const db = getDb();
  const result = db
    .prepare("INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)")
    .run(email, "hashedpw", "Test", "User");
  return Number(result.lastInsertRowid);
}

describe("GardenRepository", () => {
  let userId1: number;
  let userId2: number;
  let plantId: number;

  beforeAll(() => {
    userId1 = createTestUser("garden-test-1@test.com");
    userId2 = createTestUser("garden-test-2@test.com");
    plantId = plantRepository.createPlant({
      name: "GardenTestPlant",
      category: "Vegetable",
      growthForm: "Bush",
    })!;
  });

  describe("createGarden", () => {
    it("creates a garden and returns it with an id", () => {
      const garden = gardenRepository.createGarden(userId1, "My Garden", 5, 5);
      expect(garden.id).toBeDefined();
      expect(garden.name).toBe("My Garden");
      expect(garden.rows).toBe(5);
      expect(garden.cols).toBe(5);
      expect(garden.userId).toBe(userId1);
    });
  });

  describe("getGardens", () => {
    it("returns gardens scoped by userId", () => {
      gardenRepository.createGarden(userId2, "User2 Garden", 3, 3);

      const user1Gardens = gardenRepository.getGardens(userId1);
      const user2Gardens = gardenRepository.getGardens(userId2);

      expect(user1Gardens.every((g) => g.userId === userId1)).toBe(true);
      expect(user2Gardens.every((g) => g.userId === userId2)).toBe(true);
      expect(user2Gardens.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getGardenById", () => {
    it("returns the garden for the correct user", () => {
      const garden = gardenRepository.createGarden(userId1, "Lookup Garden", 4, 4);
      const found = gardenRepository.getGardenById(garden.id, userId1);
      expect(found).not.toBeNull();
      expect(found!.name).toBe("Lookup Garden");
    });

    it("returns null for wrong user", () => {
      const garden = gardenRepository.createGarden(userId1, "Private Garden", 4, 4);
      const found = gardenRepository.getGardenById(garden.id, userId2);
      expect(found).toBeNull();
    });
  });

  describe("upsertCell and getGardenCells", () => {
    it("inserts a cell and retrieves it", () => {
      const garden = gardenRepository.createGarden(userId1, "Cell Garden", 5, 5);
      gardenRepository.upsertCell(garden.id, 0, 0, plantId);

      const cells = gardenRepository.getGardenCells(garden.id);
      expect(cells.length).toBe(1);
      expect(cells[0].row).toBe(0);
      expect(cells[0].col).toBe(0);
      expect(cells[0].plantId).toBe(plantId);
      expect(cells[0].plantName).toBe("GardenTestPlant");
    });

    it("upsert overwrites existing cell", () => {
      const garden = gardenRepository.createGarden(userId1, "Upsert Garden", 5, 5);
      const plant2Id = plantRepository.createPlant({
        name: "UpsertPlant",
        category: "Herb",
        growthForm: "Bush",
      })!;

      gardenRepository.upsertCell(garden.id, 1, 1, plantId);
      gardenRepository.upsertCell(garden.id, 1, 1, plant2Id);

      const cells = gardenRepository.getGardenCells(garden.id);
      const cell = cells.find((c) => c.row === 1 && c.col === 1);
      expect(cell).toBeDefined();
      expect(cell!.plantId).toBe(plant2Id);
    });
  });

  describe("clearCell", () => {
    it("removes a cell and returns true", () => {
      const garden = gardenRepository.createGarden(userId1, "Clear Garden", 5, 5);
      gardenRepository.upsertCell(garden.id, 2, 2, plantId);

      const result = gardenRepository.clearCell(garden.id, 2, 2);
      expect(result).toBe(true);

      const cells = gardenRepository.getGardenCells(garden.id);
      expect(cells.find((c) => c.row === 2 && c.col === 2)).toBeUndefined();
    });

    it("returns false for nonexistent cell", () => {
      const garden = gardenRepository.createGarden(userId1, "Empty Garden", 5, 5);
      const result = gardenRepository.clearCell(garden.id, 0, 0);
      expect(result).toBe(false);
    });
  });

  describe("deleteGarden", () => {
    it("deletes garden for correct user and returns true", () => {
      const garden = gardenRepository.createGarden(userId1, "To Delete", 3, 3);
      const result = gardenRepository.deleteGarden(garden.id, userId1);
      expect(result).toBe(true);

      const found = gardenRepository.getGardenById(garden.id, userId1);
      expect(found).toBeNull();
    });

    it("returns false for wrong user", () => {
      const garden = gardenRepository.createGarden(userId1, "Not Yours", 3, 3);
      const result = gardenRepository.deleteGarden(garden.id, userId2);
      expect(result).toBe(false);
    });
  });
});

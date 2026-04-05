import { setupTestDb, cleanupTestDb, initAllTables } from "./testDbHelper";

beforeAll(() => {
  setupTestDb();
  initAllTables();
});

afterAll(() => {
  cleanupTestDb();
});

import { plantRepository } from "../repositories/plantRepository.ts";

describe("PlantRepository", () => {
  describe("createPlant", () => {
    it("returns an id for a new plant", () => {
      const id = plantRepository.createPlant({
        name: "Tomato",
        category: "Vegetable",
        growthForm: "Vine",
      });
      expect(id).toBeDefined();
      expect(typeof id).toBe("number");
    });
  });

  describe("getPlants", () => {
    it("returns all plants", () => {
      const plants = plantRepository.getPlants();
      expect(plants.length).toBeGreaterThanOrEqual(1);
      const tomato = plants.find((p) => p.name === "Tomato");
      expect(tomato).toBeDefined();
      expect(tomato!.category).toBe("Vegetable");
      expect(tomato!.growthForm).toBe("Vine");
    });
  });

  describe("getPlantById", () => {
    it("returns the correct plant for a valid id", () => {
      const plants = plantRepository.getPlants();
      const first = plants[0];
      const found = plantRepository.getPlantById(first.id!);
      expect(found).not.toBeNull();
      expect(found!.name).toBe(first.name);
    });

    it("returns null for a nonexistent id", () => {
      const found = plantRepository.getPlantById(999999);
      expect(found).toBeNull();
    });
  });

  describe("deletePlant", () => {
    it("returns true when deleting an existing plant", () => {
      const id = plantRepository.createPlant({
        name: "DeleteMe",
        category: "Test",
        growthForm: "Bush",
      });
      const result = plantRepository.deletePlant(id!);
      expect(result).toBe(true);
    });

    it("returns false when deleting a nonexistent plant", () => {
      const result = plantRepository.deletePlant(999999);
      expect(result).toBe(false);
    });
  });

  describe("companions", () => {
    let plantAId: number;
    let plantBId: number;

    beforeAll(() => {
      plantAId = plantRepository.createPlant({
        name: "Basil",
        category: "Herb",
        growthForm: "Bush",
      })!;
      plantBId = plantRepository.createPlant({
        name: "Pepper",
        category: "Vegetable",
        growthForm: "Bush",
      })!;
    });

    it("addCompanion creates a relationship", () => {
      plantRepository.addCompanion(plantAId, plantBId);
      const companions = plantRepository.getCompanionPlantsById(plantAId);
      expect(companions.length).toBe(1);
      expect(companions[0].name).toBe("Pepper");
    });

    it("getCompanionPlantsById works from either side", () => {
      const companions = plantRepository.getCompanionPlantsById(plantBId);
      expect(companions.length).toBe(1);
      expect(companions[0].name).toBe("Basil");
    });

    it("enforces pair ordering (lower ID first)", () => {
      const allCompanions = plantRepository.getAllCompanions();
      const pair = allCompanions.find(
        (c) =>
          (c.plantId === plantAId && c.companionId === plantBId) ||
          (c.plantId === plantBId && c.companionId === plantAId),
      );
      expect(pair).toBeDefined();
      expect(pair!.plantId).toBeLessThan(pair!.companionId);
    });

    it("addCompanion with reversed IDs still stores lower first", () => {
      const highId = plantRepository.createPlant({
        name: "Carrot",
        category: "Vegetable",
        growthForm: "Root",
      })!;
      const lowId = plantRepository.createPlant({
        name: "Lettuce",
        category: "Vegetable",
        growthForm: "Leaf",
      })!;
      // Pass in reverse order (high, low)
      const [lo, hi] = lowId < highId ? [lowId, highId] : [highId, lowId];
      plantRepository.addCompanion(hi, lo);
      const allCompanions = plantRepository.getAllCompanions();
      const pair = allCompanions.find((c) => c.plantId === lo && c.companionId === hi);
      expect(pair).toBeDefined();
    });
  });
});

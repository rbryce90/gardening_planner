import { plantRepository } from "../repositories/plantRepository.ts";
import { graphRepository } from "../repositories/graphRepository.ts";
import logger from "../utils/logger.ts";
import type { Plant, PlantType } from "../types/plant.d.ts";

// Neo4j sync is best-effort — SQLite is the source of truth
async function syncToGraph(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (error) {
    logger.error("Neo4j sync failed", { error });
  }
}

export const getPlants = (): Plant[] => plantRepository.getPlants();

export const getPlantById = (id: number): Plant | null => plantRepository.getPlantById(id);

export const getPlantByName = (name: string): Plant | null => plantRepository.getPlantByName(name);

export const createPlant = async (plant: Plant): Promise<number | undefined> => {
  const id = plantRepository.createPlant(plant);
  if (id) {
    await syncToGraph(() =>
      graphRepository.upsertPlant(id, plant.name, plant.category, plant.growthForm),
    );
  }
  return id;
};

export const updatePlant = async (id: number, plant: Plant): Promise<void> => {
  plantRepository.updatePlant(id, plant);
  await syncToGraph(() =>
    graphRepository.upsertPlant(id, plant.name, plant.category, plant.growthForm),
  );
};

export const deletePlant = async (id: number): Promise<boolean> => {
  const result = plantRepository.deletePlant(id);
  await syncToGraph(() => graphRepository.deletePlant(id));
  return result;
};

export const getPlantTypesByPlantIdWithCompanionsAndAntagonists = (
  plantId: number,
): { types: Omit<PlantType, "plantId">[]; companions: Plant[]; antagonists: Plant[] } => {
  const types = plantRepository.getPlantTypesByPlantId(plantId);
  const companions = plantRepository.getCompanionPlantsById(plantId);
  const antagonists = plantRepository.getAntagonistPlantsById(plantId);
  return { types, companions, antagonists };
};

export const createPlantType = (plantId: number, plantType: PlantType): PlantType =>
  plantRepository.createPlantType(plantId, plantType);

export const addCompanion = async (plantId: number, companionId: number): Promise<void> => {
  plantRepository.addCompanion(plantId, companionId);
  await syncToGraph(() => graphRepository.addCompanion(plantId, companionId));
};

export const createAntagonist = async (plantId: number, antagonistId: number): Promise<void> => {
  plantRepository.createAntagonist(plantId, antagonistId);
  await syncToGraph(() => graphRepository.addAntagonist(plantId, antagonistId));
};

export const getAllCompanions = (): Array<{ plantId: number; companionId: number }> =>
  plantRepository.getAllCompanions();

export const getAllAntagonists = (): Array<{ plantId: number; antagonistId: number }> =>
  plantRepository.getAllAntagonists();

export const getPlantingSeasonsByPlantTypeId = (plantTypeId: number) =>
  plantRepository.getPlantingSeasonsByPlantTypeId(plantTypeId);

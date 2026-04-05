import { PlantRepository } from "../repositories/plantRepository.ts";
import { graphRepository } from "../repositories/graphRepository.ts";
import type { Plant } from "../types/plant.d.ts";

const plantRepository = new PlantRepository();

export const getPlants = async (): Promise<Plant[]> => {
  return await plantRepository.getPlants();
};

export const getPlantById = async (id: number): Promise<Plant | null> => {
  return await plantRepository.getPlantById(id);
};

export const getPlantByName = async (name: string): Promise<Plant | null> => {
  return await plantRepository.getPlantByName(name);
};

export const createPlant = async (plant: Plant): Promise<number | undefined> => {
  const id = await plantRepository.createPlant(plant);
  if (id) {
    await graphRepository.upsertPlant(id, plant.name, plant.category, plant.growthForm);
  }
  return id;
};

export const updatePlant = async (id: number, plant: Plant): Promise<Plant | undefined> => {
  const result = await plantRepository.updatePlant(id, plant);
  await graphRepository.upsertPlant(id, plant.name, plant.category, plant.growthForm);
  return result;
};

export const deletePlant = async (id: number): Promise<boolean> => {
  const result = await plantRepository.deletePlant(id);
  await graphRepository.deletePlant(id);
  return result;
};

export const getPlantTypesByPlantIdWithCompanionsAndAntagonists = async (
  plantId: number,
): Promise<any> => {
  const types = await plantRepository.getPlantTypesByPlantId(plantId);
  const companions = await plantRepository.getCompanionPlantsById(plantId);
  const antagonists = await plantRepository.getAntagonistPlantsById(plantId);

  return { types, companions, antagonists };
};

export const createPlantType = async (plantId: number, plantType: any): Promise<any> => {
  return await plantRepository.createPlantType(plantId, plantType);
};

export const addCompanion = async (plantId: number, companionId: number): Promise<void> => {
  await plantRepository.addCompanion(plantId, companionId);
  await graphRepository.addCompanion(plantId, companionId);
};

export const createAntagonist = async (plantId: number, antagonistId: number): Promise<void> => {
  await plantRepository.createAntagonist(plantId, antagonistId);
  await graphRepository.addAntagonist(plantId, antagonistId);
};

export const getAllCompanions = async (): Promise<
  Array<{ plantId: number; companionId: number }>
> => {
  return await plantRepository.getAllCompanions();
};

export const getAllAntagonists = async (): Promise<
  Array<{ plantId: number; antagonistId: number }>
> => {
  return await plantRepository.getAllAntagonists();
};

export const getPlantingSeasonsByPlantTypeId = async (plantTypeId: number): Promise<any[]> => {
  return await plantRepository.getPlantingSeasonsByPlantTypeId(plantTypeId);
};

import { PlantRepository } from "../repositories/plantRepository.ts";
import { graphRepository } from "../repositories/graphRepository.ts";
import type { Plant } from "../types/plant.d.ts";

const plantRepository = new PlantRepository();

export const getPlants = async (): Promise<Plant[]> => {
  return await plantRepository.getPlants();
};

export const getPlantById = async (id: string): Promise<Plant | null> => {
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

export const updatePlant = async (id: string, plant: Plant): Promise<Plant | undefined> => {
  const result = await plantRepository.updatePlant(id, plant);
  await graphRepository.upsertPlant(Number(id), plant.name, plant.category, plant.growthForm);
  return result;
};

export const deletePlant = async (id: string): Promise<boolean> => {
  const result = await plantRepository.deletePlant(id);
  await graphRepository.deletePlant(Number(id));
  return result;
};

export const getPlantTypesByPlantIdWithCompanionsAndAtagonists = async (
  plantId: string,
): Promise<any> => {
  const types = await plantRepository.getPlantTypesByPlantId(plantId);

  const companions = await plantRepository.getCompanionsById(plantId);
  const companionsEnhanced = [];
  for (const companion of companions) {
    const plant = await getPlantById(companion.companionId);
    delete companion.companionId;
    delete companion.plantId;
    companionsEnhanced.push({
      ...companion,
      ...plant,
    });
  }

  const antagonists = await plantRepository.getAntagonistsById(plantId);
  const antagonistsEnhanced = [];
  for (const antagonist of antagonists) {
    const plant = await getPlantById(antagonist.antagonistId);
    delete antagonist.antagonistId;
    delete antagonist.plantId;
    antagonistsEnhanced.push({
      ...antagonist,
      ...plant,
    });
  }

  return { types, companions: companionsEnhanced, antagonists: antagonistsEnhanced };
};

export const createPlantType = async (plantId: string, plantType: any): Promise<any> => {
  return await plantRepository.createPlantType(plantId, plantType);
};

export const addCompanion = async (plant_id: string, companion_id: string): Promise<void> => {
  await plantRepository.addCompanion(plant_id, companion_id);
  await graphRepository.addCompanion(Number(plant_id), Number(companion_id));
};

export const createAntagonist = async (plant_id: string, antagonist_id: string): Promise<void> => {
  await plantRepository.createAntagonist(plant_id, antagonist_id);
  await graphRepository.addAntagonist(Number(plant_id), Number(antagonist_id));
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

export const getPlantingSeasonsByPlantTypeId = async (plantTypeId: string): Promise<any[]> => {
  return await plantRepository.getPlantingSeasonsByPlantTypeId(plantTypeId);
};

// make a controller for plants like the others 
import { PlantRepository } from "../repositories/plantRepository";
import { Plant } from "../types/plant";

const plantRepository = new PlantRepository();
export const getPlants = async (): Promise<Plant[]> => {
    return await plantRepository.getPlants();
}

export const getPlantById = async (id: string): Promise<Plant | null> => {
    return await plantRepository.getPlantById(id);
}

export const createPlant = async (plant: Plant): Promise<number | undefined> => {
    return await plantRepository.createPlant(plant);
}
// export const updatePlant = async (id: string, plant: Plant): Promise<Plant | null> => {
//     return await plantRepository.updatePlant(id, plant);
// }
export const deletePlant = async (id: string): Promise<boolean> => {
    return await plantRepository.deletePlant(id);
}
export const getPlantTypesByPlantId = async (plantId: string): Promise<any[]> => {
    return await plantRepository.getPlantTypesByPlantId(plantId);
}
export const createPlantType = async (plantId: string, plantType: any): Promise<any> => {
    return await plantRepository.createPlantType(plantId, plantType);
}
// export const updatePlantType = async (id: string, plantType: any): Promise<any | null> => {
//     return await plantRepository.updatePlantType(id, plantType);
// }
// export const deletePlantType = async (id: string): Promise<boolean> => {
//     return await plantRepository.deletePlantType(id);
// }
export const getCompanionsByPlantTypeId = async (plantTypeId: string): Promise<any[]> => {
    return await plantRepository.getCompanionsByPlantTypeId(plantTypeId);
}
export const createCompanion = async (plantTypeId: string, companion: any): Promise<any> => {
    return await plantRepository.createCompanion(plantTypeId, companion);
}
// export const deleteCompanion = async (id: string): Promise<boolean> => {
//     return await plantRepository.deleteCompanion(id);
// }

export const getAntagonistsByPlantTypeId = async (plantTypeId: string): Promise<any[]> => {
    return await plantRepository.getAntagonistsByPlantTypeId(plantTypeId);
}
export const createAntagonist = async (plantTypeId: string, antagonist: any): Promise<any> => {
    return await plantRepository.createAntagonist(plantTypeId, antagonist);
}
// export const deleteAntagonist = async (id: string): Promise<boolean> => {
//     return await plantRepository.deleteAntagonist(id);
// }
export const getPlantingSeasonsByPlantTypeId = async (plantTypeId: string): Promise<any[]> => {
    return await plantRepository.getPlantingSeasonsByPlantTypeId(plantTypeId);
}
// export const createPlantingSeason = async (plantTypeId: string, zoneId: string, plantingSeason: any): Promise<any> => {
//     return await plantRepository.createPlantingSeason(plantTypeId, zoneId, plantingSeason);
// }
// export const updatePlantingSeason = async (id: string, plantingSeason: any): Promise<any | null> => {
//     return await plantRepository.updatePlantingSeason(id, plantingSeason);
// }
// export const deletePlantingSeason = async (id: string): Promise<boolean> => {
//     return await plantRepository.deletePlantingSeason(id);
// }
// export const getPlantingSeasonsByZoneId = async (zoneId: string): Promise<any[]> => {
//     return await plantRepository.getPlantingSeasonsByZoneId(zoneId);
// }
// export const getPlantingSeasons = async (): Promise<any[]> => {
//     return await plantRepository.getPlantingSeasons();
// }
// export const getPlantingSeasonById = async (id: string): Promise<any | null> => {
//     return await plantRepository.getPlantingSeasonById(id);
// }
// export const getPlantingSeasonByPlantTypeIdAndZoneId = async (plantTypeId: string, zoneId: string): Promise<any | null> => {
//     return await plantRepository.getPlantingSeasonByPlantTypeIdAndZoneId(plantTypeId, zoneId);
// }
// export const createPlantingSeasonByPlantTypeIdAndZoneId = async (plantTypeId: string, zoneId: string, plantingSeason: any): Promise<any> => {
//     return await plantRepository.createPlantingSeasonByPlantTypeIdAndZoneId(plantTypeId, zoneId, plantingSeason);
// }
// export const updatePlantingSeasonByPlantTypeIdAndZoneId = async (plantTypeId: string, zoneId: string, plantingSeason: any): Promise<any | null> => {
//     return await plantRepository.updatePlantingSeasonByPlantTypeIdAndZoneId(plantTypeId, zoneId, plantingSeason);
// }
// export const deletePlantingSeasonByPlantTypeIdAndZoneId = async (plantTypeId: string, zoneId: string): Promise<boolean> => {
//     return await plantRepository.deletePlantingSeasonByPlantTypeIdAndZoneId(plantTypeId, zoneId);
// }
// export const getPlantingSeasonByIdAndZoneId = async (id: string, zoneId: string): Promise<any | null> => {
//     return await plantRepository.getPlantingSeasonByIdAndZoneId(id, zoneId);
// }
// export const createPlantingSeasonByIdAndZoneId = async (id: string, zoneId: string, plantingSeason: any): Promise<any> => {
//     return await plantRepository.createPlantingSeasonByIdAndZoneId(id, zoneId, plantingSeason);
// }

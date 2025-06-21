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
export const getPlantByName = async (name: string): Promise<Plant | null> => {
    return await plantRepository.getPlantByName(name);
}

export const createPlant = async (plant: Plant): Promise<number | undefined> => {
    return await plantRepository.createPlant(plant);
}
export const updatePlant = async (id: string, plant: Plant): Promise<Plant | undefined> => {
    return await plantRepository.updatePlant(id, plant);
}
export const deletePlant = async (id: string): Promise<boolean> => {
    return await plantRepository.deletePlant(id);
}
export const getPlantTypesByPlantIdWithCompanionsAndAtagonists = async (plantId: string): Promise<any> => {
    const types = await plantRepository.getPlantTypesByPlantId(plantId);

    // Fetch companions
    const companions = await plantRepository.getCompanionsById(plantId);
    const companionsEnhanced = [];
    for (let companion of companions) {
        const plant = await getPlantById(companion.companionId);
        delete companion.companionId;
        delete companion.plantId;
        companionsEnhanced.push({
            ...companion,
            ...plant,
        });
    }

    // Fetch antagonists
    const antagonists = await plantRepository.getAntagonistsById(plantId);
    const antagonistsEnhanced = [];
    for (let antagonist of antagonists) {
        const plant = await getPlantById(antagonist.antagonistId);
        delete antagonist.antagonistId;
        delete antagonist.plantId;
        antagonistsEnhanced.push({
            ...antagonist,
            ...plant,
        });
    }

    return { types, companions: companionsEnhanced, antagonists: antagonistsEnhanced };
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

export const addCompanion = async (plant_id: string, companion_id: string): Promise<void> => {
    await plantRepository.addCompanion(plant_id, companion_id);
};

export const getAntagonistsByPlantTypeId = async (plantTypeId: string): Promise<any[]> => {
    return await plantRepository.getAntagonistsByPlantTypeId(plantTypeId);
}
export const createAntagonist = async (plant_id: string, antagonist_id: string): Promise<void> => {
    await plantRepository.createAntagonist(plant_id, antagonist_id);
};
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

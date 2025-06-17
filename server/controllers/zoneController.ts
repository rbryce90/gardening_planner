// zone controller like the others 
import { Zone } from "../models/zoneModels.ts";
import { ZoneRepository } from "../repositories/zoneRepository.ts";
const zoneRepository = new ZoneRepository();

export const getZones = async (): Promise<Zone[]> => {
    return await zoneRepository.getZones();
}
export const getZoneById = async (id
    : string): Promise<Zone | null> => {
    return await zoneRepository.getZoneById(id);
}
export const createZone = async (zone: Zone): Promise<Zone> => {
    return await zoneRepository.createZone(zone);
}
export const updateZone = async (id: string, zone: Zone): Promise<Zone | null> => {
    return await zoneRepository.updateZone(id, zone);
}
export const deleteZone = async (id: string): Promise<boolean> => {
    return await zoneRepository.deleteZone(id);
}
import { zoneRepository } from "../repositories/zoneRepository.ts";

export const getZones = async () => {
  return await zoneRepository.getZones();
};

export const getPlantingCalendar = async (zoneId: number) => {
  return await zoneRepository.getPlantingCalendar(zoneId);
};

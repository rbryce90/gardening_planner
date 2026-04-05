import { gardenRepository } from "../repositories/gardenRepository.ts";
import type { Garden, GardenCell } from "../types/garden.d.ts";

export const getGardens = async (userId: number): Promise<Garden[]> => {
  return await gardenRepository.getGardens(userId);
};

export const createGarden = async (
  userId: number,
  name: string,
  rows: number,
  cols: number,
): Promise<Garden> => {
  return await gardenRepository.createGarden(userId, name, rows, cols);
};

export const getGardenById = async (gardenId: number, userId: number): Promise<Garden | null> => {
  return await gardenRepository.getGardenById(gardenId, userId);
};

export const getGardenCells = async (gardenId: number): Promise<GardenCell[]> => {
  return await gardenRepository.getGardenCells(gardenId);
};

export const upsertCell = async (
  gardenId: number,
  row: number,
  col: number,
  plantId: number,
): Promise<void> => {
  return await gardenRepository.upsertCell(gardenId, row, col, plantId);
};

export const clearCell = async (gardenId: number, row: number, col: number): Promise<boolean> => {
  return await gardenRepository.clearCell(gardenId, row, col);
};

export const deleteGarden = async (gardenId: number, userId: number): Promise<boolean> => {
  return await gardenRepository.deleteGarden(gardenId, userId);
};

import { GraphRepository } from "../repositories/graphRepository.ts";
import type { GraphData, GraphNode, PlantRecommendation } from "../types/graph.d.ts";

const graphRepository = new GraphRepository();

export const getPlantGraph = async (plantId: number, hops: number): Promise<GraphData> => {
    return await graphRepository.getPlantGraph(plantId, hops);
};

export const getCompanions = async (plantId: number): Promise<GraphNode[]> => {
    return await graphRepository.getCompanions(plantId);
};

export const getAntagonists = async (plantId: number): Promise<GraphNode[]> => {
    return await graphRepository.getAntagonists(plantId);
};

export const getPlantRecommendations = async (gardenPlantIds: number[]): Promise<PlantRecommendation[]> => {
    return await graphRepository.getPlantRecommendations(gardenPlantIds);
};

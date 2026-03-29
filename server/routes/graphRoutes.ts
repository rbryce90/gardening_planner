import { Controller, Route, Tags, Get, Path, Query } from "tsoa";
import { getPlantGraph, getPlantRecommendations } from "../controllers/graphController.ts";
import type { GraphDataResponse, PlantRecommendationResponse } from "../types/models.ts";

@Route("v1/api/graph")
@Tags("Graph")
export class GraphController extends Controller {
    @Get("/plants/{id}")
    public async getPlantGraph(
        @Path() id: number,
        @Query() hops: number = 2
    ): Promise<GraphDataResponse> {
        if (hops < 1 || hops > 5) {
            this.setStatus(400);
            return { nodes: [], edges: [] };
        }
        return await getPlantGraph(id, hops) as GraphDataResponse;
    }

    @Get("/recommendations")
    public async getRecommendations(
        @Query() plantIds: string
    ): Promise<PlantRecommendationResponse[]> {
        if (!plantIds) {
            this.setStatus(400);
            return [];
        }
        const ids = plantIds.split(",").map(Number);
        if (ids.some(isNaN) || ids.length === 0) {
            this.setStatus(400);
            return [];
        }
        return await getPlantRecommendations(ids) as PlantRecommendationResponse[];
    }
}

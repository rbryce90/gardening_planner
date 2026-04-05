import { Controller, Route, Tags, Get, Path, Query, Security } from "tsoa";
import { graphRepository } from "../repositories/graphRepository.ts";
import { HttpError } from "../utils/HttpError.ts";
import type { GraphDataResponse, PlantRecommendationResponse } from "../types/models.ts";

@Route("v1/api/graph")
@Tags("Graph")
@Security("jwt")
export class GraphController extends Controller {
  @Get("/plants/{id}")
  public async getPlantGraph(
    @Path() id: number,
    @Query() hops: number = 2,
  ): Promise<GraphDataResponse> {
    if (hops < 1 || hops > 5) {
      throw new HttpError(400, "hops must be between 1 and 5");
    }
    return (await graphRepository.getPlantGraph(id, hops)) as GraphDataResponse;
  }

  @Get("/recommendations")
  public async getRecommendations(
    @Query() plantIds: string,
  ): Promise<PlantRecommendationResponse[]> {
    if (!plantIds) {
      throw new HttpError(400, "plantIds query parameter is required");
    }
    const ids = plantIds.split(",").map(Number);
    if (ids.some(isNaN) || ids.length === 0) {
      throw new HttpError(400, "plantIds must be comma-separated numbers");
    }
    return (await graphRepository.getPlantRecommendations(ids)) as PlantRecommendationResponse[];
  }
}

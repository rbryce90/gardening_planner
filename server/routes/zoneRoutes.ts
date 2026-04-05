import { Controller, Route, Tags, Get, Path, Security, Request } from "tsoa";
import * as express from "express";
import { getZones, getPlantingCalendar } from "../controllers/zoneController.ts";
import type { ZoneResponse, PlantingSeasonResponse } from "../types/models.ts";

@Route("v1/api")
@Tags("Zones")
export class ZoneController extends Controller {
  @Get("/zones")
  public async getZones(): Promise<ZoneResponse[]> {
    return (await getZones()) as ZoneResponse[];
  }

  @Get("/planting-calendar/{zoneId}")
  @Security("jwt")
  public async getPlantingCalendar(
    @Path() zoneId: number,
    @Request() req: express.Request,
  ): Promise<PlantingSeasonResponse[]> {
    return (await getPlantingCalendar(zoneId)) as PlantingSeasonResponse[];
  }
}

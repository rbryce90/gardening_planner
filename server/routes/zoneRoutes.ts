import { Controller, Route, Tags, Get, Path, Security, Request } from "tsoa";
import * as express from "express";
import { zoneRepository } from "../repositories/zoneRepository.ts";
import type { ZoneResponse, PlantingSeasonResponse } from "../types/models.ts";

@Route("v1/api")
@Tags("Zones")
export class ZoneController extends Controller {
  @Get("/zones")
  public async getZones(): Promise<ZoneResponse[]> {
    return zoneRepository.getZones() as ZoneResponse[];
  }

  @Get("/planting-calendar/{zoneId}")
  @Security("jwt")
  public async getPlantingCalendar(
    @Path() zoneId: number,
    @Request() req: express.Request,
  ): Promise<PlantingSeasonResponse[]> {
    return zoneRepository.getPlantingCalendar(zoneId) as PlantingSeasonResponse[];
  }
}

import { Controller, Route, Tags, Get, Post, Put, Delete, Body, Path, Security } from "tsoa";
import {
  getPlants,
  getPlantById,
  createPlant,
  deletePlant,
  updatePlant,
  getPlantTypesByPlantIdWithCompanionsAndAtagonists,
  getPlantByName,
  addCompanion,
  createAntagonist,
  getAllCompanions,
  getAllAntagonists,
  createPlantType,
  deletePlantType,
  deleteCompanion,
  deleteAntagonist,
} from "../controllers/plantController.ts";
import type {
  PlantResponse,
  PlantCreateRequest,
  PlantDetailResponse,
  PlantTypeCreateRequest,
  PlantTypeResponse,
  CompanionPair,
  AntagonistPair,
  MessageResponse,
} from "../types/models.ts";

@Route("v1/api/plants")
@Tags("Plants")
export class PlantController extends Controller {
  @Get("/")
  public async getPlants(): Promise<PlantResponse[]> {
    return (await getPlants()) as PlantResponse[];
  }

  @Get("/companions")
  public async getAllCompanions(): Promise<CompanionPair[]> {
    return await getAllCompanions();
  }

  @Get("/antagonists")
  public async getAllAntagonists(): Promise<AntagonistPair[]> {
    return (await getAllAntagonists()) as AntagonistPair[];
  }

  @Get("/{id}")
  public async getPlantById(@Path() id: number): Promise<PlantResponse> {
    const plant = await getPlantById(String(id));
    if (!plant) {
      this.setStatus(404);
      return { name: "", category: "", growthForm: "" };
    }
    return plant as PlantResponse;
  }

  @Get("/{name}/types")
  public async getPlantTypes(@Path() name: string): Promise<PlantDetailResponse> {
    const plant = await getPlantByName(name);
    if (!plant || !plant.id) {
      this.setStatus(404);
      return { name: "", category: "", growthForm: "", types: [], companions: [], antagonists: [] };
    }
    const typesAndCompanions = await getPlantTypesByPlantIdWithCompanionsAndAtagonists(
      String(plant.id),
    );
    return {
      ...plant,
      ...typesAndCompanions,
    } as PlantDetailResponse;
  }

  @Security("admin")
  @Post("/")
  public async createPlant(@Body() body: PlantCreateRequest): Promise<PlantResponse> {
    if (!body.name || !body.category || !body.growthForm) {
      this.setStatus(400);
      return { name: "", category: "", growthForm: "" };
    }
    const id = await createPlant(body as any);
    this.setStatus(201);
    return { id, ...body };
  }

  @Security("admin")
  @Put("/{id}")
  public async updatePlant(
    @Path() id: number,
    @Body() body: PlantCreateRequest,
  ): Promise<PlantResponse> {
    if (!body.name || !body.category || !body.growthForm) {
      this.setStatus(400);
      return { name: "", category: "", growthForm: "" };
    }
    await updatePlant(String(id), body as any);
    return { id, ...body };
  }

  @Security("admin")
  @Delete("/{id}")
  public async deletePlant(@Path() id: number): Promise<void> {
    const deleted = await deletePlant(String(id));
    if (deleted) {
      this.setStatus(204);
    } else {
      this.setStatus(404);
    }
  }

  @Security("admin")
  @Post("/{id}/types")
  public async createPlantType(
    @Path() id: number,
    @Body() body: PlantTypeCreateRequest,
  ): Promise<PlantTypeResponse> {
    if (!body.name) {
      this.setStatus(400);
      return { name: "" };
    }
    const result = await createPlantType(String(id), body);
    this.setStatus(201);
    return result;
  }

  @Security("admin")
  @Delete("/{plantId}/types/{typeId}")
  public async deletePlantType(
    @Path() plantId: number,
    @Path() typeId: number,
  ): Promise<MessageResponse> {
    const deleted = await deletePlantType(String(plantId), String(typeId));
    if (!deleted) {
      this.setStatus(404);
      return { message: "Plant type not found" };
    }
    this.setStatus(200);
    return { message: "Plant type deleted" };
  }

  @Security("admin")
  @Delete("/{id}/companion/{companionId}")
  public async deleteCompanion(
    @Path() id: number,
    @Path() companionId: number,
  ): Promise<MessageResponse> {
    const deleted = await deleteCompanion(String(id), String(companionId));
    if (!deleted) {
      this.setStatus(404);
      return { message: "Companion relationship not found" };
    }
    this.setStatus(200);
    return { message: "Companion removed" };
  }

  @Security("admin")
  @Delete("/{id}/antagonist/{antagonistId}")
  public async deleteAntagonist(
    @Path() id: number,
    @Path() antagonistId: number,
  ): Promise<MessageResponse> {
    const deleted = await deleteAntagonist(String(id), String(antagonistId));
    if (!deleted) {
      this.setStatus(404);
      return { message: "Antagonist relationship not found" };
    }
    this.setStatus(200);
    return { message: "Antagonist removed" };
  }

  @Security("admin")
  @Post("/{id}/companion/{companionId}")
  public async addCompanion(
    @Path() id: number,
    @Path() companionId: number,
  ): Promise<MessageResponse> {
    const firstPlant = Math.min(id, companionId).toString();
    const secondPlant = Math.max(id, companionId).toString();
    await addCompanion(firstPlant, secondPlant);
    this.setStatus(201);
    return { message: "Companion added successfully." };
  }

  @Security("admin")
  @Post("/{id}/antagonist/{antagonistId}")
  public async addAntagonist(
    @Path() id: number,
    @Path() antagonistId: number,
  ): Promise<MessageResponse> {
    const firstPlant = Math.min(id, antagonistId).toString();
    const secondPlant = Math.max(id, antagonistId).toString();
    await createAntagonist(firstPlant, secondPlant);
    this.setStatus(201);
    return { message: "Antagonist added successfully." };
  }
}

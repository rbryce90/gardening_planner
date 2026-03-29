import { Controller, Route, Tags, Get, Post, Put, Delete, Body, Path, Request, Security } from "tsoa";
import * as express from "express";
import {
    getGardens,
    createGarden,
    getGardenById,
    getGardenCells,
    upsertCell,
    clearCell,
    deleteGarden,
} from "../controllers/gardenController.ts";
import type {
    GardenResponse,
    GardenDetailResponse,
    GardenCreateRequest,
    CellUpdateRequest,
    MessageResponse,
} from "../types/models.ts";

@Route("v1/api/gardens")
@Tags("Gardens")
@Security("jwt")
export class GardenController extends Controller {
    @Get("/")
    public async getGardens(
        @Request() req: express.Request
    ): Promise<GardenResponse[]> {
        return await getGardens(req.user!.userId) as GardenResponse[];
    }

    @Post("/")
    public async createGarden(
        @Body() body: GardenCreateRequest,
        @Request() req: express.Request
    ): Promise<GardenResponse> {
        const { name, rows, cols } = body;
        if (!name || typeof name !== "string" || name.trim() === "") {
            this.setStatus(400);
            return { id: 0, userId: 0, name: "", rows: 0, cols: 0 };
        }
        if (typeof rows !== "number" || rows < 1 || rows > 20) {
            this.setStatus(400);
            return { id: 0, userId: 0, name: "", rows: 0, cols: 0 };
        }
        if (typeof cols !== "number" || cols < 1 || cols > 20) {
            this.setStatus(400);
            return { id: 0, userId: 0, name: "", rows: 0, cols: 0 };
        }
        const garden = await createGarden(req.user!.userId, name.trim(), rows, cols);
        this.setStatus(201);
        return garden as GardenResponse;
    }

    @Get("/{id}")
    public async getGarden(
        @Path() id: number,
        @Request() req: express.Request
    ): Promise<GardenDetailResponse> {
        const garden = await getGardenById(id, req.user!.userId);
        if (!garden) {
            this.setStatus(404);
            return { id: 0, userId: 0, name: "", rows: 0, cols: 0, cells: [] };
        }
        const cells = await getGardenCells(id);
        return { ...garden, cells } as GardenDetailResponse;
    }

    @Put("/{id}/cells/{row}/{col}")
    public async upsertCell(
        @Path() id: number,
        @Path() row: number,
        @Path() col: number,
        @Body() body: CellUpdateRequest,
        @Request() req: express.Request
    ): Promise<MessageResponse> {
        const garden = await getGardenById(id, req.user!.userId);
        if (!garden) {
            this.setStatus(404);
            return { message: "Garden not found" };
        }
        if (row < 0 || row >= garden.rows || col < 0 || col >= garden.cols) {
            this.setStatus(400);
            return { message: "Cell coordinates out of bounds" };
        }
        await upsertCell(id, row, col, body.plantId);
        return { message: "Cell updated" };
    }

    @Delete("/{id}/cells/{row}/{col}")
    public async clearCell(
        @Path() id: number,
        @Path() row: number,
        @Path() col: number,
        @Request() req: express.Request
    ): Promise<MessageResponse> {
        const garden = await getGardenById(id, req.user!.userId);
        if (!garden) {
            this.setStatus(404);
            return { message: "Garden not found" };
        }
        const deleted = await clearCell(id, row, col);
        if (deleted) {
            return { message: "Cell cleared" };
        } else {
            this.setStatus(404);
            return { message: "Cell was empty" };
        }
    }

    @Delete("/{id}")
    public async deleteGarden(
        @Path() id: number,
        @Request() req: express.Request
    ): Promise<void> {
        const deleted = await deleteGarden(id, req.user!.userId);
        if (deleted) {
            this.setStatus(204);
        } else {
            this.setStatus(404);
        }
    }
}

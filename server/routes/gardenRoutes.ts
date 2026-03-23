import { Router } from "express";
import { authMiddleware } from "../middleware/auth.ts";
import {
    getGardens,
    createGarden,
    getGardenById,
    getGardenCells,
    upsertCell,
    clearCell,
    deleteGarden,
} from "../controllers/gardenController.ts";

const gardenRouter = Router();

gardenRouter.use(authMiddleware);

gardenRouter.get("/", async (req, res, next) => {
    try {
        const gardens = await getGardens(req.user!.userId);
        res.status(200).json(gardens);
    } catch (err) {
        next(err);
    }
});

gardenRouter.post("/", async (req, res, next) => {
    try {
        const { name, rows, cols } = req.body;
        if (!name || typeof name !== "string" || name.trim() === "") {
            res.status(400).json({ message: "name is required" });
            return;
        }
        if (typeof rows !== "number" || rows < 1 || rows > 20) {
            res.status(400).json({ message: "rows must be a number between 1 and 20" });
            return;
        }
        if (typeof cols !== "number" || cols < 1 || cols > 20) {
            res.status(400).json({ message: "cols must be a number between 1 and 20" });
            return;
        }
        const garden = await createGarden(req.user!.userId, name.trim(), rows, cols);
        res.status(201).json(garden);
    } catch (err) {
        next(err);
    }
});

gardenRouter.get("/:id", async (req, res, next) => {
    try {
        const gardenId = parseInt(req.params.id, 10);
        if (isNaN(gardenId)) {
            res.status(400).json({ message: "Invalid garden ID" });
            return;
        }
        const garden = await getGardenById(gardenId, req.user!.userId);
        if (!garden) {
            res.status(404).json({ message: "Garden not found" });
            return;
        }
        const cells = await getGardenCells(gardenId);
        res.status(200).json({ ...garden, cells });
    } catch (err) {
        next(err);
    }
});

gardenRouter.put("/:id/cells/:row/:col", async (req, res, next) => {
    try {
        const gardenId = parseInt(req.params.id, 10);
        const row = parseInt(req.params.row, 10);
        const col = parseInt(req.params.col, 10);
        const { plantId } = req.body;

        if (isNaN(gardenId) || isNaN(row) || isNaN(col)) {
            res.status(400).json({ message: "Invalid garden ID, row, or col" });
            return;
        }
        if (typeof plantId !== "number") {
            res.status(400).json({ message: "plantId is required and must be a number" });
            return;
        }

        const garden = await getGardenById(gardenId, req.user!.userId);
        if (!garden) {
            res.status(404).json({ message: "Garden not found" });
            return;
        }
        if (row < 0 || row >= garden.rows || col < 0 || col >= garden.cols) {
            res.status(400).json({ message: "Cell coordinates out of bounds" });
            return;
        }

        await upsertCell(gardenId, row, col, plantId);
        res.status(200).json({ message: "Cell updated" });
    } catch (err) {
        next(err);
    }
});

gardenRouter.delete("/:id/cells/:row/:col", async (req, res, next) => {
    try {
        const gardenId = parseInt(req.params.id, 10);
        const row = parseInt(req.params.row, 10);
        const col = parseInt(req.params.col, 10);

        if (isNaN(gardenId) || isNaN(row) || isNaN(col)) {
            res.status(400).json({ message: "Invalid garden ID, row, or col" });
            return;
        }

        const garden = await getGardenById(gardenId, req.user!.userId);
        if (!garden) {
            res.status(404).json({ message: "Garden not found" });
            return;
        }

        const deleted = await clearCell(gardenId, row, col);
        if (deleted) {
            res.status(200).json({ message: "Cell cleared" });
        } else {
            res.status(404).json({ message: "Cell was empty" });
        }
    } catch (err) {
        next(err);
    }
});

gardenRouter.delete("/:id", async (req, res, next) => {
    try {
        const gardenId = parseInt(req.params.id, 10);
        if (isNaN(gardenId)) {
            res.status(400).json({ message: "Invalid garden ID" });
            return;
        }
        const deleted = await deleteGarden(gardenId, req.user!.userId);
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: "Garden not found" });
        }
    } catch (err) {
        next(err);
    }
});

export default gardenRouter;

import { Router } from "express";
import { getZones, getPlantingCalendar } from "../controllers/zoneController.ts";
import { authMiddleware } from "../middleware/auth.ts";

const zoneRouter = Router();

// GET /api/zones — public, no auth required
zoneRouter.get("/", async (_req, res, next) => {
    try {
        const zones = await getZones();
        res.status(200).json(zones);
    } catch (err) {
        next(err);
    }
});

export const calendarRouter = Router();

// GET /api/planting-calendar/:zoneId — auth required
calendarRouter.get("/:zoneId", authMiddleware, async (req, res, next) => {
    const zoneId = parseInt(req.params.zoneId, 10);
    if (isNaN(zoneId)) {
        res.status(400).json({ message: "Invalid zone ID" });
        return;
    }
    try {
        const calendar = await getPlantingCalendar(zoneId);
        res.status(200).json(calendar);
    } catch (err) {
        next(err);
    }
});

export default zoneRouter;

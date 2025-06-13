// zone routes
import { Router } from "https://deno.land/x/oak/mod.ts";
import { getZones, getZoneById, createZone, updateZone, deleteZone } from "../controllers/zoneController.ts";
import { Zone } from "../models/zoneModels.ts";
const zoneRouter = new Router({ prefix: "/api/zones" });
zoneRouter
    .get("/", async (context) => {
        const zones = await getZones();
        context.response.body = zones;
    }
    )
    .get("/:id", async (context) => {
        const id = context.params.id;
        if (!id) {
            context.response.status = 400;
            context.response.body = { message: "Invalid zone ID" };
            return;
        }
        try {
            const zone = await getZoneById(id);

            if (zone) {
                context.response.body = zone;
                return
            } else {
                context.response.status = 404;
                context.response.body = { message: "Zone not found" };
                return
            }
        } catch (err) {
            context.response.status = 404;
            context.response.body = { message: "Invalid zone ID" };
            return;
        }
    }
    )
    .post("/", async (context) => {
        const zone: Zone = await context.request.body().value;
        if (!zone.name) {
            context.response.status = 400;
            context.response.body = { message: "Invalid zone data" };
            return;
        }
        try {
            const newZone = await createZone(zone);
            context.response.status = 201;
            context.response.body = newZone;
        } catch (err) {
            context.response.status = 500;
            context.response.body = { message: err.message };
        }
    }
    )
    .put("/:id", async (context) => {
        const id = context.params.id;
        if (!id) {
            context.response.status = 400;
            context.response.body = { message: "Invalid zone ID" };
            return;
        }
        const zone: Zone = await context.request.body().value;
        if (!zone.name || !zone.description) {
            context.response.status = 400;
            context.response.body = { message: "Invalid zone data" };
            return;
        }
        try {
            const updatedZone = await updateZone(id, zone);
            if (updatedZone) {
                context.response.body = updatedZone;
            } else {
                context.response.status = 404;
                context.response.body = { message: "Zone not found" };
            }
        } catch (err) {
            context.response.status = 500;
            context.response.body = { message: err.message };
        }
    }
    )
    .delete("/:id", async (context) => {
        const id = context.params.id;
        if (!id) {
            context.response.status = 400;
            context.response.body = { message: "Invalid zone ID" };
            return;
        }
        try {
            const deleted = await deleteZone(id);
            if (deleted) {
                context.response.status = 204; // No Content
            } else {
                context.response.status = 404;
                context.response.body = { message: "Zone not found" };
            }
        } catch (err) {
            context.response.status = 500;
            context.response.body = { message: err.message };
        }
    }
    );
export default zoneRouter;
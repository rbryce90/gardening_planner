// create a plantRoutes.ts file
import { Router } from "https://deno.land/x/oak/mod.ts";
import { getPlants, getPlantById, createPlant, updatePlant, deletePlant } from "../controllers/plantController.ts";
import { Plant } from "../models/models.ts";

const plantRouter = new Router({ prefix: "/api/plants" });
plantRouter
    .get("/", async (context) => {
        const plants = await getPlants();
        context.response.body = plants;
    }
    )
    .get("/:id", async (context) => {
        const id = context.params.id;
        if (!id) {
            context.response.status = 400;
            context.response.body = { message: "Invalid plant ID" };
            return;
        }
        const plant = await getPlantById(id);
        if (plant) {
            context.response.body = plant;
        } else {
            context.response.status = 404;
            context.response.body = { message: "Plant not found" };
        }
    }
    )
    .post("/", async (context) => {
        const plant: Plant = await context.request.body().value;
        if (!plant.name || !plant.category || !plant.growth_form) {
            context.response.status = 400;
            context.response.body = { message: "Invalid plant data" };
            return;
        }
        try {
            const newPlant = await createPlant(plant);
            context.response.status = 201;
            context.response.body = newPlant;
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
            context.response.body = { message: "Invalid plant ID" };
            return;
        }
        const plant: Plant = await context.request.body().value;
        if (!plant.name || !plant.category || !plant.growth_form) {
            context.response.status = 400;
            context.response.body = { message: "Invalid plant data" };
            return;
        }
        try {
            const updatedPlant = await updatePlant(id, plant);
            if (updatedPlant) {
                context.response.body = updatedPlant;
            } else {
                context.response.status = 404;
                context.response.body = { message: "Plant not found" };
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
            context.response.body = { message: "Invalid plant ID" };
            return;
        }
        try {
            const deleted = await deletePlant(id);
            if (deleted) {
                context.response.status = 204; // No Content
            } else {
                context.response.status = 404;
                context.response.body = { message: "Plant not found" };
            }
        } catch (err) {
            context.response.status = 500;
            context.response.body = { message: err.message };
        }
    }
    );
export default plantRouter;

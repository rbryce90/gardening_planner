import { Router, Request, Response } from "express";
import { getPlants, getPlantById, createPlant, deletePlant, updatePlant, getPlantTypesByPlantIdWithCompanionsAndAtagonists, getPlantByName, addCompanion, createAntagonist } from "../controllers/plantController";
import { Plant, PlantType } from "../types/plant";

const plantRouter = Router();

// Get all plants
plantRouter.get("/", async (req, res) => {
    try {
        const plants = await getPlants();
        res.status(200).json(plants);
    } catch (err) {
        console.error("Error fetching plants:", err);
        res.status(500).json({ error: err });
    }
});

// Get plant by ID
plantRouter.get("/:id", async (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ error: "Invalid plant ID" });
        return;
    }
    try {
        const plant = await getPlantById(id);
        if (plant) {
            res.status(200).json(plant);
        } else {
            res.status(404).json({ error: "Plant not found" });
        }
    } catch (err) {
        console.error("Error fetching plant:", err);
        res.status(500).json({ error: err });
    }
});

// Get plant by ID with its associated plant types
plantRouter.get("/:name/details", async (req, res) => {
    const name = req.params.name;

    if (!name) {
        res.status(400).json({ error: "Invalid plant name" });
        return;
    }

    try {
        const plant: Plant | null = await getPlantByName(name);
        if (!plant || !plant.id) {
            res.status(404).json({ error: "Plant not found" });
            return;
        }

        const typesAndCompanions: PlantType[] = await getPlantTypesByPlantIdWithCompanionsAndAtagonists(plant.id);

        res.status(200).json({
            ...plant,
            ...typesAndCompanions
        });
    } catch (err) {
        console.error("Error fetching plant and plant types:", err);
        res.status(500).json({ error: err });
    }
});

// Create a new plant
plantRouter.post("/", async (req, res) => {
    try {
        const plant: Plant = req.body;

        // Validate the required fields
        if (!plant.name || !plant.category || !plant.growthForm) {
            res.status(400).json({ error: "Invalid plant data" });
            return;
        }

        const id = await createPlant(plant);
        res.status(201).json({ id: plant });
    } catch (err) {
        console.error("Error creating plant:", err);
        res.status(500).json({ error: err });
    }
});

// Update a plant by ID
plantRouter.put("/:id", async (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ error: "Invalid plant ID" });
        return;
    }
    const plant = req.body;
    if (!plant.name || !plant.category || !plant.growthForm) {
        res.status(400).json({ error: "Invalid plant data" });
        return;
    }
    try {
        const updatedPlant = await updatePlant(id, plant);
        res.status(200).json({ id: updatedPlant });
    } catch (err) {
        console.error("Error updating plant:", err);
        res.status(500).json({ error: err });
    }
});

// Delete a plant by ID
plantRouter.delete("/:id", async (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ error: "Invalid plant ID" });
        return;
    }
    try {
        const deleted = await deletePlant(id);
        if (deleted) {
            res.status(204).send(); // No Content
        } else {
            res.status(404).json({ error: "Plant not found" });
        }
    } catch (err) {
        console.error("Error deleting plant:", err);
        res.status(500).json({ error: err });
    }
});

// Add a companion to a plant
plantRouter.post("/:id/companion/:companionId", async (req, res) => {
    try {
        const { id, companionId } = req.params as { id: string; companionId: string };

        const firstPlant = Math.min(Number(id), Number(companionId)).toString();
        const secondPlant = Math.max(Number(id), Number(companionId)).toString();

        // Call the controller function
        await addCompanion(firstPlant, secondPlant);
        res.status(201).json({ message: "Companion added successfully." });
    } catch (err) {
        console.error("Error adding companion:", err);
        res.status(500).json({ error: err || "Internal server error" });
    }
});

// Add an antagonist to a plant
plantRouter.post("/:id/antagonist/:antagonistId", async (req, res) => {
    try {
        const { id, antagonistId } = req.params as { id: string; antagonistId: string };

        const firstPlant = Math.min(Number(id), Number(antagonistId)).toString();
        const secondPlant = Math.max(Number(id), Number(antagonistId)).toString();

        // Call the controller function
        await createAntagonist(firstPlant, secondPlant);
        res.status(201).json({ message: "Antagonist added successfully." });
    } catch (err) {
        console.error("Error adding antagonist:", err);
        res.status(500).json({ error: err || "Internal server error" });
    }
});

export default plantRouter;

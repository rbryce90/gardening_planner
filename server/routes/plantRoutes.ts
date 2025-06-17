import { Router } from "express";
import { getPlants, getPlantById, createPlant, deletePlant } from "../controllers/plantController";
import { Plant } from "../types/plant";

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
// plantRouter.put("/:id", async (req, res) => {
//     const id = req.params.id;
//     if (!id) {
//         res.status(400).json({ error: "Invalid plant ID" });
//         return;
//     }
//     const plant = req.body;
//     if (!plant.name || !plant.category || !plant.growthForm) {
//         res.status(400).json({ error: "Invalid plant data" });
//         return;
//     }
//     try {
//         const updatedPlant = await updatePlant(id, plant);
//         if (updatedPlant) {
//             res.status(200).json(updatedPlant);
//         } else {
//             res.status(404).json({ error: "Plant not found" });
//         }
//     } catch (err) {
//         console.error("Error updating plant:", err);
//         res.status(500).json({ error: err });
//     }
// });

// Delete a plant by ID
plantRouter.delete("/:id", async (req, res) => {
    console.log('here ==========================')
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

export default plantRouter;

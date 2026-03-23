import { Router } from "express";
import { getPlants, getPlantById, createPlant, deletePlant, updatePlant, getPlantTypesByPlantIdWithCompanionsAndAtagonists, getPlantByName, addCompanion, createAntagonist, getAllCompanions, getAllAntagonists } from "../controllers/plantController.ts";
import { Plant, PlantType } from "../types/plant.d.ts";

const plantRouter = Router();

plantRouter.get("/", async (req, res) => {
    const plants = await getPlants();
    res.status(200).json(plants);
});

plantRouter.get("/companions", async (req, res) => {
    const companions = await getAllCompanions();
    res.status(200).json(companions);
});

plantRouter.get("/antagonists", async (req, res) => {
    const antagonists = await getAllAntagonists();
    res.status(200).json(antagonists);
});

plantRouter.get("/:id", async (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ message: "Invalid plant ID" });
        return;
    }
    const plant = await getPlantById(id);
    if (plant) {
        res.status(200).json(plant);
    } else {
        res.status(404).json({ message: "Plant not found" });
    }
});

plantRouter.get("/:name/types", async (req, res) => {
    const name = req.params.name;

    if (!name) {
        res.status(400).json({ message: "Invalid plant name" });
        return;
    }

    const plant: Plant | null = await getPlantByName(name);
    if (!plant || !plant.id) {
        res.status(404).json({ message: "Plant not found" });
        return;
    }

    const typesAndCompanions: PlantType[] = await getPlantTypesByPlantIdWithCompanionsAndAtagonists(plant.id);

    res.status(200).json({
        ...plant,
        ...typesAndCompanions
    });
});

plantRouter.post("/", async (req, res) => {
    const plant: Plant = req.body;

    if (!plant.name || !plant.category || !plant.growthForm) {
        res.status(400).json({ message: "Invalid plant data" });
        return;
    }

    const id = await createPlant(plant);
    res.status(201).json({ id: plant });
});

plantRouter.put("/:id", async (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ message: "Invalid plant ID" });
        return;
    }
    const plant = req.body;
    if (!plant.name || !plant.category || !plant.growthForm) {
        res.status(400).json({ message: "Invalid plant data" });
        return;
    }
    const updatedPlant = await updatePlant(id, plant);
    res.status(200).json({ id: updatedPlant });
});

plantRouter.delete("/:id", async (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ message: "Invalid plant ID" });
        return;
    }
    const deleted = await deletePlant(id);
    if (deleted) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: "Plant not found" });
    }
});

plantRouter.post("/:id/companion/:companionId", async (req, res) => {
    const { id, companionId } = req.params as { id: string; companionId: string };

    const firstPlant = Math.min(Number(id), Number(companionId)).toString();
    const secondPlant = Math.max(Number(id), Number(companionId)).toString();

    await addCompanion(firstPlant, secondPlant);
    res.status(201).json({ message: "Companion added successfully." });
});

plantRouter.post("/:id/antagonist/:antagonistId", async (req, res) => {
    const { id, antagonistId } = req.params as { id: string; antagonistId: string };

    const firstPlant = Math.min(Number(id), Number(antagonistId)).toString();
    const secondPlant = Math.max(Number(id), Number(antagonistId)).toString();

    await createAntagonist(firstPlant, secondPlant);
    res.status(201).json({ message: "Antagonist added successfully." });
});

export default plantRouter;

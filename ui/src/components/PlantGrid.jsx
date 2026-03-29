import React, { useState } from "react";
import { Grid } from "@mui/material";
import api from "../services/api";
import PlantCard from "./PlantCard";
import EditPlantDialog from "./EditPlantDialog";

export default function PlantGrid({ plants, getPlants, onDeletePlant, isAdmin }) {
  const [editingPlantId, setEditingPlantId] = useState(null);
  const [editedPlant, setEditedPlant] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (plant) => {
    setEditingPlantId(plant.id);
    setEditedPlant({ ...plant });
    setIsModalOpen(true); // Open the modal
  };

  const handleSave = async (updatedPlant) => {
    setIsModalOpen(false); // Close the modal
    try {
      await api.put(`/api/plants/${editingPlantId}`, updatedPlant);

      getPlants();
      setEditingPlantId(null); // Exit edit mode
    } catch (error) {
      console.error(`Error updating plant with ID ${editingPlantId}:`, error.message);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
    setEditingPlantId(null); // Reset edit state
  };

  return (
    <>
      <Grid container spacing={3}>
        {plants.map((plant) => (
          <Grid item xs={12} sm={6} md={4} key={plant.id}>
            <PlantCard
              plant={plant}
              onEdit={isAdmin ? () => handleEditClick(plant) : null}
              onDelete={isAdmin && onDeletePlant ? () => onDeletePlant(plant.id) : null}
            />
          </Grid>
        ))}
      </Grid>

      {/* Edit Plant Dialog */}
      <EditPlantDialog
        open={isModalOpen}
        plant={editedPlant}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </>
  );
}

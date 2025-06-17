import React, { useState } from 'react';
import { Grid } from '@mui/material';
import axios from 'axios';
import PlantCard from './PlantCard';
import EditPlantDialog from './EditPlantDialog';

export default function PlantGrid({ plants, getPlants, onDeletePlant }) {
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
            await axios.put(`/api/plants/${editingPlantId}`, updatedPlant);

            getPlants()
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
                    <Grid item xs={12} sm={6} md={6} key={plant.id}>
                        <PlantCard
                            plant={plant}
                            onEdit={() => handleEditClick(plant)}
                            onDelete={() => onDeletePlant(plant.id)}
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
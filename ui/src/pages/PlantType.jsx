import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import PlantList from '../components/PlantList'; // Import the shared component

export default function PlantType() {
    const { plantName } = useParams(); // Get plantName from the URL
    const [plantData, setPlantData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPlantData();
    }, [plantName]);

    const fetchPlantData = () => {
        setLoading(true);
        axios
            .get(`/api/plants/${plantName}/types`) // Replace with your endpoint
            .then((res) => {
                setPlantData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                setError('Failed to fetch plant data');
                setLoading(false);
            });
    };

    const handleAddCompanion = () => {
        console.log('Add Companion Plant clicked');
        // Logic to open a modal or navigate to a page for selecting a new companion plant
    };

    const handleAddAntagonist = () => {
        console.log('Add Antagonist Plant clicked');
        // Logic to open a modal or navigate to a page for selecting a new antagonist plant
    };

    if (loading) {
        return (
            <Box sx={{ textAlign: 'center', marginTop: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ padding: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 4 }}>
            {/* Plant General Information */}
            <Typography variant="h4" gutterBottom>
                {plantData.name} ({plantData.category})
            </Typography>
            <Typography variant="body1" gutterBottom>
                <b>Growth Form:</b> {plantData.growthForm}
            </Typography>

            {/* Companion Plants */}
            <PlantList
                title="Companion Plants"
                plants={plantData.companions}
                fallbackMessage="No companion plants available."
                onAddPlant={handleAddCompanion} // Pass the callback for adding a companion
                renderFields={(companion) => (
                    <>
                        <Typography variant="body2" gutterBottom>
                            <b>Category:</b> {companion.category}
                        </Typography>
                        <Typography variant="body2">
                            <b>Growth Form:</b> {companion.growthForm}
                        </Typography>
                    </>
                )}
            />

            {/* Antagonist Plants */}
            <PlantList
                title="Antagonist Plants"
                plants={plantData.antagonists}
                fallbackMessage="No antagonist plants available."
                onAddPlant={handleAddAntagonist} // Pass the callback for adding an antagonist
                renderFields={(antagonist) => (
                    <>
                        <Typography variant="body2" gutterBottom>
                            <b>Category:</b> {antagonist.category}
                        </Typography>
                        <Typography variant="body2">
                            <b>Growth Form:</b> {antagonist.growthForm}
                        </Typography>
                    </>
                )}
            />
            {/* Plant Types */}
            <PlantList
                title="Plant Types"
                plants={plantData.types}
                fallbackMessage="No plant types available."
                onAddPlant={() => console.log('Add Plant Type clicked')} // Placeholder for adding plant types
                renderFields={(type) => (
                    <>
                        <Typography variant="body2" gutterBottom>
                            <b>Description:</b> {type.description}
                        </Typography>
                        <Typography variant="body2">
                            <b>Planting Notes:</b> {type.plantingNotes}
                        </Typography>
                    </>
                )}
            />
        </Box>
    );
}

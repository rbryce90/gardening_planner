import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import PlantList from '../components/PlantList'; // Import the shared component

export default function PlantType() {
    const { plantName } = useParams(); // Get plantName from the URL
    const [plantData, setPlantData] = useState(null);
    const [availablePlants, setAvailablePlants] = useState([]); // List of all available plants
    const [availableTypes, setAvailableTypes] = useState([]); // List of all available types
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCompanion, setSelectedCompanion] = useState(''); // Track selected companion
    const [selectedAntagonist, setSelectedAntagonist] = useState(''); // Track selected antagonist
    const [selectedType, setSelectedType] = useState(''); // Track selected type

    console.log('=====> ', selectedAntagonist)
    console.log('=====> ', selectedCompanion)

    useEffect(() => {
        fetchPlantData();
        fetchPlants();
    }, [plantName]);

    const fetchPlants = () => {
        axios
            .get('/api/plants/') // Replace with your endpoint to fetch all plants
            .then((res) => {
                setAvailablePlants(res.data);
            })
            .catch((err) => {
                console.error('Failed to fetch plants:', err);
            });
    }

    const fetchPlantData = () => {
        setLoading(true);
        axios
            .get(`/api/plants/${plantName}/details`) // Replace with your endpoint
            .then((res) => {
                setPlantData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                setError('Failed to fetch plant data');
                setLoading(false);
            });
    };

    const handleAddCompanion = (plantId) => {
        console.log('Add Companion Plant clicked:', plantId);
        // Logic to add the selected plant as a companion
        console.log('selectedCompanion: ', selectedCompanion)
        axios.post(`/api/plants/${plantData.id}/companion/${selectedCompanion}`).then(res => {
            console.log('res.data ===> ', res.data)
            fetchPlantData();
        }).catch(err => {
            console.error('Error adding companion plant:', err);
        })

    };
    console.log('selectedAntagonist: ', selectedAntagonist)

    const handleAddAntagonist = (plantId) => {
        console.log('Add Antagonist Plant clicked:', plantId);
        // Logic to add the selected plant as an antagonist
        axios.post(`/api/plants/${plantData.id}/antagonist/${selectedAntagonist}`).then(res => {
            console.log('res.data ===> ', res.data)
            fetchPlantData();
        }
        ).catch(err => {
            console.error('Error adding antagonist plant:', err);
        }
        )
        fetchPlantData(); // Refresh plant data after adding
    };

    const handleAddType = (typeId) => {
        console.log('Add Plant Type clicked:', typeId);
        // Logic to add the selected type to the plant

        fetchPlantData()
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
                onAddPlant={handleAddCompanion}
                availablePlants={availablePlants}
                selectedPlant={selectedCompanion}
                setSelectedPlant={setSelectedCompanion} // Pass state for companions
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
                onAddPlant={handleAddAntagonist}
                availablePlants={availablePlants}
                selectedPlant={selectedAntagonist}
                setSelectedPlant={setSelectedAntagonist} // Pass state for antagonists
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
                onAddPlant={handleAddType}
                availablePlants={availableTypes}
                selectedPlant={selectedType}
                setSelectedPlant={setSelectedType} // Pass state for plant types
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

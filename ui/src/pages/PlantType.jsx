import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, Grid } from '@mui/material';
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
            />

            {/* Antagonist Plants */}
            <PlantList
                title="Antagonist Plants"
                plants={plantData.antagonists}
                fallbackMessage="No antagonist plants available."
            />
            {/* Plant Types */}
            <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
                Plant Types
            </Typography>
            {plantData.types.length > 0 ? (
                <Grid container spacing={3}>
                    {plantData.types.map((type) => (
                        <Grid item xs={12} sm={6} md={4} key={type.name}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {type.name}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        <b>Description:</b> {type.description}
                                    </Typography>
                                    <Typography variant="body2">
                                        <b>Planting Notes:</b> {type.plantingNotes}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography variant="body1">No types available for this plant.</Typography>
            )}

        </Box>
    );
}

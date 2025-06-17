import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Button,
} from '@mui/material';
import PlantGrid from '../components/PlantGrid';
import AddPlantCard from '../components/AddPlantCard';

export default function Plants() {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addingPlant, setAddingPlant] = useState(false);

    useEffect(() => {
        getPlants();
    }, []);

    const getPlants = () => {
        setLoading(true);
        axios
            .get('/api/plants')
            .then((res) => {
                setPlants(res.data);
                setLoading(false);
            })
            .catch((err) => {
                setError('Failed to fetch plants');
                setLoading(false);
            });
    }

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
            <Typography variant="h2" gutterBottom>
                Plants
            </Typography>
            <Button
                variant="outlined"
                color="primary"
                sx={{ marginBottom: 2 }}
                onClick={() => setAddingPlant(true)}
            >
                Add Plant
            </Button>
            {addingPlant && <AddPlantCard onClose={() => setAddingPlant(false)} />}
            <PlantGrid plants={plants} getPlants={getPlants} />
        </Box>
    );
}

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Button,
} from '@mui/material';

export default function Plants() {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addingPlant, setAddingPlant] = useState(false);

    useEffect(() => {
        axios
            .get('/api/plants')
            .then((res) => {
                console.log('data ===> ', res.data)
                setPlants(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching plants:', err);
                setError('Failed to fetch plants');
                setLoading(false);
            });
    }, []);

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
            <Typography variant="h4" gutterBottom>
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
            <Grid container spacing={3}>
                {addingPlant ? <Card sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            plant.name
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            <b>Category: </b>  plant.category
                        </Typography>
                        <Typography variant="body2">
                            <b>Growth Form:</b> plant.growthForm
                        </Typography>
                    </CardContent>
                </Card> : null}
                {plants.map((plant) => (
                    <Grid item xs={12} sm={6} md={4} key={plant.id}>
                        <Card sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {plant.name}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    <b>Category: </b>  {plant.category}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Growth Form:</b> {plant.growthForm}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Edible Part: </b> {plant.ediblePart || "Not added yet"}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

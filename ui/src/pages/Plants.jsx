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
import { capitalize } from '../utils/utils';

export default function Plants() {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addingPlant, setAddingPlant] = useState(false);

    useEffect(() => {
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
            <Typography variant="h3" gutterBottom>
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
            {addingPlant ? (
                <Card sx={{ backgroundColor: '#1e1e1e', color: '#fff', position: 'relative', padding: 2, margin: '5px' }}>
                    <Button
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            minWidth: 'auto',
                            padding: 0,
                            color: '#fff',
                        }}
                        onClick={() => setAddingPlant(false)}
                    >
                        X
                    </Button>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Add New Plant
                        </Typography>
                        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <input
                                type="text"
                                placeholder={"Plant Name"}
                                style={{
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    width: '100%',
                                }}
                            />
                            <input
                                type="text"
                                placeholder={"Category"}

                                style={{
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    width: '100%',
                                }}
                            />
                            <input
                                type="text"
                                placeholder={"Growth Form"}
                                style={{
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    width: '100%',
                                }}
                            />
                            <input
                                type="text"
                                placeholder={"Edible Part"}
                                style={{
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    width: '100%',
                                }}
                            />
                            <Button variant="contained" color="primary">
                                Save Plant
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            ) : null}
            <Grid container spacing={3}>
                {plants.map((plant) => (
                    <Grid item xs={12} sm={6} md={4} key={plant.id}>
                        <Card sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {plant.name}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    <b>Category: </b>  {capitalize(plant.category)}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Growth Form:</b> {capitalize(plant.growthForm)}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Edible Part: </b> {capitalize(plant.ediblePart) || "Not added yet"}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

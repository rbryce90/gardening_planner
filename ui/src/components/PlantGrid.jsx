import React from 'react';
import { Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { capitalize } from '../utils/utils';
import axios from 'axios';

export default function PlantGrid({ plants, getPlants }) {
    const handleDelete = async (plantId) => {
        try {
            await axios.delete(`/api/plants/${plantId}`); // Replace with your endpoint
            console.log(`Plant with ID ${plantId} deleted successfully`);
            getPlants()
        } catch (error) {
            console.error(`Error deleting plant with ID ${plantId}:`, error);
        }
    };

    return (
        <Grid container spacing={3}>
            {plants.map((plant) => (
                <Grid item xs={12} sm={6} md={6} key={plant.id}> {/* Adjusted md to make cards wider */}
                    <Card
                        sx={{
                            backgroundColor: '#1e1e1e',
                            color: '#fff',
                            position: 'relative',
                            width: '100%', // Ensures the card takes full width of the grid item
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {plant.name}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                <b>Category: </b> {capitalize(plant.category)}
                            </Typography>
                            <Typography variant="body2">
                                <b>Growth Form:</b> {capitalize(plant.growthForm)}
                            </Typography>
                            <Typography variant="body2">
                                <b>Edible Part: </b> {capitalize(plant.ediblePart) || 'Not added yet'}
                            </Typography>
                        </CardContent>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => console.log('edit ')}
                                sx={{ marginRight: 1 }}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => handleDelete(plant.id)}
                            >
                                Delete
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}
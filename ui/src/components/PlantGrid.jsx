import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { capitalize } from '../utils/utils';

export default function PlantGrid({ plants }) {
    return (
        <Grid container spacing={3}>
            {plants.map((plant) => (
                <Grid item xs={12} sm={6} md={4} key={plant.id}>
                    <Card sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>
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
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}
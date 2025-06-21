import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

export default function PlantList({ title, plants, fallbackMessage }) {
    return (
        <>
            <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
                {title}
            </Typography>
            {plants.length > 0 ? (
                <Grid container spacing={3}>
                    {plants.map((plant) => (
                        <Grid item xs={12} sm={6} md={4} key={plant.name || plant.antagonist_id}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {plant.name}
                                    </Typography>
                                    {plant.category && (
                                        <Typography variant="body2" gutterBottom>
                                            <b>Category:</b> {plant.category}
                                        </Typography>
                                    )}
                                    {plant.growthForm && (
                                        <Typography variant="body2">
                                            <b>Growth Form:</b> {plant.growthForm}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography variant="body1">{fallbackMessage}</Typography>
            )}
        </>
    );
}
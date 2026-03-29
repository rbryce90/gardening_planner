import React from 'react';
import { Grid, Card, CardContent, Typography, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function PlantList({ title, plants, fallbackMessage, onAddPlant, renderFields }) {
    return (
        <>
            <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
                {title}
            </Typography>
            <Grid container spacing={3}>
                {plants.map((plant) => (
                    <Grid item xs={12} sm={6} md={4} key={plant.name || plant.id}>
                        <Card sx={{
                            height: '100%',
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                        }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {plant.name}
                                </Typography>
                                {renderFields(plant)}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* Add Plant Card */}
                {onAddPlant && (
                    <Grid item xs={12} sm={6} md={4}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                bgcolor: 'action.hover',
                                cursor: 'pointer',
                            }}
                            onClick={onAddPlant}
                        >
                            <CardContent sx={{ textAlign: 'center' }}>
                                <IconButton color="primary" size="large">
                                    <AddCircleOutlineIcon fontSize="large" />
                                </IconButton>
                                <Typography variant="body2">Add New Plant</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
            {plants.length === 0 && (
                <Typography variant="body1" sx={{ marginTop: 2 }}>
                    {fallbackMessage}
                </Typography>
            )}
        </>
    );
}
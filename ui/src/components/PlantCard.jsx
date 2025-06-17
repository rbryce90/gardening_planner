import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import { capitalize } from '../utils/utils';

export default function PlantCard({ plant, onEdit, onDelete }) {
    return (
        <Card
            sx={{
                backgroundColor: '#1e1e1e',
                color: '#fff',
                position: 'relative',
                width: '100%',
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
                    onClick={onEdit}
                    sx={{ marginRight: 1 }}
                >
                    Edit
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={onDelete}
                >
                    Delete
                </Button>
            </CardContent>
        </Card>
    );
}
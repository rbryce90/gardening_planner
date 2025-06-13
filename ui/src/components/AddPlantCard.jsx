import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

export default function AddPlantCard({ onClose }) {
    return (
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
                onClick={onClose}
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
                        placeholder="Plant Name"
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            width: '100%',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Category"
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            width: '100%',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Growth Form"
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            width: '100%',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Edible Part"
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
    );
}
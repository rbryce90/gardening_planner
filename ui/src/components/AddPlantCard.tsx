import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import axios from 'axios';
import { ediblePartsArray, growthTypesArray, categoryTypesArray } from '../models/models';

export default function AddPlantCard({ onClose }) {
    const [userInput, setUserInput] = useState({
        name: '',
        category: '',
        growthForm: '',
        ediblePart: '',
    });

    const handleChange = (field: string, value: string) => {
        setUserInput((prev) => {
            const updatedInput = { ...prev, [field]: value };
            console.log('Updated userInput:', updatedInput); // Log the updated state
            return updatedInput;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent form from refreshing the page
        try {
            console.log('userInput:', userInput);
            const response = await axios.post('/api/plants', userInput); // Replace '/api/plants' with your endpoint
            console.log('Plant added successfully:', response.data);
            onClose(); // Close the form after successful submission
        } catch (error) {
            console.error('Error adding plant:', error);
        }
    };

    return (
        <Card sx={{ backgroundColor: '#1e1e1e', color: '#fff', position: 'relative', padding: 2, marginBottom: 2 }}>
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
                <Box
                    component="form"
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    onSubmit={handleSubmit}
                >
                    <input
                        type="text"
                        placeholder="Plant Name"
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            width: '100%',
                        }}
                        value={userInput.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                    />
                    <select
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            width: '100%',
                            backgroundColor: '#fff',
                        }}
                        value={userInput.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                    >
                        <option value="" disabled>
                            Select Category
                        </option>
                        {categoryTypesArray.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    <select
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            width: '100%',
                            backgroundColor: '#fff',
                        }}
                        value={userInput.growthForm}
                        onChange={(e) => handleChange('growthForm', e.target.value)}
                    >
                        <option value="" disabled>
                            Select Growth Form
                        </option>
                        {growthTypesArray.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    <select
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            width: '100%',
                            backgroundColor: '#fff',
                        }}
                        value={userInput.ediblePart}
                        onChange={(e) => handleChange('ediblePart', e.target.value)}
                    >
                        <option value="" disabled>
                            Select Edible Part
                        </option>
                        {ediblePartsArray.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    <Button type="submit" variant="contained" color="primary">
                        Save Plant
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
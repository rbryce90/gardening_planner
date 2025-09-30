import React from 'react';
import { Grid, Card, CardContent, Typography, IconButton, MenuItem, Select, FormControl, InputLabel, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function PlantList({
    title,
    plants,
    fallbackMessage,
    onAddPlant,
    renderFields,
    availablePlants,
    selectedPlant,
    setSelectedPlant, // Pass down state management from parent
}) {
    const [isAdding, setIsAdding] = React.useState(false); // Toggle between card and dropdown

    const handleConfirmAdd = () => {
        if (selectedPlant) {
            onAddPlant(selectedPlant); // Pass the selected plant to the parent callback
            setSelectedPlant(''); // Reset the dropdown
            setIsAdding(false); // Switch back to the card
        }
    };

    return (
        <>
            <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
                {title}
            </Typography>
            <Grid container spacing={3}>
                {plants.map((plant) => (
                    <Grid item xs={12} sm={6} md={4} key={plant.name || plant.id}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {plant.name}
                                </Typography>
                                {renderFields(plant)}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* Add Plant Card or Dropdown */}
                {onAddPlant && (
                    <Grid item xs={12} sm={8} md={6}>
                        {isAdding ? (
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#333', // Dark background color
                                    color: '#fff', // White text color
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', width: '100%' }}>
                                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                                        <InputLabel
                                            shrink // Ensures the label stays above the Select
                                            sx={{ color: '#fff', fontSize: '0.9rem' }}
                                        >
                                            Select Plant
                                        </InputLabel>
                                        <Select
                                            value={selectedPlant}
                                            onChange={(e) => setSelectedPlant(e.target.value)}
                                            sx={{
                                                backgroundColor: '#fff',
                                                color: '#000',
                                                borderRadius: '8px',
                                                padding: '4px 8px', // Slimmer padding
                                                height: '36px', // Slimmer height
                                                fontSize: '0.9rem', // Smaller font size
                                                marginTop: 2, // Added marginTop to separate from InputLabel
                                            }}
                                        >
                                            {availablePlants.map((plant) => (
                                                <MenuItem key={plant.id} value={plant.id}>
                                                    {plant.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleConfirmAdd}
                                        sx={{ marginTop: 2, fontSize: '0.8rem', padding: '4px 12px' }}
                                    >
                                        Confirm
                                    </Button>
                                    <Button
                                        variant="text"
                                        color="secondary"
                                        onClick={() => setIsAdding(false)}
                                        sx={{ marginTop: 1, fontSize: '0.8rem' }}
                                    >
                                        Cancel
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#333', // Dark background color
                                    color: '#fff', // White text color
                                    cursor: 'pointer',
                                }}
                                onClick={() => setIsAdding(true)} // Switch to dropdown
                            >
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <IconButton color="primary" size="large">
                                        <AddCircleOutlineIcon fontSize="large" sx={{ color: '#fff' }} /> {/* White icon */}
                                    </IconButton>
                                    <Typography variant="body2" sx={{ color: '#fff' }}> {/* White text */}
                                        Add New Plant
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}
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
import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';

export default function EditPlantDialog({ open, plant, onClose, onSave }) {
    const [localPlant, setLocalPlant] = React.useState(plant);

    React.useEffect(() => {
        setLocalPlant(plant); // Update local state when the plant prop changes
    }, [plant]);

    const handleInputChange = (field, value) => {
        setLocalPlant((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(localPlant); // Pass updated plant data to parent component
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Edit Plant</DialogTitle>
            <DialogContent>
                <TextField
                    label="Name"
                    variant="outlined"
                    fullWidth
                    value={localPlant.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Category"
                    variant="outlined"
                    fullWidth
                    value={localPlant.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Growth Form"
                    variant="outlined"
                    fullWidth
                    value={localPlant.growthForm || ''}
                    onChange={(e) => handleInputChange('growthForm', e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Edible Part"
                    variant="outlined"
                    fullWidth
                    value={localPlant.ediblePart || ''}
                    onChange={(e) => handleInputChange('ediblePart', e.target.value)}
                    sx={{ mb: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" onClick={handleSave}>
                    Save
                </Button>
                <Button variant="contained" color="secondary" onClick={onClose}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
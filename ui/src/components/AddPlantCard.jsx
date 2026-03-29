import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';
import { ediblePartsArray, growthTypesArray, categoryTypesArray } from '../models/models';
import { capitalize } from '../utils/utils';

export default function AddPlantCard({ onClose, getPlants }) {
  const [userInput, setUserInput] = useState({
    name: '',
    category: '',
    growthForm: '',
    ediblePart: '',
  });

  const handleChange = (field, value) => {
    setUserInput((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field) => (e) => {
    handleChange(field, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/plants', userInput);
      getPlants();
      onClose();
    } catch (error) {
      console.error('Error adding plant:', error);
    }
  };

  return (
    <Card sx={{ position: 'relative', p: 2, mb: 2 }}>
      <IconButton
        sx={{ position: 'absolute', top: 8, right: 8 }}
        onClick={onClose}
        size="small"
      >
        <CloseIcon />
      </IconButton>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Add New Plant
        </Typography>
        <Box
          component="form"
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          onSubmit={handleSubmit}
        >
          <TextField
            label="Plant Name"
            variant="outlined"
            fullWidth
            value={userInput.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={userInput.category}
              onChange={handleSelectChange('category')}
            >
              {categoryTypesArray.map((type) => (
                <MenuItem key={type} value={type}>
                  {capitalize(type)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Growth Form</InputLabel>
            <Select
              label="Growth Form"
              value={userInput.growthForm}
              onChange={handleSelectChange('growthForm')}
            >
              {growthTypesArray.map((type) => (
                <MenuItem key={type} value={type}>
                  {capitalize(type)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Edible Part</InputLabel>
            <Select
              label="Edible Part"
              value={userInput.ediblePart}
              onChange={handleSelectChange('ediblePart')}
            >
              {ediblePartsArray.map((type) => (
                <MenuItem key={type} value={type}>
                  {capitalize(type)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary">
            Save Plant
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

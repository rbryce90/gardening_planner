import { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { categoryTypesArray, growthTypesArray, ediblePartsArray } from "../models/models";
import { capitalize } from "../utils/utils";

export default function EditPlantDialog({ open, plant, onClose, onSave }) {
  const [localPlant, setLocalPlant] = useState(plant);

  useEffect(() => {
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
          value={localPlant.name || ""}
          onChange={(e) => handleInputChange("name", e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select
            label="Category"
            value={localPlant.category || ""}
            onChange={(e) => handleInputChange("category", e.target.value)}
          >
            {categoryTypesArray.map((c) => (
              <MenuItem key={c} value={c}>
                {capitalize(c)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Growth Form</InputLabel>
          <Select
            label="Growth Form"
            value={localPlant.growthForm || ""}
            onChange={(e) => handleInputChange("growthForm", e.target.value)}
          >
            {growthTypesArray.map((g) => (
              <MenuItem key={g} value={g}>
                {capitalize(g)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Edible Part</InputLabel>
          <Select
            label="Edible Part"
            value={localPlant.ediblePart || ""}
            onChange={(e) => handleInputChange("ediblePart", e.target.value)}
          >
            {ediblePartsArray.map((p) => (
              <MenuItem key={p} value={p}>
                {capitalize(p)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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

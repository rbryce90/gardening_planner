import React from "react";
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

const CATEGORIES = [
  "vegetable",
  "fruit",
  "herb",
  "grain",
  "legume",
  "flower",
  "tree",
  "root",
  "nut",
];
const GROWTH_FORMS = ["annual", "perennial", "biennial"];
const EDIBLE_PARTS = [
  "fruit",
  "leaf",
  "root",
  "seed",
  "stem",
  "flower",
  "bulb",
  "tuber",
  "whole",
  "none",
];

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
            {CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
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
            {GROWTH_FORMS.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
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
            {EDIBLE_PARTS.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
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

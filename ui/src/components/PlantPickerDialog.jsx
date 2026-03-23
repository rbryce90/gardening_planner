import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";

export default function PlantPickerDialog({ open, onClose, onSelect, plants, currentPlant }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Plant</DialogTitle>
      <DialogContent>
        {currentPlant && (
          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{ mb: 1 }}
            onClick={() => onSelect(null)}
          >
            Remove Plant
          </Button>
        )}
        <List dense>
          {(plants || []).map((plant) => (
            <ListItemButton key={plant.id} onClick={() => onSelect(plant)}>
              <ListItemText primary={plant.name} secondary={plant.category} />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

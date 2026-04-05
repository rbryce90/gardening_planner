import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  TextField,
} from "@mui/material";

export default function PlantPickerDialog({
  open,
  onClose,
  onSelect,
  plants,
  currentPlant,
  companions = [],
  antagonists = [],
  neighborPlantIds = [],
}) {
  const pairKey = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;

  const companionSet = new Set(
    companions.map(({ plantId, companionId }) => pairKey(plantId, companionId)),
  );
  const antagonistSet = new Set(
    antagonists.map(({ plantId, antagonistId }) => pairKey(plantId, antagonistId)),
  );

  // Categorize each plant relative to neighbors
  const categorized = (plants || []).map((plant) => {
    let relation = "neutral";
    for (const nId of neighborPlantIds) {
      const key = pairKey(plant.id, nId);
      if (antagonistSet.has(key)) {
        relation = "antagonist";
        break;
      }
      if (companionSet.has(key)) relation = "companion";
    }
    return { ...plant, relation };
  });

  const [search, setSearch] = useState("");
  const filtered = search
    ? categorized.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : categorized;

  const companionPlants = filtered.filter((p) => p.relation === "companion");
  const neutralPlants = filtered.filter((p) => p.relation === "neutral");
  const antagonistPlants = filtered.filter((p) => p.relation === "antagonist");

  const hasNeighbors = neighborPlantIds.length > 0;

  const renderPlant = (plant) => (
    <ListItemButton
      key={plant.id}
      onClick={() => onSelect(plant)}
      sx={{
        borderLeft:
          plant.relation === "companion"
            ? "3px solid"
            : plant.relation === "antagonist"
              ? "3px solid"
              : "3px solid transparent",
        borderColor:
          plant.relation === "companion"
            ? "success.main"
            : plant.relation === "antagonist"
              ? "error.main"
              : "transparent",
        transition: "background-color 0.15s",
      }}
    >
      <ListItemText primary={plant.name} secondary={plant.category} />
      {hasNeighbors && plant.relation === "companion" && (
        <Typography variant="caption" sx={{ color: "success.main", ml: 1 }}>
          companion
        </Typography>
      )}
      {hasNeighbors && plant.relation === "antagonist" && (
        <Typography variant="caption" sx={{ color: "error.main", ml: 1 }}>
          conflict
        </Typography>
      )}
    </ListItemButton>
  );

  return (
    <Dialog
      open={open}
      onClose={() => {
        setSearch("");
        onClose();
      }}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Select Plant</DialogTitle>
      <DialogContent>
        <TextField
          size="small"
          label="Search plants"
          placeholder="Search plants..."
          fullWidth
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 1 }}
        />
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
          {hasNeighbors && companionPlants.length > 0 && (
            <>
              <Typography variant="caption" color="success.main" sx={{ px: 2, pt: 1 }}>
                Good neighbors
              </Typography>
              {companionPlants.map(renderPlant)}
              <Divider sx={{ my: 0.5 }} />
            </>
          )}
          {neutralPlants.map(renderPlant)}
          {hasNeighbors && antagonistPlants.length > 0 && (
            <>
              <Divider sx={{ my: 0.5 }} />
              <Typography variant="caption" color="error.main" sx={{ px: 2, pt: 1 }}>
                Conflicts with neighbors
              </Typography>
              {antagonistPlants.map(renderPlant)}
            </>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

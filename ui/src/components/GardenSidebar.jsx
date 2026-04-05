import {
  Box,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
  TextField,
} from "@mui/material";

export default function GardenSidebar({
  gardens,
  selectedGarden,
  paintPlant,
  setPaintPlant,
  plantSearch,
  setPlantSearch,
  plants,
  onSelectGarden,
  onNewGarden,
  onDeleteGarden,
  onCloseMobile,
}) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        My Gardens
      </Typography>
      <Button
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        onClick={() => {
          onNewGarden();
          onCloseMobile?.();
        }}
      >
        New Garden
      </Button>
      <Divider sx={{ mb: 1 }} />
      <List dense>
        {gardens.map((g) => (
          <ListItemButton
            key={g.id}
            selected={selectedGarden?.id === g.id}
            onClick={() => {
              onSelectGarden(g.id);
              onCloseMobile?.();
            }}
          >
            <ListItemText primary={g.name} secondary={`${g.rows}x${g.cols}`} />
          </ListItemButton>
        ))}
      </List>

      {selectedGarden && (
        <>
          <Divider sx={{ my: 2 }} />
          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{ mb: 2 }}
            onClick={onDeleteGarden}
          >
            Delete Garden
          </Button>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Paint Mode
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            Select a plant, then click cells to place it. Right-click to erase.
          </Typography>
          {paintPlant ? (
            <Chip
              label={paintPlant.name}
              onDelete={() => setPaintPlant(null)}
              color="primary"
              sx={{ mb: 1, width: "100%" }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              No plant selected
            </Typography>
          )}
          <TextField
            size="small"
            label="Search plants"
            placeholder="Search plants..."
            fullWidth
            value={plantSearch}
            onChange={(e) => setPlantSearch(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Box sx={{ maxHeight: 200, overflow: "auto" }}>
            <List dense>
              {plants
                .filter((p) => p.name.toLowerCase().includes(plantSearch.toLowerCase()))
                .map((p) => (
                  <ListItemButton
                    key={p.id}
                    selected={paintPlant?.id === p.id}
                    onClick={() => setPaintPlant(paintPlant?.id === p.id ? null : p)}
                    sx={{ py: 0.25 }}
                  >
                    <ListItemText primary={p.name} slotProps={{ primary: { variant: "body2" } }} />
                  </ListItemButton>
                ))}
            </List>
          </Box>
        </>
      )}
    </Box>
  );
}

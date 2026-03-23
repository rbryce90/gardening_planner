import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from "@mui/material";
import { getMe } from "../services/authService";
import {
  getGardens,
  createGarden,
  getGarden,
  upsertCell,
  clearCell,
  getAllCompanions,
  getAllAntagonists,
} from "../services/gardenService";
import GardenGrid from "../components/GardenGrid";
import PlantPickerDialog from "../components/PlantPickerDialog";

export default function Garden() {
  const navigate = useNavigate();
  const [gardens, setGardens] = useState([]);
  const [selectedGarden, setSelectedGarden] = useState(null);
  const [plants, setPlants] = useState([]);
  const [companions, setCompanions] = useState([]);
  const [antagonists, setAntagonists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGardenName, setNewGardenName] = useState("");
  const [newRows, setNewRows] = useState(4);
  const [newCols, setNewCols] = useState(4);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerCell, setPickerCell] = useState(null);

  useEffect(() => {
    getMe()
      .then(() => {
        return Promise.all([
          getGardens(),
          axios.get("/api/plants"),
          getAllCompanions(),
          getAllAntagonists(),
        ]);
      })
      .then(([gardensRes, plantsRes, companionsRes, antagonistsRes]) => {
        setGardens(gardensRes.data);
        setPlants(plantsRes.data);
        setCompanions(companionsRes.data);
        setAntagonists(antagonistsRes.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Failed to load garden data");
          setLoading(false);
        }
      });
  }, [navigate]);

  const handleSelectGarden = (gardenId) => {
    getGarden(gardenId)
      .then((res) => setSelectedGarden(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load garden"));
  };

  const handleCreateGarden = () => {
    if (!newGardenName.trim()) {
      setError("Garden name is required");
      return;
    }
    const rows = parseInt(newRows, 10);
    const cols = parseInt(newCols, 10);
    if (rows < 1 || rows > 20 || cols < 1 || cols > 20) {
      setError("Rows and columns must be between 1 and 20");
      return;
    }
    createGarden(newGardenName.trim(), rows, cols)
      .then((res) => {
        const created = res.data;
        return getGardens().then((gardensRes) => {
          setGardens(gardensRes.data);
          return getGarden(created.id);
        });
      })
      .then((gardenRes) => {
        setSelectedGarden(gardenRes.data);
        setShowCreateDialog(false);
        setNewGardenName("");
        setNewRows(4);
        setNewCols(4);
        setError("");
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to create garden"));
  };

  const handleCellClick = (row, col, cell) => {
    setPickerCell({ row, col, cell });
    setPickerOpen(true);
  };

  const handlePlantSelect = (plant) => {
    if (!selectedGarden || !pickerCell) return;
    const { row, col } = pickerCell;
    const action = plant
      ? upsertCell(selectedGarden.id, row, col, plant.id)
      : clearCell(selectedGarden.id, row, col);
    action
      .then(() => getGarden(selectedGarden.id))
      .then((res) => {
        setSelectedGarden(res.data);
        setPickerOpen(false);
        setPickerCell(null);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to update cell"));
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 64px)" }}>
      {/* Left sidebar */}
      <Box
        sx={{
          width: 280,
          borderRight: 1,
          borderColor: "divider",
          p: 2,
          overflow: "auto",
        }}
      >
        <Typography variant="h6" gutterBottom>
          My Gardens
        </Typography>
        <Button
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          onClick={() => setShowCreateDialog(true)}
        >
          New Garden
        </Button>
        <Divider sx={{ mb: 1 }} />
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        <List dense>
          {gardens.map((g) => (
            <ListItemButton
              key={g.id}
              selected={selectedGarden?.id === g.id}
              onClick={() => handleSelectGarden(g.id)}
            >
              <ListItemText primary={g.name} secondary={`${g.rows}x${g.cols}`} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Right panel */}
      <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
        {selectedGarden ? (
          <>
            <Typography variant="h5" gutterBottom>
              {selectedGarden.name}
            </Typography>
            <GardenGrid
              garden={selectedGarden}
              cells={selectedGarden.cells}
              companions={companions}
              antagonists={antagonists}
              onCellClick={handleCellClick}
            />
          </>
        ) : (
          <Typography color="text.secondary">Select or create a garden</Typography>
        )}
      </Box>

      {/* Create garden dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)}>
        <DialogTitle>New Garden</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={newGardenName}
            onChange={(e) => setNewGardenName(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            label="Rows"
            type="number"
            variant="outlined"
            fullWidth
            value={newRows}
            onChange={(e) => setNewRows(e.target.value)}
            inputProps={{ min: 1, max: 20 }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Columns"
            type="number"
            variant="outlined"
            fullWidth
            value={newCols}
            onChange={(e) => setNewCols(e.target.value)}
            inputProps={{ min: 1, max: 20 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateGarden}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Plant picker dialog */}
      <PlantPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePlantSelect}
        plants={plants}
        currentPlant={pickerCell?.cell ?? null}
      />
    </Box>
  );
}

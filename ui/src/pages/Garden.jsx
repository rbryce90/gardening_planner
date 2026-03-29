import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
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
  Chip,
  Drawer,
  IconButton,
  Fab,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
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
import Notification from "../components/Notification";

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
  // Paint mode: select a plant, then click cells to paint it
  const [paintPlant, setPaintPlant] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    getMe()
      .then(() => {
        return Promise.all([
          getGardens(),
          api.get("/api/plants"),
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
          const msg = err.response?.data?.message || err.message || "Failed to load garden data";
          setError(`${msg} (${err.response?.status || "network error"})`);
          setLoading(false);
        }
      });
  }, [navigate]);

  const handleSelectGarden = (gardenId) => {
    getGarden(gardenId)
      .then((res) => setSelectedGarden(res.data))
      .catch((err) => setError(`Failed to load garden: ${err.response?.data?.message || err.message}`));
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
        setSuccessMsg("Garden created");
      })
      .catch((err) => setError(`Failed to create garden: ${err.response?.data?.message || err.message}`));
  };

  const handleCellClick = (row, col, cell) => {
    if (paintPlant) {
      // Paint mode: optimistically update local state, fire API in background
      setSelectedGarden((prev) => {
        if (!prev) return prev;
        const existing = (prev.cells || []).filter(
          (c) => !(c.row === row && c.col === col)
        );
        return {
          ...prev,
          cells: [
            ...existing,
            { row, col, plantId: paintPlant.id, plantName: paintPlant.name },
          ],
        };
      });
      upsertCell(selectedGarden.id, row, col, paintPlant.id).catch((err) =>
        setError(`Failed to paint cell: ${err.response?.data?.message || err.message}`)
      );
    } else {
      // Normal mode: open picker
      setPickerCell({ row, col, cell });
      setPickerOpen(true);
    }
  };

  const handleCellRightClick = (row, col) => {
    if (!selectedGarden) return;
    setSelectedGarden((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cells: (prev.cells || []).filter(
          (c) => !(c.row === row && c.col === col)
        ),
      };
    });
    clearCell(selectedGarden.id, row, col).catch(() => {});
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
      .catch((err) => setError(`Failed to update cell: ${err.response?.data?.message || err.message}`));
  };

  // Get neighbor plant IDs for a cell to sort the picker
  const getNeighborPlantIds = () => {
    if (!pickerCell || !selectedGarden) return [];
    const { row, col } = pickerCell;
    const cellGrid = {};
    (selectedGarden.cells || []).forEach((c) => { cellGrid[`${c.row},${c.col}`] = c; });
    const ids = [];
    for (const [nr, nc] of [[row-1,col],[row+1,col],[row,col-1],[row,col+1]]) {
      const n = cellGrid[`${nr},${nc}`];
      if (n) ids.push(n.plantId);
    }
    return ids;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", height: "calc(100vh - 64px)" }}>
        <Box sx={{ width: 280, p: 2, borderRight: 1, borderColor: "divider", display: { xs: 'none', md: 'block' } }}>
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={36} sx={{ mb: 2, borderRadius: 1 }} />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="text" height={28} sx={{ mb: 1 }} />
          ))}
        </Box>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  const sidebarContent = (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        My Gardens
      </Typography>
      <Button
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        onClick={() => { setShowCreateDialog(true); setSidebarOpen(false); }}
      >
        New Garden
      </Button>
      <Divider sx={{ mb: 1 }} />
      <List dense>
        {gardens.map((g) => (
          <ListItemButton
            key={g.id}
            selected={selectedGarden?.id === g.id}
            onClick={() => { handleSelectGarden(g.id); setSidebarOpen(false); }}
          >
            <ListItemText primary={g.name} secondary={`${g.rows}x${g.cols}`} />
          </ListItemButton>
        ))}
      </List>

      {selectedGarden && (
        <>
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
          <Box sx={{ maxHeight: 200, overflow: "auto" }}>
            <List dense>
              {plants.map((p) => (
                <ListItemButton
                  key={p.id}
                  selected={paintPlant?.id === p.id}
                  onClick={() => setPaintPlant(paintPlant?.id === p.id ? null : p)}
                  sx={{ py: 0.25 }}
                >
                  <ListItemText
                    primary={p.name}
                    slotProps={{ primary: { variant: "body2" } }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 64px)" }}>
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <Fab
          size="small"
          color="primary"
          onClick={() => setSidebarOpen(true)}
          sx={{ position: "fixed", bottom: 24, left: 24, zIndex: 1200 }}
        >
          <MenuIcon />
        </Fab>
      )}

      {/* Sidebar: drawer on mobile, fixed on desktop */}
      {isMobile ? (
        <Drawer
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        >
          <Box sx={{ width: 280 }}>
            {sidebarContent}
          </Box>
        </Drawer>
      ) : (
        <Box
          sx={{
            width: 280,
            borderRight: 1,
            borderColor: "divider",
            overflow: "auto",
          }}
        >
          {sidebarContent}
        </Box>
      )}

      {/* Right panel */}
      <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {selectedGarden ? (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography variant="h5">
                {selectedGarden.name}
              </Typography>
              {paintPlant && (
                <Chip
                  label={`Painting: ${paintPlant.name}`}
                  color="primary"
                  size="small"
                  onDelete={() => setPaintPlant(null)}
                />
              )}
            </Box>
            <GardenGrid
              garden={selectedGarden}
              cells={selectedGarden.cells}
              companions={companions}
              antagonists={antagonists}
              onCellClick={handleCellClick}
              onCellRightClick={handleCellRightClick}
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
            slotProps={{ htmlInput: { min: 1, max: 20 } }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Columns"
            type="number"
            variant="outlined"
            fullWidth
            value={newCols}
            onChange={(e) => setNewCols(e.target.value)}
            slotProps={{ htmlInput: { min: 1, max: 20 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateGarden}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Plant picker dialog (normal mode) */}
      <PlantPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePlantSelect}
        plants={plants}
        currentPlant={pickerCell?.cell ?? null}
        companions={companions}
        antagonists={antagonists}
        neighborPlantIds={getNeighborPlantIds()}
      />

      <Notification message={successMsg} open={!!successMsg} onClose={() => setSuccessMsg("")} />
    </Box>
  );
}

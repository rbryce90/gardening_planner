import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Drawer,
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
  deleteGarden,
} from "../services/gardenService";
import GardenGrid from "../components/GardenGrid";
import PlantPickerDialog from "../components/PlantPickerDialog";
import PlantGraph from "../components/PlantGraph";
import Notification from "../components/Notification";
import CreateGardenDialog from "../components/CreateGardenDialog";
import GardenSidebar from "../components/GardenSidebar";
import GardenPicker from "./GardenPicker";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerCell, setPickerCell] = useState(null);
  const [paintPlant, setPaintPlant] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [plantSearch, setPlantSearch] = useState("");
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
      .catch((err) =>
        setError(`Failed to load garden: ${err.response?.data?.message || err.message}`),
      );
  };

  const handleCreateGarden = (name, rows, cols) => {
    if (!name.trim()) {
      setError("Garden name is required");
      return;
    }
    const r = parseInt(rows, 10);
    const c = parseInt(cols, 10);
    if (r < 1 || r > 20 || c < 1 || c > 20) {
      setError("Rows and columns must be between 1 and 20");
      return;
    }
    createGarden(name.trim(), r, c)
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
        setError("");
        setSuccessMsg("Garden created");
      })
      .catch((err) =>
        setError(`Failed to create garden: ${err.response?.data?.message || err.message}`),
      );
  };

  const handleDeleteGarden = () => {
    if (!selectedGarden) return;
    deleteGarden(selectedGarden.id)
      .then(() => {
        setShowDeleteConfirm(false);
        setSelectedGarden(null);
        return getGardens();
      })
      .then((gardensRes) => {
        setGardens(gardensRes.data);
        setSuccessMsg("Garden deleted");
      })
      .catch((err) =>
        setError(`Failed to delete garden: ${err.response?.data?.message || err.message}`),
      );
  };

  const handleCellClick = (row, col, cell) => {
    if (paintPlant) {
      setSelectedGarden((prev) => {
        if (!prev) return prev;
        const existing = (prev.cells || []).filter((c) => !(c.row === row && c.col === col));
        return {
          ...prev,
          cells: [...existing, { row, col, plantId: paintPlant.id, plantName: paintPlant.name }],
        };
      });
      setSelectedPlant({ id: paintPlant.id, name: paintPlant.name });
      setLiveAnnouncement(`${paintPlant.name} placed at row ${row + 1}, column ${col + 1}`);
      upsertCell(selectedGarden.id, row, col, paintPlant.id).catch((err) =>
        setError(`Failed to paint cell: ${err.response?.data?.message || err.message}`),
      );
    } else if (cell?.plantId) {
      setSelectedPlant({ id: cell.plantId, name: cell.plantName });
    } else {
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
        cells: (prev.cells || []).filter((c) => !(c.row === row && c.col === col)),
      };
    });
    setLiveAnnouncement(`Cell cleared at row ${row + 1}, column ${col + 1}`);
    clearCell(selectedGarden.id, row, col).catch((err) =>
      setError(`Failed to clear cell: ${err.response?.data?.message || err.message}`),
    );
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
      .catch((err) =>
        setError(`Failed to update cell: ${err.response?.data?.message || err.message}`),
      );
  };

  const getNeighborPlantIds = () => {
    if (!pickerCell || !selectedGarden) return [];
    const { row, col } = pickerCell;
    const cellGrid = {};
    (selectedGarden.cells || []).forEach((c) => {
      cellGrid[`${c.row},${c.col}`] = c;
    });
    const ids = [];
    for (const [nr, nc] of [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ]) {
      const n = cellGrid[`${nr},${nc}`];
      if (n) ids.push(n.plantId);
    }
    return ids;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", height: "calc(100vh - 64px)" }}>
        <Box
          sx={{
            width: 280,
            p: 2,
            borderRight: 1,
            borderColor: "divider",
            display: { xs: "none", md: "block" },
          }}
        >
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

  if (!selectedGarden) {
    return (
      <GardenPicker
        gardens={gardens}
        error={error}
        setError={setError}
        successMsg={successMsg}
        setSuccessMsg={setSuccessMsg}
        liveAnnouncement={liveAnnouncement}
        showCreateDialog={showCreateDialog}
        setShowCreateDialog={setShowCreateDialog}
        onSelectGarden={handleSelectGarden}
        onCreateGarden={handleCreateGarden}
      />
    );
  }

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 64px)" }}>
      {isMobile && (
        <Fab
          size="small"
          color="primary"
          aria-label="Open garden sidebar"
          onClick={() => setSidebarOpen(true)}
          sx={{ position: "fixed", bottom: 24, left: 24, zIndex: 1200 }}
        >
          <MenuIcon />
        </Fab>
      )}

      {isMobile ? (
        <Drawer
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          aria-label="Garden sidebar"
        >
          <Box sx={{ width: 280 }}>
            <GardenSidebar
              gardens={gardens}
              selectedGarden={selectedGarden}
              paintPlant={paintPlant}
              setPaintPlant={setPaintPlant}
              plantSearch={plantSearch}
              setPlantSearch={setPlantSearch}
              plants={plants}
              onSelectGarden={handleSelectGarden}
              onNewGarden={() => setShowCreateDialog(true)}
              onDeleteGarden={() => setShowDeleteConfirm(true)}
              onCloseMobile={() => setSidebarOpen(false)}
            />
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
          <GardenSidebar
            gardens={gardens}
            selectedGarden={selectedGarden}
            paintPlant={paintPlant}
            setPaintPlant={setPaintPlant}
            plantSearch={plantSearch}
            setPlantSearch={setPlantSearch}
            plants={plants}
            onSelectGarden={handleSelectGarden}
            onNewGarden={() => setShowCreateDialog(true)}
            onDeleteGarden={() => setShowDeleteConfirm(true)}
          />
        </Box>
      )}

      <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Typography variant="h5">{selectedGarden.name}</Typography>
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
        {selectedPlant && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {selectedPlant.name}
              </Typography>
              <Chip label="Close" size="small" onDelete={() => setSelectedPlant(null)} />
            </Box>
            <PlantGraph plantId={selectedPlant.id} compact />
          </Box>
        )}
      </Box>

      <CreateGardenDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateGarden}
      />

      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Delete Garden</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{selectedGarden?.name}&quot;? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteGarden}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

      <Box
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          clipPath: "inset(50%)",
          whiteSpace: "nowrap",
        }}
      >
        {liveAnnouncement}
      </Box>
    </Box>
  );
}

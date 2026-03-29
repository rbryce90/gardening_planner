import React, { useEffect, useState, useRef } from "react";
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
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import GridViewIcon from "@mui/icons-material/GridView";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import { getMe } from "../services/authService";
import {
  getGardens,
  createGarden,
  getGarden,
  deleteGarden,
  upsertCell,
  clearCell,
  getAllCompanions,
  getAllAntagonists,
} from "../services/gardenService";
import GardenGrid from "../components/GardenGrid";
import PlantGraph from "../components/PlantGraph";
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
  const [paintPlant, setPaintPlant] = useState(null);
  const [eraseMode, setEraseMode] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [plantSearch, setPlantSearch] = useState("");
  const [pendingDeleteGarden, setPendingDeleteGarden] = useState(null);
  const hoverTimerRef = useRef(null);
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
      .catch((err) =>
        setError(`Failed to create garden: ${err.response?.data?.message || err.message}`),
      );
  };

  const handleDeleteGarden = () => {
    if (!pendingDeleteGarden) return;
    deleteGarden(pendingDeleteGarden.id)
      .then(() => getGardens())
      .then((res) => {
        setGardens(res.data);
        setPendingDeleteGarden(null);
        setSuccessMsg("Garden deleted");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to delete garden");
        setPendingDeleteGarden(null);
      });
  };

  const handleCellClick = (row, col, cell) => {
    setSelectedCell({ row, col });

    if (eraseMode) {
      setSelectedGarden((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          cells: (prev.cells || []).filter((c) => !(c.row === row && c.col === col)),
        };
      });
      clearCell(selectedGarden.id, row, col).catch(() => {});
    } else if (paintPlant) {
      setSelectedGarden((prev) => {
        if (!prev) return prev;
        const existing = (prev.cells || []).filter((c) => !(c.row === row && c.col === col));
        return {
          ...prev,
          cells: [...existing, { row, col, plantId: paintPlant.id, plantName: paintPlant.name }],
        };
      });
      setSelectedPlant({ id: paintPlant.id, name: paintPlant.name });
      upsertCell(selectedGarden.id, row, col, paintPlant.id).catch((err) =>
        setError(`Failed to paint cell: ${err.response?.data?.message || err.message}`),
      );
    } else if (cell?.plantId) {
      setSelectedPlant({ id: cell.plantId, name: cell.plantName });
    }
  };

  const handleCellRightClick = (row, col) => {
    if (!selectedGarden) return;
    setPaintPlant(null);
    setEraseMode(true);
  };

  // Get neighbor plant IDs for the selected cell to sort the plant list
  const getNeighborPlantIds = () => {
    if (!selectedCell || !selectedGarden) return [];
    const { row, col } = selectedCell;
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

  const pairKey = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;
  const companionSet = new Set(
    companions.map(({ plantId, companionId }) => pairKey(plantId, companionId)),
  );
  const antagonistSet = new Set(
    antagonists.map(({ plantId, antagonistId }) => pairKey(plantId, antagonistId)),
  );
  const neighborIds = getNeighborPlantIds();
  const hasNeighbors = neighborIds.length > 0;

  const categorizePlant = (plant) => {
    let relation = "neutral";
    for (const nId of neighborIds) {
      const key = pairKey(plant.id, nId);
      if (antagonistSet.has(key)) {
        relation = "antagonist";
        break;
      }
      if (companionSet.has(key)) relation = "companion";
    }
    return { ...plant, relation };
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

  const sidebarContent = (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        My Gardens
      </Typography>
      <Button
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        onClick={() => {
          setShowCreateDialog(true);
          setSidebarOpen(false);
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
              handleSelectGarden(g.id);
              setSidebarOpen(false);
            }}
          >
            <ListItemText primary={g.name} secondary={`${g.rows}x${g.cols}`} />
          </ListItemButton>
        ))}
      </List>

      {selectedGarden &&
        (() => {
          const filtered = plants.filter((p) =>
            p.name.toLowerCase().includes(plantSearch.toLowerCase()),
          );
          const categorized = filtered.map(categorizePlant);
          const companionPlants = categorized.filter((p) => p.relation === "companion");
          const neutralPlants = categorized.filter((p) => p.relation === "neutral");
          const antagonistPlants = categorized.filter((p) => p.relation === "antagonist");

          const renderPlantItem = (p) => (
            <ListItemButton
              key={p.id}
              selected={paintPlant?.id === p.id}
              onClick={() => {
                setEraseMode(false);
                setPaintPlant(paintPlant?.id === p.id ? null : p);
              }}
              onMouseEnter={() => {
                clearTimeout(hoverTimerRef.current);
                hoverTimerRef.current = setTimeout(() => {
                  setSelectedPlant({ id: p.id, name: p.name });
                }, 1000);
              }}
              onMouseLeave={() => {
                clearTimeout(hoverTimerRef.current);
                if (paintPlant) {
                  setSelectedPlant({ id: paintPlant.id, name: paintPlant.name });
                } else {
                  setSelectedPlant(null);
                }
              }}
              sx={{
                py: 0.25,
                borderLeft: "3px solid",
                borderColor:
                  p.relation === "companion"
                    ? "success.main"
                    : p.relation === "antagonist"
                      ? "error.main"
                      : "transparent",
              }}
            >
              <ListItemText primary={p.name} slotProps={{ primary: { variant: "body2" } }} />
              {hasNeighbors && p.relation === "companion" && (
                <Typography variant="caption" sx={{ color: "success.main", ml: 1 }}>
                  companion
                </Typography>
              )}
              {hasNeighbors && p.relation === "antagonist" && (
                <Typography variant="caption" sx={{ color: "error.main", ml: 1 }}>
                  conflict
                </Typography>
              )}
            </ListItemButton>
          );

          return (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Plants
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                Select a plant, then click cells to place it. Right-click to erase.
              </Typography>
              {eraseMode ? (
                <Chip
                  label="Eraser"
                  onDelete={() => setEraseMode(false)}
                  color="error"
                  sx={{ mb: 1, width: "100%" }}
                />
              ) : paintPlant ? (
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
                placeholder="Search plants..."
                fullWidth
                value={plantSearch}
                onChange={(e) => setPlantSearch(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                <List dense>
                  {hasNeighbors && companionPlants.length > 0 && (
                    <>
                      <Typography variant="caption" color="success.main" sx={{ px: 2, pt: 1 }}>
                        Good neighbors
                      </Typography>
                      {companionPlants.map(renderPlantItem)}
                      <Divider sx={{ my: 0.5 }} />
                    </>
                  )}
                  {neutralPlants.map(renderPlantItem)}
                  {hasNeighbors && antagonistPlants.length > 0 && (
                    <>
                      <Divider sx={{ my: 0.5 }} />
                      <Typography variant="caption" color="error.main" sx={{ px: 2, pt: 1 }}>
                        Conflicts with neighbors
                      </Typography>
                      {antagonistPlants.map(renderPlantItem)}
                    </>
                  )}
                </List>
              </Box>
            </>
          );
        })()}
    </Box>
  );

  // No garden selected: full-page garden picker
  if (!selectedGarden) {
    return (
      <Box sx={{ minHeight: "calc(100vh - 64px)", p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <LocalFloristIcon sx={{ fontSize: 36, color: "success.main" }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            My Gardens
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {gardens.length > 0
            ? "Select a garden to start planning."
            : "Create your first garden to get started."}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
            gap: 3,
          }}
        >
          {gardens.map((g) => (
            <Card
              key={g.id}
              sx={{
                height: 160,
                cursor: "pointer",
                position: "relative",
                background:
                  "linear-gradient(135deg, rgba(76,175,80,0.08) 0%, rgba(76,175,80,0.02) 100%)",
                border: "1px solid",
                borderColor: "divider",
                borderLeft: "4px solid",
                borderLeftColor: "success.main",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
              }}
              onClick={() => handleSelectGarden(g.id)}
            >
              <IconButton
                size="small"
                sx={{ position: "absolute", top: 8, right: 8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingDeleteGarden(g);
                }}
                aria-label={`Delete ${g.name}`}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              <CardContent sx={{ textAlign: "center", pt: 4 }}>
                <GridViewIcon sx={{ fontSize: 32, color: "success.main", mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {g.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {g.rows} x {g.cols} grid
                </Typography>
              </CardContent>
            </Card>
          ))}
          <Card
            sx={{
              height: 160,
              cursor: "pointer",
              border: "2px dashed",
              borderColor: "divider",
              bgcolor: "transparent",
              transition: "border-color 0.2s, transform 0.2s",
              "&:hover": { borderColor: "success.main", transform: "translateY(-4px)" },
            }}
            onClick={() => setShowCreateDialog(true)}
          >
            <CardContent sx={{ textAlign: "center", pt: 4 }}>
              <AddCircleOutlineIcon sx={{ fontSize: 36, color: "success.main", mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                New Garden
              </Typography>
            </CardContent>
          </Card>
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

        {/* Delete garden confirmation dialog */}
        <Dialog open={!!pendingDeleteGarden} onClose={() => setPendingDeleteGarden(null)}>
          <DialogTitle>Delete Garden</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{pendingDeleteGarden?.name}"? This cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPendingDeleteGarden(null)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteGarden}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Notification message={successMsg} open={!!successMsg} onClose={() => setSuccessMsg("")} />
      </Box>
    );
  }

  // Garden selected: sidebar + grid layout
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
        <Drawer open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <Box sx={{ width: 280 }}>{sidebarContent}</Box>
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
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 2,
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <GardenGrid
              garden={selectedGarden}
              cells={selectedGarden.cells}
              companions={companions}
              antagonists={antagonists}
              onCellClick={handleCellClick}
              onCellRightClick={handleCellRightClick}
            />
          </Box>
          {selectedPlant && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
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

      <Notification message={successMsg} open={!!successMsg} onClose={() => setSuccessMsg("")} />
    </Box>
  );
}

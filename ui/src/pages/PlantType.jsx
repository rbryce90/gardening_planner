import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { getMe } from "../services/authService";
import {
  Container,
  Typography,
  Alert,
  Skeleton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
  Button,
} from "@mui/material";
import PlantList from "../components/PlantList";
import PlantGraph from "../components/PlantGraph";

export default function PlantType() {
  const { plantName } = useParams();
  const [plantData, setPlantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // All plants for autocomplete
  const [allPlants, setAllPlants] = useState([]);

  // Companion dialog state
  const [companionDialogOpen, setCompanionDialogOpen] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState(null);

  // Antagonist dialog state
  const [antagonistDialogOpen, setAntagonistDialogOpen] = useState(false);
  const [selectedAntagonist, setSelectedAntagonist] = useState(null);

  // Plant type form state
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [typeForm, setTypeForm] = useState({ name: "", description: "", planting_notes: "" });

  useEffect(() => {
    getMe()
      .then((res) => setIsAdmin(res.data.isAdmin))
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    fetchPlantData();
  }, [plantName]);

  const fetchPlantData = () => {
    setLoading(true);
    api
      .get(`/api/plants/${plantName}/types`)
      .then((res) => {
        setPlantData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch plant data");
        setLoading(false);
      });
  };

  const fetchAllPlants = () => {
    api.get("/api/plants").then((res) => setAllPlants(res.data));
  };

  // Companion
  const handleAddCompanion = () => {
    fetchAllPlants();
    setSelectedCompanion(null);
    setCompanionDialogOpen(true);
  };

  const submitCompanion = () => {
    if (!selectedCompanion) return;
    api
      .post(`/api/plants/${plantData.id}/companion/${selectedCompanion.id}`)
      .then(() => {
        setCompanionDialogOpen(false);
        fetchPlantData();
      })
      .catch(() => setError("Failed to add companion"));
  };

  // Antagonist
  const handleAddAntagonist = () => {
    fetchAllPlants();
    setSelectedAntagonist(null);
    setAntagonistDialogOpen(true);
  };

  const submitAntagonist = () => {
    if (!selectedAntagonist) return;
    api
      .post(`/api/plants/${plantData.id}/antagonist/${selectedAntagonist.id}`)
      .then(() => {
        setAntagonistDialogOpen(false);
        fetchPlantData();
      })
      .catch(() => setError("Failed to add antagonist"));
  };

  // Plant type
  const handleAddType = () => {
    setTypeForm({ name: "", description: "", planting_notes: "" });
    setTypeDialogOpen(true);
  };

  const submitType = () => {
    if (!typeForm.name.trim()) return;
    api
      .post(`/api/plants/${plantData.id}/types`, typeForm)
      .then(() => {
        setTypeDialogOpen(false);
        fetchPlantData();
      })
      .catch(() => setError("Failed to add plant type"));
  };

  // Filter helpers
  const companionOptions = allPlants.filter(
    (p) => p.id !== plantData?.id && !plantData?.companions?.some((c) => c.id === p.id),
  );

  const antagonistOptions = allPlants.filter(
    (p) => p.id !== plantData?.id && !plantData?.antagonists?.some((a) => a.id === p.id),
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Skeleton variant="text" width={300} height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={200} height={24} sx={{ mb: 4 }} />
        <Skeleton variant="text" width={180} height={32} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Plant General Information */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        {plantData.name} ({plantData.category})
      </Typography>
      <Typography variant="body1" gutterBottom>
        <b>Growth Form:</b> {plantData.growthForm}
      </Typography>

      {/* Relationship Graph */}
      {plantData.id && <PlantGraph plantId={plantData.id} />}

      {/* Companion Plants */}
      <PlantList
        title="Companion Plants"
        plants={plantData.companions}
        fallbackMessage="No companion plants available."
        onAddPlant={isAdmin ? handleAddCompanion : null}
        renderFields={(companion) => (
          <>
            <Typography variant="body2" gutterBottom>
              <b>Category:</b> {companion.category}
            </Typography>
            <Typography variant="body2">
              <b>Growth Form:</b> {companion.growthForm}
            </Typography>
          </>
        )}
      />

      {/* Antagonist Plants */}
      <PlantList
        title="Antagonist Plants"
        plants={plantData.antagonists}
        fallbackMessage="No antagonist plants available."
        onAddPlant={isAdmin ? handleAddAntagonist : null}
        renderFields={(antagonist) => (
          <>
            <Typography variant="body2" gutterBottom>
              <b>Category:</b> {antagonist.category}
            </Typography>
            <Typography variant="body2">
              <b>Growth Form:</b> {antagonist.growthForm}
            </Typography>
          </>
        )}
      />

      {/* Plant Types */}
      <PlantList
        title="Plant Types"
        plants={plantData.types}
        fallbackMessage="No plant types available."
        onAddPlant={isAdmin ? handleAddType : null}
        renderFields={(type) => (
          <>
            <Typography variant="body2" gutterBottom>
              <b>Description:</b> {type.description}
            </Typography>
            <Typography variant="body2">
              <b>Planting Notes:</b> {type.plantingNotes}
            </Typography>
          </>
        )}
      />

      {/* Add Companion Dialog */}
      <Dialog
        open={companionDialogOpen}
        onClose={() => setCompanionDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Companion Plant</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={companionOptions}
            getOptionLabel={(option) => option.name}
            value={selectedCompanion}
            onChange={(_, value) => setSelectedCompanion(value)}
            renderInput={(params) => (
              <TextField {...params} label="Select a plant" margin="normal" fullWidth />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompanionDialogOpen(false)}>Cancel</Button>
          <Button onClick={submitCompanion} variant="contained" disabled={!selectedCompanion}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Antagonist Dialog */}
      <Dialog
        open={antagonistDialogOpen}
        onClose={() => setAntagonistDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Antagonist Plant</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={antagonistOptions}
            getOptionLabel={(option) => option.name}
            value={selectedAntagonist}
            onChange={(_, value) => setSelectedAntagonist(value)}
            renderInput={(params) => (
              <TextField {...params} label="Select a plant" margin="normal" fullWidth />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAntagonistDialogOpen(false)}>Cancel</Button>
          <Button onClick={submitAntagonist} variant="contained" disabled={!selectedAntagonist}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Plant Type Dialog */}
      <Dialog
        open={typeDialogOpen}
        onClose={() => setTypeDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Plant Type</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={typeForm.name}
            onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
            margin="normal"
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={typeForm.description}
            onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
            margin="normal"
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="Planting Notes"
            value={typeForm.planting_notes}
            onChange={(e) => setTypeForm({ ...typeForm, planting_notes: e.target.value })}
            margin="normal"
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTypeDialogOpen(false)}>Cancel</Button>
          <Button onClick={submitType} variant="contained" disabled={!typeForm.name.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

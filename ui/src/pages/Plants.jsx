import React, { useEffect, useState } from "react";
import api from "../services/api";
import { getMe } from "../services/authService";
import { Box, Typography, Alert, Button, Grid, Skeleton } from "@mui/material";
import PlantGrid from "../components/PlantGrid";
import AddPlantCard from "../components/AddPlantCard";
import Notification from "../components/Notification";

export default function Plants() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingPlant, setAddingPlant] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getPlants();
    getMe()
      .then((res) => setIsAdmin(res.data.isAdmin || false))
      .catch(() => {});
  }, []);

  const getPlants = () => {
    setLoading(true);
    api
      .get("/api/plants")
      .then((res) => {
        setPlants(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch plants");
        setLoading(false);
      });
  };

  const handleDeletePlant = (plantId) => {
    api
      .delete(`/api/plants/${plantId}`)
      .then(() => {
        setPlants((prevPlants) => prevPlants.filter((plant) => plant.id !== plantId));
        setSuccessMsg("Plant deleted");
      })
      .catch((err) => {
        setError(`Failed to delete plant: ${err.response?.data?.message || err.message}`);
      });
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="text" width={200} height={48} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width={120} height={36} sx={{ mb: 3, borderRadius: 1 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Plants
      </Typography>
      {isAdmin && (
        <Button
          variant="outlined"
          color="primary"
          sx={{ mb: 3 }}
          onClick={() => setAddingPlant(true)}
        >
          Add Plant
        </Button>
      )}
      {addingPlant && <AddPlantCard onClose={() => setAddingPlant(false)} getPlants={getPlants} />}
      <PlantGrid
        plants={plants}
        getPlants={getPlants}
        onDeletePlant={isAdmin ? handleDeletePlant : null}
        setPlants={setPlants}
        isAdmin={isAdmin}
      />
      <Notification message={successMsg} open={!!successMsg} onClose={() => setSuccessMsg("")} />
    </Box>
  );
}

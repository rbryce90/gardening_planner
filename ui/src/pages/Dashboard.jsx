import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { getMe } from "../services/authService";
import { getZones, updateUserZone } from "../services/zoneService";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then((res) => {
        setUser(res.data);
        setSelectedZone(res.data.zoneId || "");
        return getZones();
      })
      .then((res) => {
        setZones(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Failed to load user");
          setLoading(false);
        }
      });
  }, [navigate]);

  const handleZoneChange = async (event) => {
    const newZoneId = event.target.value;
    setSelectedZone(newZoneId);
    try {
      await updateUserZone(newZoneId);
    } catch (err) {
      setError("Failed to save zone preference");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.firstName}!
      </Typography>
      <Typography variant="body1">{user.email}</Typography>
      <FormControl fullWidth sx={{ mt: 3 }}>
        <InputLabel id="zone-select-label">USDA Hardiness Zone</InputLabel>
        <Select
          labelId="zone-select-label"
          value={selectedZone}
          label="USDA Hardiness Zone"
          onChange={handleZoneChange}
        >
          {zones.map((zone) => (
            <MenuItem key={zone.id} value={zone.id}>
              {zone.name} ({zone.minTemperature}°F to {zone.maxTemperature}°F)
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Container>
  );
}

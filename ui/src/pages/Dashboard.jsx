import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Paper,
  TextField,
  Button,
} from "@mui/material";
import { getMe, updateProfile } from "../services/authService";
import { getZones, updateUserZone } from "../services/zoneService";
import Notification from "../components/Notification";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [profileForm, setProfileForm] = useState({ email: "", firstName: "", lastName: "" });
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then((res) => {
        setUser(res.data);
        setSelectedZone(res.data.zoneId || "");
        setProfileForm({
          email: res.data.email,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
        });
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
          setError(
            `Failed to load user: ${err.response?.data?.message || err.message} (${err.response?.status || "network error"})`,
          );
          setLoading(false);
        }
      });
  }, [navigate]);

  const handleZoneChange = async (event) => {
    const newZoneId = event.target.value;
    setSelectedZone(newZoneId);
    try {
      await updateUserZone(newZoneId);
      setSuccessMsg("Zone updated");
    } catch (err) {
      setError(`Failed to save zone: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleProfileChange = (field) => (e) => {
    setProfileForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleProfileSave = async () => {
    try {
      const res = await updateProfile(
        profileForm.email,
        profileForm.firstName,
        profileForm.lastName,
      );
      setUser(res.data);
      setSuccessMsg("Profile updated");
    } catch (err) {
      if (err.response?.status === 409) {
        setError("That email is already in use");
      } else {
        setError(`Failed to update profile: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Skeleton variant="text" width={300} height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={200} height={24} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Profile
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="First Name"
            value={profileForm.firstName}
            onChange={handleProfileChange("firstName")}
            fullWidth
          />
          <TextField
            label="Last Name"
            value={profileForm.lastName}
            onChange={handleProfileChange("lastName")}
            fullWidth
          />
          <TextField
            label="Email"
            value={profileForm.email}
            onChange={handleProfileChange("email")}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleProfileSave}
            sx={{ alignSelf: "flex-start" }}
          >
            Save Profile
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Growing Zone
        </Typography>
        <FormControl fullWidth>
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
      </Paper>
      <Notification message={successMsg} open={!!successMsg} onClose={() => setSuccessMsg("")} />
    </Container>
  );
}

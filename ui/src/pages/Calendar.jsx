import React, { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { getMe } from "../services/authService";
import { getPlantingCalendar } from "../services/zoneService";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getActiveEntries(calendarData, monthIndex) {
  return calendarData.filter((entry) => {
    const start = MONTHS.indexOf(entry.startMonth);
    const end = MONTHS.indexOf(entry.endMonth);
    return monthIndex >= start && monthIndex <= end;
  });
}

export default function Calendar() {
  const [user, setUser] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then((res) => {
        const userData = res.data;
        setUser(userData);
        if (!userData.zoneId) {
          setLoading(false);
          return;
        }
        return getPlantingCalendar(userData.zoneId).then((calRes) => {
          setCalendarData(calRes.data);
          setLoading(false);
        });
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Failed to load calendar");
          setLoading(false);
        }
      });
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!user?.zoneId) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Planting Calendar
        </Typography>
        <Alert severity="info">
          Select your hardiness zone on the{" "}
          <RouterLink to="/dashboard" style={{ color: "inherit" }}>
            Dashboard
          </RouterLink>{" "}
          to view your planting calendar.
        </Alert>
      </Container>
    );
  }

  const activeEntries = getActiveEntries(calendarData, activeMonth);

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Planting Calendar
      </Typography>
      <Tabs
        value={activeMonth}
        onChange={(_, newValue) => setActiveMonth(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        {MONTHS.map((month, index) => (
          <Tab key={month} label={month} value={index} />
        ))}
      </Tabs>
      {activeEntries.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No plants to start in {MONTHS[activeMonth]}.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Plant</TableCell>
                <TableCell>Variety</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.plantName}</TableCell>
                  <TableCell>{entry.plantTypeName}</TableCell>
                  <TableCell>{entry.method}</TableCell>
                  <TableCell>{entry.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

import "./index.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Header from "./components/Header";
import ErrorBoundary from "./components/ErrorBoundary";
import Plants from "./pages/Plants";
import PlantType from "./pages/PlantType";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Garden from "./pages/Garden";
import Calendar from "./pages/Calendar";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#2E7D32" },
    secondary: { main: "#8D6E63" },
    error: { main: "#D32F2F" },
    success: { main: "#43A047" },
    warning: { main: "#F9A825" },
    background: {
      default: "#1A1A1A",
      paper: "#252220",
    },
    text: {
      primary: "#E8E0D8",
      secondary: "#A89F95",
    },
    divider: "rgba(255,255,255,0.08)",
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(255,255,255,0.06)",
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Header />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/plants" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/garden" element={<Garden />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/plants/:plantName/types" element={<PlantType />} />
            <Route path="/plants" element={<Plants />} />
          </Routes>
        </ErrorBoundary>
      </ThemeProvider>
    </>
  );
}

export default App;

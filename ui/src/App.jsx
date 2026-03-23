import react from 'react'
import './index.css'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header'
import Plants from './pages/Plants';
import PlantType from './pages/PlantType';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Garden from './pages/Garden';
import Calendar from './pages/Calendar';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/garden" element={<Garden />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/plants/:plantName/types" element={<PlantType />} />
          <Route path="/plants" element={<Plants />} />
        </Routes>
      </ThemeProvider>
    </>
  )
}

export default App

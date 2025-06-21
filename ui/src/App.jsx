import react from 'react'
import './index.css'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header'
import Plants from './pages/Plants';
import PlantType from './pages/PlantType';

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
        {/* You can define your theme here */}
        <Header />
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/plants/:plantName/types" element={<PlantType />} />
          <Route path="/plants" element={<Plants />} />
        </Routes>
      </ThemeProvider>
    </>
  )
}

export default App

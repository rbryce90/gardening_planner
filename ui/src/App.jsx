import react from 'react'
import './index.css'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header'
import Plants from './pages/Plants';

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
          <Route path="/plants" element={<Plants />} />
          {/* <Route path="/contact" element={<Contact />} /> */}
        </Routes>
      </ThemeProvider>
    </>
  )
}

export default App

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const Header = () => {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" sx={{ backgroundColor: '#121212' }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" component="div">
                        My Garden App
                    </Typography>

                    <Box>
                        <Button color="inherit" component={RouterLink} to="/">
                            Home
                        </Button>
                        <Button color="inherit" component={RouterLink} to="/plants">
                            Plants
                        </Button>
                        <Button color="inherit" component={RouterLink} to="/zones">
                            Zones
                        </Button>
                        <Button color="inherit" component={RouterLink} to="/about">
                            About
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default Header;

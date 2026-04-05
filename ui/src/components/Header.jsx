import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import YardIcon from "@mui/icons-material/Yard";
import GridOnIcon from "@mui/icons-material/GridOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SettingsIcon from "@mui/icons-material/Settings";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import LogoutIcon from "@mui/icons-material/Logout";
import { getMe, logout } from "../services/authService";

let cachedUser = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000;

const Header = () => {
  const [user, setUser] = useState(cachedUser);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (cachedUser && Date.now() - cacheTimestamp < CACHE_TTL) {
      setUser(cachedUser);
      return;
    }
    getMe()
      .then((res) => {
        cachedUser = res.data;
        cacheTimestamp = Date.now();
        setUser(res.data);
      })
      .catch(() => {
        cachedUser = null;
        cacheTimestamp = 0;
        setUser(null);
      });
  }, [location]);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const handleLogout = async () => {
    await logout();
    cachedUser = null;
    cacheTimestamp = 0;
    setUser(null);
    window.location.href = "/login";
  };

  const authNavItems = [
    { label: "Plants", path: "/plants", icon: <YardIcon /> },
    { label: "My Gardens", path: "/garden", icon: <GridOnIcon /> },
    { label: "Planting Calendar", path: "/calendar", icon: <CalendarMonthIcon /> },
    { label: "Settings", path: "/dashboard", icon: <SettingsIcon /> },
  ];

  const unauthNavItems = [
    { label: "Log In", path: "/login", icon: <LoginIcon /> },
    { label: "Register", path: "/register", icon: <PersonAddIcon /> },
  ];

  const navItems = user ? authNavItems : unauthNavItems;

  const navButton = (item) => (
    <Button
      key={item.path}
      color="inherit"
      component={RouterLink}
      to={item.path}
      startIcon={item.icon}
      sx={{
        borderBottom: isActive(item.path) ? "2px solid" : "2px solid transparent",
        borderColor: isActive(item.path) ? "primary.main" : "transparent",
        borderRadius: 0,
        px: 2,
        py: 1,
        transition: "border-color 0.2s",
      }}
    >
      {item.label}
    </Button>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: "background.paper" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box
            component={RouterLink}
            to="/"
            aria-label="Garden Planner home"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <LocalFloristIcon sx={{ color: "primary.main" }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Garden Planner
            </Typography>
          </Box>

          {isMobile ? (
            <>
              {user && (
                <Typography variant="body2" sx={{ mr: 1, color: "text.secondary" }}>
                  {user.firstName}
                </Typography>
              )}
              <IconButton
                color="inherit"
                aria-label="Open navigation menu"
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                aria-label="Navigation menu"
              >
                <Box sx={{ width: 260, pt: 2 }}>
                  <List>
                    {navItems.map((item) => (
                      <ListItemButton
                        key={item.path}
                        component={RouterLink}
                        to={item.path}
                        selected={isActive(item.path)}
                        onClick={() => setDrawerOpen(false)}
                      >
                        <ListItemIcon
                          sx={{ color: isActive(item.path) ? "primary.main" : "text.secondary" }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    ))}
                    {user && (
                      <ListItemButton
                        onClick={() => {
                          setDrawerOpen(false);
                          handleLogout();
                        }}
                      >
                        <ListItemIcon sx={{ color: "text.secondary" }}>
                          <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Log Out" />
                      </ListItemButton>
                    )}
                  </List>
                </Box>
              </Drawer>
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {user && (
                <Typography variant="body2" sx={{ mr: 2, color: "text.secondary" }}>
                  {user.firstName} {user.lastName}
                </Typography>
              )}
              {navItems.map(navButton)}
              {user && (
                <Button
                  color="inherit"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{ borderRadius: 0, px: 2, py: 1 }}
                >
                  Log Out
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;

// components/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Quiz as QuizIcon,
  Leaderboard as LeaderboardIcon,
  Dashboard as DashboardIcon,
  Create as CreateIcon,
  Analytics as AnalyticsIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Logout as LogoutIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  AccountCircle
} from '@mui/icons-material';

const Header = ({ user, onLogout, mode, toggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    onLogout();
    handleMenuClose();
    navigate('/login');
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Navigation items
  const navItems = [
    {
      text: 'Quizzes',
      path: '/quizzes',
      icon: <QuizIcon />,
      public: true
    },
    {
      text: 'Leaderboard',
      path: '/leaderboard',
      icon: <LeaderboardIcon />,
      public: true
    },
    {
      text: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
      public: false
    },
    {
      text: 'Create Quiz',
      path: '/create-quiz',
      icon: <CreateIcon />,
      public: false
    },
    {
      text: 'Analytics',
      path: '/analytics',
      icon: <AnalyticsIcon />,
      public: false
    },
  ];
  
  // Drawer content
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <List>
        <ListItem>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', my: 1 }}>
            Quiz Master
          </Typography>
        </ListItem>
        <Divider />
        {navItems
          .filter(item => item.public || user)
          .map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              selected={isActive(item.path)}
              sx={{
                bgcolor: isActive(item.path) ? 'action.selected' : 'transparent',
                borderRadius: 1,
                my: 0.5,
                mx: 1
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        <Divider />
        {!user ? (
          <>
            <ListItem 
              button 
              component={Link} 
              to="/login"
              selected={isActive('/login')}
              sx={{
                bgcolor: isActive('/login') ? 'action.selected' : 'transparent',
                borderRadius: 1,
                my: 0.5,
                mx: 1
              }}
            >
              <ListItemIcon><LoginIcon /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem 
              button 
              component={Link} 
              to="/register"
              selected={isActive('/register')}
              sx={{
                bgcolor: isActive('/register') ? 'action.selected' : 'transparent',
                borderRadius: 1,
                my: 0.5,
                mx: 1
              }}
            >
              <ListItemIcon><RegisterIcon /></ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        ) : (
          <ListItem button onClick={handleLogout} sx={{ borderRadius: 1, my: 0.5, mx: 1 }}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
        <ListItem button onClick={toggleTheme} sx={{ borderRadius: 1, my: 0.5, mx: 1 }}>
          <ListItemIcon>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </ListItemIcon>
          <ListItemText primary={mode === 'light' ? 'Dark Mode' : 'Light Mode'} />
        </ListItem>
      </List>
    </Box>
  );
  
  return (
    <>
      <AppBar position="sticky" elevation={1} color="default">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <QuizIcon sx={{ mr: 1 }} />
            Quiz Master
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex' }}>
              {navItems
                .filter(item => item.public || user)
                .map((item) => (
                  <Button
                    key={item.text}
                    component={Link}
                    to={item.path}
                    color="inherit"
                    sx={{ 
                      mx: 0.5,
                      bgcolor: isActive(item.path) ? 'action.selected' : 'transparent',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                    startIcon={item.icon}
                  >
                    {item.text}
                  </Button>
                ))}
            </Box>
          )}
          
          <Tooltip title={mode === 'light' ? 'Dark Mode' : 'Light Mode'}>
            <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
          
          {!user ? (
            !isMobile && (
              <Box sx={{ display: 'flex' }}>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  startIcon={<LoginIcon />}
                  sx={{ ml: 1 }}
                >
                  Login
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  component={Link}
                  to="/register"
                  startIcon={<RegisterIcon />}
                  sx={{ ml: 1 }}
                >
                  Register
                </Button>
              </Box>
            )
          ) : (
            <Box>
              <Tooltip title="Account">
                <IconButton
                  onClick={handleProfileMenuOpen}
                  size="large"
                  edge="end"
                  color="inherit"
                  aria-label="account of current user"
                  aria-haspopup="true"
                >
                  {user.avatar ? (
                    <Avatar 
                      alt={user.name} 
                      src={user.avatar} 
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2">
                    Signed in as <strong>{user.name}</strong>
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem component={Link} to="/dashboard" onClick={handleMenuClose}>
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" />
                  </ListItemIcon>
                  Dashboard
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
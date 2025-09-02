// src/components/HomeNavbar.jsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  useScrollTrigger,
  Container
} from '@mui/material';
import { Menu, Close } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'Find Jobs', path: '/#jobs' },
    { label: 'How It Works', path: '/#how-it-works' },
    { label: 'For Employers', path: '/#employers' },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 250 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton>
          <Close />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} component="a" href={item.path} sx={{ textAlign: 'center' }}>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <ListItem sx={{ flexDirection: 'column', gap: 1, alignItems: 'stretch' }}>
          <Button
            variant="outlined"
            component={Link}
            to="/register"
            sx={{
              borderColor: '#1D503A',
              color: '#1D503A',
              '&:hover': { borderColor: '#16412e' }
            }}
          >
            Find Jobs
          </Button>
          <Button
            variant="contained"
            component={Link}
            to="/register/employer"
            sx={{
              backgroundColor: '#1D503A',
              '&:hover': { backgroundColor: '#16412e' }
            }}
          >
            Post Jobs
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  if (isAuthenticated) {
    return null; // Don't show navbar if user is logged in
  }

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: trigger ? 'rgba(250, 245, 238, 0.95)' : 'transparent',
          backdropFilter: trigger ? 'blur(10px)' : 'none',
          boxShadow: trigger ? 1 : 'none',
          transition: 'all 0.3s ease',
        }}
        elevation={0}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            {/* Logo */}
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: '#1D503A',
                fontWeight: 'bold',
                fontSize: '1.5rem'
              }}
            >
              JobWiseAI
            </Typography>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  href={item.path}
                  sx={{
                    color: '#1D503A',
                    fontWeight: 500,
                    '&:hover': { color: '#16412e' }
                  }}
                >
                  {item.label}
                </Button>
              ))}
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/register"
                  sx={{
                    borderColor: '#1D503A',
                    color: '#1D503A',
                    '&:hover': {
                      borderColor: '#16412e',
                      backgroundColor: 'rgba(29, 80, 58, 0.04)'
                    }
                  }}
                >
                  Find Jobs
                </Button>
                <Button
                  variant="contained"
                  component={Link}
                  to="/register/employer"
                  sx={{
                    backgroundColor: '#1D503A',
                    '&:hover': { backgroundColor: '#16412e' }
                  }}
                >
                  Post Jobs
                </Button>
              </Box>
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' }, color: '#1D503A' }}
            >
              <Menu />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Spacer for fixed navbar */}
      <Toolbar />
    </>
  );
};

export default HomeNavbar;
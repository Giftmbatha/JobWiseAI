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
  Container,
  alpha,
  Fade,
  Slide,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import { 
  Menu, 
  Close, 
  Work, 
  Business, 
  AutoAwesome,
  RocketLaunch,
  Groups,
  Psychology,
  ArrowForward
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'Find Jobs', path: '/#jobs', icon: <Work /> },
    { label: 'How It Works', path: '/#how-it-works', icon: <Psychology /> },
    { label: 'For Employers', path: '/#employers', icon: <Business /> },
  ];

  const handleNavClick = (path) => {
    if (path.startsWith('/#')) {
      // Handle anchor links
      const anchor = path.substring(2);
      if (location.pathname === '/') {
        // On home page, scroll to section
        const element = document.getElementById(anchor);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // On other pages, navigate to home then scroll
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(anchor);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } else {
      navigate(path);
    }
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ 
      width: 280, 
      height: '100%',
      background: 'linear-gradient(135deg, #FAF5EE 0%, #ffffff 100%)'
    }}>
      {/* Drawer Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid rgba(29, 80, 58, 0.1)',
        background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 32, 
              height: 32 
            }}>
              <AutoAwesome sx={{ fontSize: 18 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              JobWiseAI
            </Typography>
          </Box>
          <IconButton 
            onClick={handleDrawerToggle} 
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </Box>
        <Chip 
          label="AI-Powered Job Platform" 
          size="small" 
          sx={{ 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            color: 'white',
            fontWeight: 600
          }} 
        />
      </Box>

      {/* Navigation Items */}
      <List sx={{ p: 2 }}>
        {navItems.map((item, index) => (
          <ListItem 
            key={item.label} 
            onClick={() => handleNavClick(item.path)}
            sx={{ 
              borderRadius: 2,
              mb: 0.5,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(29, 80, 58, 0.08)',
                transform: 'translateX(4px)'
              }
            }}
          >
            <Box sx={{ color: '#1D503A', mr: 2 }}>
              {item.icon}
            </Box>
            <ListItemText 
              primary={item.label} 
              primaryTypographyProps={{ 
                fontWeight: 600,
                color: '#1D503A'
              }} 
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Action Buttons */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Work />}
          onClick={() => handleNavClick('/register')}
          sx={{
            mb: 2,
            borderColor: '#1D503A',
            color: '#1D503A',
            fontWeight: 600,
            borderRadius: 2,
            py: 1.5,
            '&:hover': {
              borderColor: '#16412e',
              backgroundColor: 'rgba(29, 80, 58, 0.04)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Find Jobs
        </Button>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Business />}
          endIcon={<RocketLaunch />}
          onClick={() => handleNavClick('/register/employer')}
          sx={{
            background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
            fontWeight: 700,
            borderRadius: 2,
            py: 1.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(29, 80, 58, 0.4)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Post Jobs
        </Button>
      </Box>
    </Box>
  );

  if (isAuthenticated) {
    return null; // Don't show navbar if user is logged in
  }

  return (
    <>
      <Slide direction="down" in={!trigger} timeout={500}>
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: trigger ? 'rgba(250, 245, 238, 0.98)' : 'transparent',
            backdropFilter: trigger ? 'blur(20px)' : 'none',
            boxShadow: trigger ? '0 4px 20px rgba(29, 80, 58, 0.1)' : 'none',
            transition: 'all 0.4s ease',
            borderBottom: trigger ? '1px solid rgba(29, 80, 58, 0.1)' : 'none',
          }}
          elevation={0}
        >
          <Container maxWidth="lg">
            <Toolbar sx={{ 
              justifyContent: 'space-between', 
              py: 1,
              minHeight: { xs: 70, md: 80 }
            }}>
              {/* Logo */}
              <Box 
                component={Link}
                to="/"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Avatar sx={{ 
                  bgcolor: '#1D503A', 
                  width: { xs: 40, md: 44 }, 
                  height: { xs: 40, md: 44 },
                  boxShadow: '0 4px 12px rgba(29, 80, 58, 0.3)'
                }}>
                  <AutoAwesome />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      background: trigger ? 
                        'linear-gradient(45deg, #1D503A, #2a6b4f)' :
                        'linear-gradient(45deg, #ffffff, #f8f9fa)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      fontSize: { xs: '1.3rem', md: '1.5rem' }
                    }}
                  >
                    JobWiseAI
                  </Typography>
                  {!trigger && (
                    <Chip 
                      label="AI-Powered" 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.6rem',
                        height: 20
                      }} 
                    />
                  )}
                </Box>
              </Box>

              {/* Desktop Navigation */}
              <Box sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                alignItems: 'center', 
                gap: 4 
              }}>
                {navItems.map((item, index) => (
                  <Fade in={true} timeout={800 + index * 100} key={item.label}>
                    <Button
                      startIcon={item.icon}
                      onClick={() => handleNavClick(item.path)}
                      sx={{
                        color: trigger ? '#1D503A' : 'white',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        '&:hover': {
                          color: trigger ? '#16412e' : 'rgba(255,255,255,0.8)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {item.label}
                    </Button>
                  </Fade>
                ))}
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 2 }}>
                  <Fade in={true} timeout={1200}>
                    <Button
                      variant="outlined"
                      startIcon={<Work />}
                      onClick={() => handleNavClick('/register')}
                      sx={{
                        borderColor: trigger ? '#1D503A' : 'rgba(255,255,255,0.5)',
                        color: trigger ? '#1D503A' : 'white',
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 3,
                        '&:hover': {
                          borderColor: trigger ? '#16412e' : 'white',
                          backgroundColor: trigger ? 'rgba(29, 80, 58, 0.04)' : 'rgba(255,255,255,0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Find Jobs
                    </Button>
                  </Fade>
                  <Fade in={true} timeout={1400}>
                    <Button
                      variant="contained"
                      startIcon={<Business />}
                      endIcon={<ArrowForward />}
                      onClick={() => handleNavClick('/register/employer')}
                      sx={{
                        background: trigger ? 
                          'linear-gradient(135deg, #1D503A, #2a6b4f)' : 
                          'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                        color: trigger ? 'white' : 'white',
                        fontWeight: 700,
                        borderRadius: 2,
                        px: 3,
                        backdropFilter: trigger ? 'none' : 'blur(10px)',
                        border: trigger ? 'none' : '1px solid rgba(255,255,255,0.2)',
                        '&:hover': {
                          background: trigger ? 
                            'linear-gradient(135deg, #16412e, #1D503A)' : 
                            'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.2))',
                          transform: 'translateY(-2px)',
                          boxShadow: trigger ? 
                            '0 8px 25px rgba(29, 80, 58, 0.4)' : 
                            '0 8px 25px rgba(255,255,255,0.2)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Post Jobs
                    </Button>
                  </Fade>
                </Box>
              </Box>

              {/* Mobile Menu Button */}
              <IconButton
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  display: { md: 'none' }, 
                  color: trigger ? '#1D503A' : 'white',
                  backgroundColor: trigger ? 'rgba(29, 80, 58, 0.1)' : 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: trigger ? 'rgba(29, 80, 58, 0.2)' : 'rgba(255,255,255,0.2)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Menu />
              </IconButton>
            </Toolbar>
          </Container>
        </AppBar>
      </Slide>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ 
          keepMounted: true,
          sx: {
            '& .MuiBackdrop-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)'
            }
          }
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Spacer for fixed navbar */}
      <Toolbar sx={{ minHeight: { xs: 70, md: 80 } + '!important' }} />
    </>
  );
};

export default HomeNavbar;
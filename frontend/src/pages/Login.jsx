// src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  Grid,
  Tabs,
  Tab,
  alpha,
  Fade,
  Slide,
  Avatar,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Google, 
  Visibility, 
  VisibilityOff,
  Work,
  Business,
  AutoAwesome,
  RocketLaunch,
  Email,
  Lock,
  Psychology,
  TrendingUp,
  Group,
  Speed
} from '@mui/icons-material';
import { authAPI } from '../api/auth';


const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(credentials);
      await login(response.data.access_token);
      // The AuthContext will handle the redirection automatically
    } catch (error) {
      setError(error.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    authAPI.googleLogin();
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const roleInfo = [
    {
      title: "Job Seeker Login",
      subtitle: "Sign in to find your dream job with AI-powered matching",
      icon: <Work />,
      features: [
        "AI-powered job recommendations",
        "Personalized skill analysis",
        "One-click applications",
        "Career growth tracking"
      ],
      featureIcons: [<Psychology />, <TrendingUp />, <RocketLaunch />, <Speed />]
    },
    {
      title: "Employer Login",
      subtitle: "Sign in to manage your job postings and find candidates",
      icon: <Business />,
      features: [
        "AI candidate matching",
        "Advanced analytics",
        "Candidate management",
        "Quick hiring process"
      ],
      featureIcons: [<Group />, <TrendingUp />, <Business />, <Speed />]
    }
  ];

  return (
    <Container component="main" maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 3,
          background: 'linear-gradient(135deg, #FAF5EE 0%, #ffffff 100%)',
        }}
      >
        <Slide direction="up" in={true} timeout={800}>
          <Box sx={{ width: '100%', maxWidth: 1200 }}>
            <Grid container spacing={4} alignItems="center">
              {/* Left Side - Image & Branding */}
              <Grid item xs={12} md={6}>
                <Fade in={true} timeout={1000}>
                  <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    {/* Branding */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                      <Avatar sx={{ 
                        bgcolor: '#1D503A', 
                        width: 50, 
                        height: 50,
                        boxShadow: '0 4px 12px rgba(29, 80, 58, 0.3)'
                      }}>
                        <AutoAwesome />
                      </Avatar>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          color: '#1D503A', 
                          fontWeight: 700,
                        }}
                      >
                        JobWiseAI
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: '#1D503A', 
                        fontWeight: 600,
                        mb: 2
                      }}
                    >
                      Welcome Back!
                    </Typography>

                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#666', 
                        mb: 3,
                        fontWeight: 400,
                        lineHeight: 1.6
                      }}
                    >
                      Sign in to continue your journey with AI-powered career growth and smart hiring solutions.
                    </Typography>

                   

                    {/* Role Features */}
                    <Paper 
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        background: 'white',
                        border: '1px solid rgba(29, 80, 58, 0.1)',
                        boxShadow: '0 4px 12px rgba(29, 80, 58, 0.1)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: '#1D503A', 
                          width: 40, 
                          height: 40 
                        }}>
                          {roleInfo[tabValue].icon}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ color: '#1D503A', fontWeight: 600 }}>
                            {roleInfo[tabValue].title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            {roleInfo[tabValue].subtitle}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {roleInfo[tabValue].features.map((feature, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ 
                              color: '#1D503A',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 24,
                              height: 24
                            }}>
                              {roleInfo[tabValue].featureIcons[index]}
                            </Box>
                            <Typography variant="body2" sx={{ color: '#484848', fontWeight: 500 }}>
                              {feature}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  </Box>
                </Fade>
              </Grid>

              {/* Right Side - Login Form */}
              <Grid item xs={12} md={6}>
                <Fade in={true} timeout={1200}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background: 'white',
                      boxShadow: '0 8px 24px rgba(29, 80, 58, 0.15)',
                      border: '1px solid rgba(29, 80, 58, 0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #1D503A 0%, #2a6b4f 100%)'
                      }
                    }}
                  >
                    {/* Role Tabs */}
                    <Paper sx={{ 
                      mb: 3, 
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #FAF5EE 0%, #f5f0e9 100%)'
                    }}>
                      <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        centered
                        sx={{
                          '& .MuiTab-root': { 
                            minHeight: 50,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            '&.Mui-selected': {
                              color: '#1D503A'
                            }
                          },
                          '& .MuiTabs-indicator': {
                            backgroundColor: '#1D503A',
                            height: 3,
                            borderRadius: 2
                          }
                        }}
                      >
                        <Tab 
                          icon={<Work sx={{ fontSize: 18 }} />} 
                          label="Job Seeker" 
                        />
                        <Tab 
                          icon={<Business sx={{ fontSize: 18 }} />} 
                          label="Employer" 
                        />
                      </Tabs>
                    </Paper>

                    {error && (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mb: 2, 
                          borderRadius: 2,
                        }}
                      >
                        {error}
                      </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={credentials.email}
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: '#1D503A' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ 
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            '&:hover fieldset': {
                              borderColor: '#1D503A',
                            },
                          }
                        }}
                      />
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="current-password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: '#1D503A' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                edge="end"
                                sx={{ color: '#1D503A' }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        sx={{ 
                          mb: 1,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            '&:hover fieldset': {
                              borderColor: '#1D503A',
                            },
                          }
                        }}
                      />

                      <Box sx={{ textAlign: 'right', mb: 2 }}>
                        <Link 
                          to="/forgot-password" 
                          style={{ 
                            color: '#1D503A', 
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}
                        >
                          Forgot your password?
                        </Link>
                      </Box>

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <RocketLaunch />}
                        sx={{
                          py: 1,
                          mb: 2,
                          background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(29, 80, 58, 0.4)'
                          },
                          borderRadius: 1,
                          fontWeight: 600,
                          fontSize: '1rem',
                          boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {loading ? 'Signing in...' : 'Launch Your Journey'}
                      </Button>

                      <Divider sx={{ my: 2 }}>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                          OR CONTINUE WITH
                        </Typography>
                      </Divider>

                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Google />}
                        onClick={handleGoogleLogin}
                        sx={{
                          py: 1,
                          borderColor: '#1D503A',
                          color: '#1D503A',
                          '&:hover': {
                            borderColor: '#16412e',
                            backgroundColor: 'rgba(29, 80, 58, 0.04)',
                            transform: 'translateY(-1px)'
                          },
                          borderRadius: 1,
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Sign in with Google
                      </Button>

                      <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          Don't have an account?{' '}
                          {tabValue === 0 ? (
                            <Link 
                              to="/register" 
                              style={{ 
                                color: '#1D503A', 
                                textDecoration: 'none',
                                fontWeight: 'bold'
                              }}
                            >
                              Sign up as Job Seeker
                            </Link>
                          ) : (
                            <Link 
                              to="/register/employer" 
                              style={{ 
                                color: '#1D503A', 
                                textDecoration: 'none',
                                fontWeight: 'bold'
                              }}
                            >
                              Sign up as Employer
                            </Link>
                          )}
                        </Typography>

                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {tabValue === 0 ? (
                            <span>
                              Are you an employer?{' '}
                              <Link 
                                to="/register/employer" 
                                style={{ 
                                  color: '#1D503A', 
                                  textDecoration: 'none',
                                  fontWeight: 'bold'
                                }}
                              >
                                Create employer account
                              </Link>
                            </span>
                          ) : (
                            <span>
                              Looking for a job?{' '}
                              <Link 
                                to="/register" 
                                style={{ 
                                  color: '#1D503A', 
                                  textDecoration: 'none',
                                  fontWeight: 'bold'
                                }}
                              >
                                Create job seeker account
                              </Link>
                            </span>
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>
            </Grid>
          </Box>
        </Slide>
      </Box>
    </Container>
  );
};

export default Login;
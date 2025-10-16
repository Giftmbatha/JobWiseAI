// src/pages/EmployerRegister.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  alpha,
  Fade,
  Slide,
  Avatar,
  CircularProgress,
  InputAdornment,
  IconButton,
  LinearProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  Person,
  Email,
  Lock,
  Business,
  Language,
  Groups,
  CheckCircle,
  AutoAwesome,
  RocketLaunch,
  Work,
  Psychology,
  Analytics,
  Speed,
  TrendingUp
} from '@mui/icons-material';
import { authAPI } from '../api/auth';

const EmployerRegister = () => {
  const [employerData, setEmployerData] = useState({ 
    email: '', 
    password: '', 
    full_name: '',
    confirmPassword: '',
    company_name: '',
    company_size: '',
    company_website: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (employerData.password !== employerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordStrength < 3) {
      setError('Please choose a stronger password');
      setLoading(false);
      return;
    }

    try {
      await authAPI.registerEmployer({
        email: employerData.email,
        password: employerData.password,
        full_name: employerData.full_name,
        company_name: employerData.company_name,
        company_size: employerData.company_size,
        company_website: employerData.company_website
      });
      navigate('/login', { 
        state: { 
          message: 'Employer account created successfully! Please sign in to start hiring.' 
        } 
      });
    } catch (error) {
      setError(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    setEmployerData({ ...employerData, password: e.target.value });
    checkPasswordStrength(e.target.value);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return '#f44336';
      case 1: return '#ff9800';
      case 2: return '#ffeb3b';
      case 3: return '#8bc34a';
      case 4: return '#4caf50';
      default: return '#f44336';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return 'Very Weak';
    }
  };

  const employerBenefits = [
    { text: "AI-powered candidate matching", icon: <Psychology /> },
    { text: "Advanced hiring analytics", icon: <Analytics /> },
    { text: "Smart candidate screening", icon: <Groups /> },
    { text: "Quick job posting", icon: <Speed /> },
    { text: "Employer branding tools", icon: <Business /> },
    { text: "Market insights & trends", icon: <TrendingUp /> }
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
              {/* Left Side - Branding & Benefits */}
              <Grid item xs={12} md={6}>
                <Fade in={true} timeout={1000}>
                  <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, mb: 3, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                      <Avatar sx={{ 
                        bgcolor: '#1D503A', 
                        width: 50, 
                        height: 50,
                        boxShadow: '0 4px 12px rgba(29, 80, 58, 0.3)'
                      }}>
                        <Business />
                      </Avatar>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700,
                          color: '#1D503A'
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
                      Hire Smarter, Not Harder
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
                      Join forward-thinking companies that use AI to find the perfect candidates faster and build exceptional teams.
                    </Typography>

                    {/* Employer Benefits */}
                    <Paper 
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        background: 'white',
                        border: '1px solid rgba(29, 80, 58, 0.1)',
                        boxShadow: '0 4px 12px rgba(29, 80, 58, 0.1)'
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#1D503A', mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RocketLaunch /> Why Employers Love Us
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {employerBenefits.map((benefit, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                              <Box sx={{ color: '#1D503A', display: 'flex' }}>
                                {benefit.icon}
                              </Box>
                              <Typography variant="body2" sx={{ color: '#484848', fontWeight: 500 }}>
                                {benefit.text}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Box>
                </Fade>
              </Grid>

              {/* Right Side - Registration Form */}
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
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: '#1D503A', 
                        width: 48, 
                        height: 48,
                        mx: 'auto',
                        mb: 2
                      }}>
                        <Business />
                      </Avatar>
                      <Typography variant="h5" sx={{ 
                        color: '#1D503A', 
                        fontWeight: 600,
                        mb: 1
                      }}>
                        Employer Registration
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Start building your dream team today
                      </Typography>
                    </Box>

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
                      <Grid container spacing={2}>
                        {/* Company Information */}
                        <Grid item xs={12}>
                          <Typography variant="h6" sx={{ color: '#1D503A', mb: 2, fontWeight: 600 }}>
                            Company Information
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            required
                            fullWidth
                            label="Company Name"
                            value={employerData.company_name}
                            onChange={(e) => setEmployerData({ ...employerData, company_name: e.target.value })}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Business sx={{ color: '#1D503A' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                                '&:hover fieldset': {
                                  borderColor: '#1D503A',
                                },
                              }
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Company Size</InputLabel>
                            <Select
                              value={employerData.company_size}
                              label="Company Size"
                              onChange={(e) => setEmployerData({ ...employerData, company_size: e.target.value })}
                              sx={{ borderRadius: 1 }}
                            >
                              {companySizes.map((size) => (
                                <MenuItem key={size} value={size}>
                                  {size}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Company Website"
                            value={employerData.company_website}
                            onChange={(e) => setEmployerData({ ...employerData, company_website: e.target.value })}
                            placeholder="https://"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Language sx={{ color: '#1D503A' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                              }
                            }}
                          />
                        </Grid>

                        {/* Contact Information */}
                        <Grid item xs={12}>
                          <Typography variant="h6" sx={{ color: '#1D503A', mb: 2, mt: 2, fontWeight: 600 }}>
                            Contact Information
                          </Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            required
                            fullWidth
                            label="Your Full Name"
                            value={employerData.full_name}
                            onChange={(e) => setEmployerData({ ...employerData, full_name: e.target.value })}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Person sx={{ color: '#1D503A' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                                '&:hover fieldset': {
                                  borderColor: '#1D503A',
                                },
                              }
                            }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            required
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={employerData.email}
                            onChange={(e) => setEmployerData({ ...employerData, email: e.target.value })}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Email sx={{ color: '#1D503A' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                                '&:hover fieldset': {
                                  borderColor: '#1D503A',
                                },
                              }
                            }}
                          />
                        </Grid>

                        {/* Password Section */}
                        <Grid item xs={12}>
                          <Typography variant="h6" sx={{ color: '#1D503A', mb: 2, mt: 2, fontWeight: 600 }}>
                            Account Security
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={employerData.password}
                            onChange={handlePasswordChange}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Lock sx={{ color: '#1D503A' }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
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
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                              }
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            fullWidth
                            label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={employerData.confirmPassword}
                            onChange={(e) => setEmployerData({ ...employerData, confirmPassword: e.target.value })}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Lock sx={{ color: '#1D503A' }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={handleClickShowConfirmPassword}
                                    edge="end"
                                    sx={{ color: '#1D503A' }}
                                  >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                              }
                            }}
                          />
                        </Grid>

                        {/* Password Strength Indicator */}
                        {employerData.password && (
                          <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                                  Password Strength
                                </Typography>
                                <Typography variant="caption" sx={{ color: getPasswordStrengthColor(), fontWeight: 600 }}>
                                  {getPasswordStrengthText()}
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={(passwordStrength / 4) * 100} 
                                sx={{ 
                                  height: 4, 
                                  borderRadius: 2,
                                  backgroundColor: '#f0f0f0',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: getPasswordStrengthColor(),
                                    borderRadius: 2
                                  }
                                }} 
                              />
                            </Box>
                          </Grid>
                        )}
                      </Grid>

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <RocketLaunch />}
                        sx={{
                          mt: 3,
                          py: 1,
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
                        {loading ? 'Creating Employer Account...' : 'Start Hiring Today'}
                      </Button>

                      <Divider sx={{ my: 3 }}>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                          ALREADY HAVE AN ACCOUNT?
                        </Typography>
                      </Divider>

                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                          Join successful companies hiring with JobWiseAI
                        </Typography>
                        <Button
                          component={Link}
                          to="/login"
                          variant="outlined"
                          fullWidth
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
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Sign In to Employer Account
                        </Button>
                        
                        <Typography variant="body2" sx={{ color: '#666', mt: 2 }}>
                          Looking for a job?{' '}
                          <Link 
                            to="/register" 
                            style={{ 
                              color: '#1D503A', 
                              textDecoration: 'none',
                              fontWeight: 'bold'
                            }}
                          >
                            Register as job seeker
                          </Link>
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

export default EmployerRegister;
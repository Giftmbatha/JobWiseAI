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
  alpha,
  Fade,
  Slide,
  Avatar,
  CircularProgress,
  InputAdornment,
  IconButton,
  Grid,
  LinearProgress,
  Divider
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  Person,
  Email,
  Lock,
  CheckCircle,
  AutoAwesome,
  RocketLaunch,
  Work,
  Psychology,
  TrendingUp,
  Speed,
  Analytics,
  School
} from '@mui/icons-material';
import { authAPI } from '../api/auth';

const Register = () => {
  const [userData, setUserData] = useState({ 
    email: '', 
    password: '', 
    full_name: '',
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (userData.password !== userData.confirmPassword) {
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
      await authAPI.register({
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name
      });
      navigate('/login', { 
        state: { 
          message: 'Account created successfully! Please sign in to continue.' 
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
    setUserData({ ...userData, password: e.target.value });
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

  const benefits = [
    { text: "AI-powered job matching", icon: <Psychology /> },
    { text: "Personalized career insights", icon: <Analytics /> },
    { text: "One-click applications", icon: <RocketLaunch /> },
    { text: "Professional profile builder", icon: <Work /> },
    { text: "Real-time job market analytics", icon: <TrendingUp /> },
    { text: "Skill development tracking", icon: <School /> }
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
                        <AutoAwesome />
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
                      Start Your Career Journey
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
                      Join thousands of professionals who found their dream jobs through AI-powered career matching and personalized insights.
                    </Typography>

                    {/* Benefits List */}
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
                        <RocketLaunch /> Why Join JobWiseAI?
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {benefits.map((benefit, index) => (
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
                        <Work />
                      </Avatar>
                      <Typography variant="h5" sx={{ 
                        color: '#1D503A', 
                        fontWeight: 600,
                        mb: 1
                      }}>
                        Create Your Account
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Join the future of job searching
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
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="full_name"
                        label="Full Name"
                        name="full_name"
                        autoComplete="name"
                        autoFocus
                        value={userData.full_name}
                        onChange={(e) => setUserData({ ...userData, full_name: e.target.value })}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: '#1D503A' }} />
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
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
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
                        autoComplete="new-password"
                        value={userData.password}
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

                      {/* Password Strength Indicator */}
                      {userData.password && (
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
                      )}

                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={userData.confirmPassword}
                        onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: '#1D503A' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle confirm password visibility"
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
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            '&:hover fieldset': {
                              borderColor: '#1D503A',
                            },
                          }
                        }}
                      />

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
                        {loading ? 'Creating Your Account...' : 'Launch Your Career'}
                      </Button>

                      <Divider sx={{ my: 2 }}>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                          ALREADY HAVE AN ACCOUNT?
                        </Typography>
                      </Divider>

                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                          Join thousands of successful professionals
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
                          Sign In to Your Account
                        </Button>
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

export default Register;
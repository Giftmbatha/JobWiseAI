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
  Tabs,
  Tab
} from '@mui/material';
import { Google } from '@mui/icons-material';
import { authAPI } from '../api/auth';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

// src/pages/Login.jsx - Simplify by removing manual redirect
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

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
            backgroundColor: 'background',
            border: '2px solid #1D503A',
            borderRadius: 2,
          }}
        >
          <Typography 
            component="h1" 
            variant="h4" 
            align="center" 
            gutterBottom
            sx={{ color: 'primary.main', fontWeight: 'bold' }}
          >
            Welcome to JobWiseAI
          </Typography>

          <Typography 
            variant="body1" 
            align="center" 
            sx={{ color: 'neutral.main', mb: 3 }}
          >
            Sign in to continue to your dashboard
          </Typography>

          {/* Role Information Tabs */}
          <Paper sx={{ mb: 3, backgroundColor: 'rgba(29, 80, 58, 0.05)' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              sx={{
                '& .MuiTab-root': { color: '#484848', opacity: 0.7 },
                '& .Mui-selected': { color: '#1D503A', opacity: 1, fontWeight: 'bold' },
              }}
            >
              <Tab label="Job Seeker Login" />
              <Tab label="Employer Login" />
            </Tabs>
          </Paper>

          {tabValue === 0 && (
            <Typography variant="body2" align="center" sx={{ color: '#484848', mb: 2, fontStyle: 'italic' }}>
              Sign in to find your dream job with AI-powered matching
            </Typography>
          )}
          
          {tabValue === 1 && (
            <Typography variant="body2" align="center" sx={{ color: '#484848', mb: 2, fontStyle: 'italic' }}>
              Sign in to manage your job postings and find candidates
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: '#1D503A',
                '&:hover': {
                  backgroundColor: '#16412e',
                },
                borderRadius: 1,
                fontWeight: 'bold',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" sx={{ color: 'neutral.main' }}>
                OR
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Google />}
              onClick={handleGoogleLogin}
              sx={{
                py: 1.5,
                borderColor: '#1D503A',
                color: '#1D503A',
                '&:hover': {
                  borderColor: '#16412e',
                  backgroundColor: 'rgba(29, 80, 58, 0.04)',
                },
                borderRadius: 1,
                fontWeight: 'bold',
              }}
            >
              Continue with Google
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" sx={{ color: 'neutral.main' }}>
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
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'neutral.main' }}>
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
      </Box>
    </Container>
  );
};

export default Login;
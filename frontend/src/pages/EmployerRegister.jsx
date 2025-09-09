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
  Grid
} from '@mui/material';
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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (employerData.password !== employerData.confirmPassword) {
      setError('Passwords do not match');
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
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, backgroundColor: 'background', border: '2px solid #1D503A', borderRadius: 2 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            Employer Registration
          </Typography>

          <Typography variant="body1" align="center" sx={{ color: 'neutral.main', mb: 3 }}>
            Create an employer account to post jobs
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Company Name"
                  value={employerData.company_name}
                  onChange={(e) => setEmployerData({ ...employerData, company_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Size"
                  value={employerData.company_size}
                  onChange={(e) => setEmployerData({ ...employerData, company_size: e.target.value })}
                  placeholder="e.g., 1-10 employees"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Website"
                  value={employerData.company_website}
                  onChange={(e) => setEmployerData({ ...employerData, company_website: e.target.value })}
                  placeholder="https://"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Your Full Name"
                  value={employerData.full_name}
                  onChange={(e) => setEmployerData({ ...employerData, full_name: e.target.value })}
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  value={employerData.password}
                  onChange={(e) => setEmployerData({ ...employerData, password: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={employerData.confirmPassword}
                  onChange={(e) => setEmployerData({ ...employerData, confirmPassword: e.target.value })}
                />
              </Grid>
            </Grid>

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
                '&:hover': { backgroundColor: '#16412e' },
                borderRadius: 1,
                fontWeight: 'bold',
              }}
            >
              {loading ? 'Creating Account...' : 'Register as Employer'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'neutral.main' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#1D503A', textDecoration: 'none', fontWeight: 'bold' }}>
                  Sign in
                </Link>
              </Typography>
              <Typography variant="body2" sx={{ color: 'neutral.main', mt: 1 }}>
                Looking for a job?{' '}
                <Link to="/register" style={{ color: '#1D503A', textDecoration: 'none', fontWeight: 'bold' }}>
                  Register as job seeker
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EmployerRegister;
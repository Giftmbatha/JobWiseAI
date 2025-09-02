// src/pages/Dashboard.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ResumeUpload from '../components/ResumeUpload';
import JobsList from '../components/JobList';
import EmployerDashboard from '../components/EmployerDashboard';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Double-check role access
    if (user) {
      // Redirect based on role and current path
      if (user.role === 'EMPLOYER' && location.pathname === '/dashboard') {
        navigate('/employer/dashboard', { replace: true });
      }else if (user.role !== 'EMPLOYER' && location.pathname === '/employer/dashboard') {
        navigate('/dashboard', { replace: true });
        
      }
    }
  }, [user, location.pathname, navigate]);

  // Show loading if user data isn't available yet
  if (!user) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Loading dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#1D503A', color: 'white' }}>
          <Typography variant="h3" gutterBottom>
            Welcome back, {user?.full_name || user?.email}!
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            {user?.role === 'EMPLOYER' 
              ? 'Employer Dashboard - Manage your job postings' 
              : 'Job Seeker Dashboard - Find your next opportunity'
            }
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              component={Link}
              to="/"
              sx={{
                backgroundColor: '#FAF5EE',
                color: '#1D503A',
                '&:hover': { backgroundColor: '#e8e0d5' },
              }}
            >
              Browse Jobs
            </Button>
            <Button
              variant="outlined"
              onClick={logout}
              sx={{
                borderColor: '#FAF5EE',
                color: '#FAF5EE',
                '&:hover': {
                  borderColor: '#FAF5EE',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Paper>

        {/* Content based on role */}
        {user?.role === 'EMPLOYER' ? (
          <EmployerDashboard />
        ) : (
          <Box>
            <Typography variant="h4" sx={{ color: '#1D503A', mb: 3 }}>
              Your Job Search Hub
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <ResumeUpload />
              </Box>
              <Box sx={{ flex: 2 }}>
                <JobsList />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;
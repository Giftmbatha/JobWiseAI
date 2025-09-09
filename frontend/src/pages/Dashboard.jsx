// src/pages/Dashboard.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import ResumeUpload from '../components/ResumeUpload';
import JobsList from '../components/JobList';
import EmployerDashboard from '../components/EmployerDashboard';
import AIRecommendations from '../components/AIRecommendations';
import ReportsDashboard from '../components/ReportsDashboard';

const Dashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect if user is on wrong dashboard based on role
    if (user && !authLoading) {
      console.log('Dashboard - User role:', user.role);
      console.log('Dashboard - Current path:', location.pathname);
      
      if (user.role === 'EMPLOYER' && location.pathname === '/dashboard') {
        console.log('Redirecting employer to employer dashboard');
        navigate('/employer/dashboard', { replace: true });
        return;
      }
      
      if (user.role !== 'EMPLOYER' && location.pathname === '/employer/dashboard') {
        console.log('Redirecting job seeker to regular dashboard');
        navigate('/dashboard', { replace: true });
        return;
      }
    }
  }, [user, location.pathname, navigate, authLoading]);

  // Show loading if auth is still checking
  if (authLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Loading dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  // Show message if no user data (shouldn't happen in protected route, but just in case)
  if (!user) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" sx={{ color: '#1D503A', mb: 2 }}>
            Welcome to JobWiseAI
          </Typography>
          <Typography sx={{ color: '#484848', mb: 4 }}>
            Please log in to access your dashboard
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/login"
            sx={{
              backgroundColor: '#1D503A',
              '&:hover': { backgroundColor: '#16412e' }
            }}
          >
            Go to Login
          </Button>
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
              ? 'Employer Dashboard - Manage your job postings and find candidates' 
              : user?.role === 'ADMIN'
              ? 'Admin Dashboard - Platform management and analytics'
              : 'Job Seeker Dashboard - Find your next career opportunity'
            }
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip
              label={user.role || 'USER'}
              sx={{
                backgroundColor: '#FAF5EE',
                color: '#1D503A',
                fontWeight: 'bold'
              }}
            />
            
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

            {user?.role === 'ADMIN' && (
              <Button
                variant="outlined"
                component={Link}
                to="/admin"
                sx={{
                  borderColor: '#FAF5EE',
                  color: '#FAF5EE',
                  '&:hover': {
                    borderColor: '#FAF5EE',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Admin Panel
              </Button>
            )}

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
          <Box>
            <Typography variant="h4" sx={{ color: '#1D503A', mb: 3 }}>
              Employer Analytics & Management
            </Typography>
            
            {/* Reports Dashboard for Employers */}
            <Box sx={{ mb: 4 }}>
              <ReportsDashboard />
            </Box>
            
            {/* Employer Job Management */}
            <EmployerDashboard />
          </Box>
        ) : user?.role === 'ADMIN' ? (
          <Box>
            <Typography variant="h4" sx={{ color: '#1D503A', mb: 3 }}>
              Admin Dashboard
            </Typography>
            
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#1D503A', mb: 2 }}>
                🛠️ Admin Panel Coming Soon
              </Typography>
              <Typography sx={{ color: '#484848', mb: 3 }}>
                Admin features are currently in development. You'll soon be able to:
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" sx={{ color: '#1D503A' }}>👥 User Management</Typography>
                  <Typography variant="body2">Manage all users and permissions</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" sx={{ color: '#1D503A' }}>📊 Platform Analytics</Typography>
                  <Typography variant="body2">View system-wide statistics and reports</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" sx={{ color: '#1D503A' }}>⚙️ System Settings</Typography>
                  <Typography variant="body2">Configure platform settings and features</Typography>
                </Grid>
              </Grid>
              
              <Button
                variant="contained"
                component={Link}
                to="/"
                sx={{
                  backgroundColor: '#1D503A',
                  '&:hover': { backgroundColor: '#16412e' }
                }}
              >
                Browse Jobs While Waiting
              </Button>
            </Paper>
          </Box>
        ) : (
          // Job Seeker Dashboard
          <Box>
            <Typography variant="h4" sx={{ color: '#1D503A', mb: 3 }}>
              Your Job Search Hub
            </Typography>
            
            {/* AI Recommendations */}
            <Box sx={{ mb: 4 }}>
              <AIRecommendations />
            </Box>
            
            {/* Resume and Jobs */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <ResumeUpload />
              </Grid>
              <Grid item xs={12} md={8}>
                <JobsList />
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;
// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import ResumeUpload from '../components/ResumeUpload';
import JobsList from '../components/JobList';
import EmployerDashboard from '../components/EmployerDashboard';
import AIRecommendations from '../components/AIRecommendations';
import ReportsDashboard from '../components/ReportsDashboard';
import ApplicationModal from '../components/ApplicationModal';
import { applicationsApi } from '../api/applications';
import { resumesAPI } from '../api/resumes';

const Dashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [recentApplications, setRecentApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [userResumes, setUserResumes] = useState([]);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

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

    // Load recent applications for job seekers
    if (user && user.role === 'JOB_SEEKER') {
      loadRecentApplications();
    }
  }, [user, location.pathname, navigate, authLoading]);

  const loadRecentApplications = async () => {
    setApplicationsLoading(true);
    try {
      const applications = await applicationsApi.getMyApplications();
      // Get only the 3 most recent applications
      setRecentApplications(applications.slice(0, 3));
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

// In your Dashboard.jsx - update the handleApplyClick function
const handleApplyClick = async (job) => {
  if (!user) {
    navigate('/login');
    return;
  }

  // Handle external jobs with apply_url (redirect)
  if (job.is_external && job.apply_url) {
    window.open(job.apply_url, '_blank');
    return;
  }

  // Handle external jobs without apply_url (cannot apply)
  if (job.is_external && !job.apply_url) {
    alert('This is an external job. Please visit the company website to apply.');
    return;
  }

  // Set the selected job FIRST
  setSelectedJob(job);
  
  try {
    const response = await resumesAPI.getUserResumes();
    // Ensure we're passing an array, even if the API returns something else
    const resumes = Array.isArray(response.data) ? response.data : [];
    setUserResumes(resumes);
    // Only open modal after job is set and resumes are loaded
    setApplicationModalOpen(true);
  } catch (error) {
    console.error('Failed to load resumes:', error);
    alert('Please upload a resume first before applying to jobs.');
    // Reset selected job if there's an error
    setSelectedJob(null);
    // Set empty array to prevent map error
    setUserResumes([]);
  }
};


  const handleApplicationSubmit = async (success) => {
    setApplicationModalOpen(false);
    if (success) {
      setApplicationSuccess(true);
      // Reload recent applications
      await loadRecentApplications();
      // Hide success message after 5 seconds
      setTimeout(() => setApplicationSuccess(false), 5000);
    }
  };

  const statusColors = {
    pending: 'default',
    reviewed: 'primary',
    interviewing: 'info',
    rejected: 'error',
    offered: 'warning',
    hired: 'success'
  };

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

  // Show message if no user data
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

            {user?.role === 'JOB_SEEKER' && recentApplications.length > 0 && (
              <Button
                variant="outlined"
                component={Link}
                to="/my-applications"
                sx={{
                  borderColor: '#FAF5EE',
                  color: '#FAF5EE',
                  '&:hover': {
                    borderColor: '#FAF5EE',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                View All Applications
              </Button>
            )}

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

        {/* Application Success Alert */}
        {applicationSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Your application was submitted successfully!
          </Alert>
        )}

        {/* Content based on role */}
        {user?.role === 'EMPLOYER' ? (
          <Box>
            <Typography variant="h4" sx={{ color: '#1D503A', mb: 3 }}>
              Employer Analytics & Management
            </Typography>
            
            
            {/* Employer Job Management */}
            <EmployerDashboard />
          </Box>
        ) : user?.role === 'ADMIN' ? (
          <Box>
            <Typography variant="h4" sx={{ color: '#1D503A', mb: 3 }}>
              Admin Dashboard
            </Typography>
            
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                        {/* Reports Dashboard for Employers */}
            <Box sx={{ mb: 4 }}>
              <ReportsDashboard />
            </Box>
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
            
            {/* Recent Applications Section */}
            {recentApplications.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ color: '#1D503A', mb: 2 }}>
                  Recent Applications
                </Typography>
                <Grid container spacing={2}>
                  {recentApplications.map((application) => (
                    <Grid item xs={12} md={6} key={application.id}>
                      <Card>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography variant="h6">{application.job_title}</Typography>
                              <Typography color="textSecondary">{application.company_name}</Typography>
                              <Typography variant="body2" color="textSecondary">
                                Applied: {new Date(application.applied_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Chip
                              label={application.status}
                              color={statusColors[application.status] || 'default'}
                              size="small"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {recentApplications.length >= 3 && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      component={Link}
                      to="/my-applications"
                      sx={{ color: '#1D503A', borderColor: '#1D503A' }}
                    >
                      View All Applications
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* AI Recommendations */}
            <Box sx={{ mb: 4 }}>
              <AIRecommendations onApplyClick={handleApplyClick} />
            </Box>
            
            {/* Resume and Jobs */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <ResumeUpload />
                {recentApplications.length === 0 && (
                  <Paper sx={{ p: 3, mt: 3, backgroundColor: '#FAF5EE' }}>
                    <Typography variant="h6" sx={{ color: '#1D503A', mb: 1 }}>
                      Ready to Apply?
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#484848', mb: 2 }}>
                      Upload your resume and start applying to jobs that match your skills and experience.
                    </Typography>
                    <Button
                      variant="contained"
                      component={Link}
                      to="/jobs"
                      sx={{
                        backgroundColor: '#1D503A',
                        '&:hover': { backgroundColor: '#16412e' }
                      }}
                    >
                      Browse All Jobs
                    </Button>
                  </Paper>
                )}
              </Grid>
              <Grid item xs={12} md={8}>
                <JobsList onApplyClick={handleApplyClick} />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Application Modal */}
        <ApplicationModal
          job={selectedJob}
          open={applicationModalOpen && !!selectedJob}
          onClose={handleApplicationSubmit}
          userResumes={userResumes}
        />
      </Box>
    </Container>
  );
};

export default Dashboard;
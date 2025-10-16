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
  Alert,
  alpha
} from '@mui/material';
import { Link } from 'react-router-dom';
import ResumeUpload from '../components/ResumeUpload';
import JobsList from '../components/JobList';
import EmployerDashboard from '../components/EmployerDashboard';
import AIRecommendations from '../components/AIRecommendations';
import ReportsDashboard from '../components/ReportsDashboard';
import ApplicationModal from '../components/ApplicationModal';
import UserProfile from '../components/UserProfile';
import { applicationsApi } from '../api/applications';
import { resumesAPI } from '../api/resumes';

// Import icons for enhanced UI
import {
  TrendingUpRounded,
  WorkOutlineRounded,
  DescriptionRounded,
  AnalyticsRounded,
  AdminPanelSettingsRounded,
  ExitToAppRounded,
  SearchRounded,
  VisibilityRounded,
  AutoAwesome,
  RocketLaunch,
  Psychology
} from '@mui/icons-material';

const Dashboard = () => {
  const { user, logout, loading: authLoading, updateUser } = useAuth();
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
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ 
              color: '#1D503A',
              animationDuration: '800ms'
            }} 
          />
          <Typography variant="h6" sx={{ color: '#1D503A', fontWeight: 500 }}>
            Loading your dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Show message if no user data
  if (!user) {
    return (
      <Container>
        <Box sx={{ 
          textAlign: 'center', 
          py: 6,
          background: 'linear-gradient(135deg, #FAF5EE 0%, #ffffff 100%)',
          borderRadius: 2,
          px: 3,
          my: 3
        }}>
          <Typography variant="h4" sx={{ color: '#1D503A', mb: 2, fontWeight: 600 }}>
            Welcome to JobWiseAI
          </Typography>
          <Typography variant="body1" sx={{ color: '#484848', mb: 3, opacity: 0.8 }}>
            Please log in to access your personalized dashboard
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/login"
            startIcon={<TrendingUpRounded />}
            sx={{
              backgroundColor: '#1D503A',
              '&:hover': { 
                backgroundColor: '#16412e',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(29, 80, 58, 0.3)'
              },
              px: 3,
              py: 1,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(29, 80, 58, 0.2)'
            }}
          >
            Go to Login
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box sx={{ py: 3 }}>
        {/* Enhanced Header with Profile */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(29, 80, 58, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '150px',
              height: '150px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              transform: 'translate(30%, -30%)'
            }
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #FAF5EE, #ffffff)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 1
                }}
              >
                Welcome back, {user?.full_name || user?.email}!
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.9, 
                  mb: 2,
                  fontSize: '1rem',
                  fontWeight: 400
                }}
              >
                {user?.role === 'EMPLOYER' 
                  ? 'Employer Dashboard - Manage your job postings and find candidates' 
                  : user?.role === 'ADMIN'
                  ? 'Admin Dashboard - Platform management and analytics'
                  : 'Job Seeker Dashboard - Find your next career opportunity'
                }
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Chip
                  icon={user?.role === 'EMPLOYER' ? <WorkOutlineRounded /> : 
                        user?.role === 'ADMIN' ? <AdminPanelSettingsRounded /> : 
                        <TrendingUpRounded />}
                  label={user.role || 'USER'}
                  sx={{
                    backgroundColor: '#FAF5EE',
                    color: '#1D503A',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    px: 1,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                
                <Button
                  variant="contained"
                  component={Link}
                  to="/"
                  startIcon={<SearchRounded />}
                  sx={{
                    backgroundColor: '#FAF5EE',
                    color: '#1D503A',
                    '&:hover': { 
                      backgroundColor: '#e8e0d5',
                      transform: 'translateY(-1px)'
                    },
                    px: 2,
                    borderRadius: 2,
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(250, 245, 238, 0.3)'
                  }}
                >
                  Browse Jobs
                </Button>

                {user?.role === 'JOB_SEEKER' && recentApplications.length > 0 && (
                  <Button
                    variant="outlined"
                    component={Link}
                    to="/my-applications"
                    startIcon={<VisibilityRounded />}
                    sx={{
                      borderColor: '#FAF5EE',
                      color: '#FAF5EE',
                      '&:hover': {
                        borderColor: '#FAF5EE',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        transform: 'translateY(-1px)'
                      },
                      px: 2,
                      borderRadius: 2,
                      fontWeight: 600,
                      transition: 'all 0.3s ease'
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
                    startIcon={<AdminPanelSettingsRounded />}
                    sx={{
                      borderColor: '#FAF5EE',
                      color: '#FAF5EE',
                      '&:hover': {
                        borderColor: '#FAF5EE',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        transform: 'translateY(-1px)'
                      },
                      px: 2,
                      borderRadius: 2,
                      fontWeight: 600,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Admin Panel
                  </Button>
                )}

                <Button
                  variant="outlined"
                  onClick={logout}
                  startIcon={<ExitToAppRounded />}
                  sx={{
                    borderColor: '#FAF5EE',
                    color: '#FAF5EE',
                    '&:hover': {
                      borderColor: '#FAF5EE',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-1px)'
                    },
                    px: 2,
                    borderRadius: 2,
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                  }}
                >
                  Logout
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <UserProfile />
            </Grid>
          </Grid>
        </Paper>

        {/* Enhanced Application Success Alert */}
        {applicationSuccess && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              fontSize: '0.875rem',
              py: 1
            }}
            icon={<AutoAwesome />}
          >
            Your application was submitted successfully!
          </Alert>
        )}

        {/* Enhanced Content based on role */}
        {user?.role === 'EMPLOYER' ? (
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#1D503A', 
                mb: 3,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <AnalyticsRounded sx={{ fontSize: '1.5rem' }} />
              Employer Analytics & Management
            </Typography>
            
            {/* Employer Job Management */}
            <EmployerDashboard />
          </Box>
        ) : user?.role === 'ADMIN' ? (
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#1D503A', 
                mb: 3,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <AdminPanelSettingsRounded sx={{ fontSize: '1.5rem' }} />
              Admin Dashboard
            </Typography>
            
            <Paper 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                borderRadius: 2,
                background: 'white',
                boxShadow: '0 4px 12px rgba(29, 80, 58, 0.1)',
                border: '1px solid rgba(29, 80, 58, 0.1)'
              }}
            >
              {/* Reports Dashboard for Admins */}
              <Box sx={{ mb: 3 }}>
                <ReportsDashboard />
              </Box>
              
              <Typography variant="h5" sx={{ color: '#1D503A', mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Psychology /> Admin Panel Coming Soon
              </Typography>
              <Typography sx={{ color: '#484848', mb: 3, fontSize: '1rem', opacity: 0.9 }}>
                Admin features are currently in development. You'll soon be able to:
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#f8f9fa', height: '100%' }}>
                    <Typography variant="h6" sx={{ color: '#1D503A', mb: 1, fontWeight: 600 }}>User Management</Typography>
                    <Typography variant="body2" sx={{ color: '#484848', opacity: 0.8 }}>Manage all users and permissions across the platform</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#f8f9fa', height: '100%' }}>
                    <Typography variant="h6" sx={{ color: '#1D503A', mb: 1, fontWeight: 600 }}>Platform Analytics</Typography>
                    <Typography variant="body2" sx={{ color: '#484848', opacity: 0.8 }}>View system-wide statistics and detailed reports</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#f8f9fa', height: '100%' }}>
                    <Typography variant="h6" sx={{ color: '#1D503A', mb: 1, fontWeight: 600 }}>System Settings</Typography>
                    <Typography variant="body2" sx={{ color: '#484848', opacity: 0.8 }}>Configure platform settings and feature toggles</Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Button
                variant="contained"
                component={Link}
                to="/"
                startIcon={<SearchRounded />}
                sx={{
                  backgroundColor: '#1D503A',
                  '&:hover': { 
                    backgroundColor: '#16412e',
                    transform: 'translateY(-1px)'
                  },
                  px: 3,
                  py: 1,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)'
                }}
              >
                Browse Jobs While Waiting
              </Button>
            </Paper>
          </Box>
        ) : (
          // Enhanced Job Seeker Dashboard
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#1D503A', 
                mb: 3,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <TrendingUpRounded sx={{ fontSize: '1.5rem' }} />
              Your Job Search Hub
            </Typography>
            
            {/* Enhanced Recent Applications Section */}
            {recentApplications.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#1D503A', mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionRounded /> Recent Applications
                </Typography>
                <Grid container spacing={2}>
                  {recentApplications.map((application) => (
                    <Grid item xs={12} md={6} lg={4} key={application.id}>
                      <Card 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          border: '1px solid rgba(29, 80, 58, 0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(29, 80, 58, 0.15)'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1D503A', mb: 1 }}>
                                {application.job_title}
                              </Typography>
                              <Typography color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                                {application.company_name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" sx={{ opacity: 0.8 }}>
                                Applied: {new Date(application.applied_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Chip
                              label={application.status}
                              color={statusColors[application.status] || 'default'}
                              size="small"
                              sx={{ 
                                fontWeight: 600,
                                borderRadius: 1,
                                minWidth: 80
                              }}
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
                      startIcon={<VisibilityRounded />}
                      sx={{ 
                        color: '#1D503A', 
                        borderColor: '#1D503A',
                        borderRadius: 2,
                        px: 3,
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: 'rgba(29, 80, 58, 0.04)',
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      View All Applications
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* Enhanced AI Recommendations */}
            <Box sx={{ mb: 4 }}>
              <AIRecommendations onApplyClick={handleApplyClick} />
            </Box>
            
            {/* Enhanced Resume and Jobs Grid */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <ResumeUpload />
                {recentApplications.length === 0 && (
                  <Paper 
                    sx={{ 
                      p: 3, 
                      mt: 2, 
                      backgroundColor: '#FAF5EE',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(29, 80, 58, 0.1)',
                      border: '1px solid rgba(29, 80, 58, 0.1)'
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#1D503A', mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionRounded /> Ready to Apply?
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#484848', mb: 2, opacity: 0.9, lineHeight: 1.6 }}>
                      Upload your resume and start applying to jobs that match your skills and experience.
                    </Typography>
                    <Button
                      variant="contained"
                      component={Link}
                      to="/jobs"
                      startIcon={<SearchRounded />}
                      sx={{
                        backgroundColor: '#1D503A',
                        '&:hover': { 
                          backgroundColor: '#16412e',
                          transform: 'translateY(-1px)'
                        },
                        px: 2,
                        borderRadius: 2,
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)'
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
// frontend/src/pages/MyApplications.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Box,
  CircularProgress,
  Paper,
  alpha,
  Fade,
  Avatar,
  Divider,
  Button,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Work,
  Business,
  Schedule,
  Description,
  TrendingUp,
  CheckCircle,
  Cancel,
  AccessTime,
  Visibility,
  Refresh,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';
import { applicationsApi } from '../api/applications';

const statusColors = {
  pending: { color: 'default', icon: <AccessTime />, label: 'Under Review' },
  reviewed: { color: 'primary', icon: <Visibility />, label: 'Being Reviewed' },
  interviewing: { color: 'info', icon: <Phone />, label: 'Interviewing' },
  rejected: { color: 'error', icon: <Cancel />, label: 'Not Selected' },
  offered: { color: 'warning', icon: <TrendingUp />, label: 'Offer Received' },
  hired: { color: 'success', icon: <CheckCircle />, label: 'Hired' }
};

const statusOrder = {
  pending: 1,
  reviewed: 2,
  interviewing: 3,
  offered: 4,
  hired: 5,
  rejected: 6
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const statusTabs = [
    { label: 'All Applications', value: 'all' },
    { label: 'Under Review', value: 'pending' },
    { label: 'Interviewing', value: 'interviewing' },
    { label: 'Offers', value: 'offered' },
    { label: 'Hired', value: 'hired' },
    { label: 'Not Selected', value: 'rejected' }
  ];

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, activeTab]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await applicationsApi.getMyApplications();
      // Sort applications by status order and then by date (newest first)
      const sortedData = data.sort((a, b) => {
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return new Date(b.applied_at) - new Date(a.applied_at);
      });
      setApplications(sortedData);
    } catch (error) {
      console.error('Failed to load applications:', error);
      setError('Failed to load your applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    if (activeTab === 0) {
      setFilteredApplications(applications);
    } else {
      const status = statusTabs[activeTab].value;
      setFilteredApplications(applications.filter(app => app.status === status));
    }
  };

  const getApplicationStats = () => {
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      interviewing: applications.filter(app => app.status === 'interviewing').length,
      offered: applications.filter(app => app.status === 'offered').length,
      hired: applications.filter(app => app.status === 'hired').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
    return stats;
  };

  const getDaysSinceApplication = (appliedDate) => {
    const applied = new Date(appliedDate);
    const today = new Date();
    const diffTime = Math.abs(today - applied);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const ApplicationCard = ({ application }) => {
    const statusInfo = statusColors[application.status] || statusColors.pending;
    const daysSinceApplied = getDaysSinceApplication(application.applied_at);

    return (
      <Fade in={true} timeout={800}>
        <Card sx={{ 
          mb: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
          border: '1px solid rgba(29, 80, 58, 0.1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 32px rgba(29, 80, 58, 0.15)',
            borderColor: 'rgba(29, 80, 58, 0.2)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                <Avatar sx={{ 
                  bgcolor: '#1D503A', 
                  width: 56, 
                  height: 56 
                }}>
                  <Work />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ 
                    color: '#1D503A', 
                    fontWeight: 700,
                    mb: 0.5 
                  }}>
                    {application.job_title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Business sx={{ fontSize: 18, color: '#666' }} />
                      <Typography variant="body1" sx={{ color: '#484848', fontWeight: 600 }}>
                        {application.company_name}
                      </Typography>
                    </Box>
                    {application.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 16, color: '#666' }} />
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {application.location}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
              
              <Chip
                icon={statusInfo.icon}
                label={statusInfo.label}
                color={statusInfo.color}
                sx={{ 
                  fontWeight: 700,
                  borderRadius: 2,
                  minWidth: 140
                }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Application Details */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule sx={{ color: '#1D503A', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                        Applied Date
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {new Date(application.applied_at).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ color: '#ed6c02', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                        Time Since Application
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#ed6c02' }}>
                        {daysSinceApplied} day{daysSinceApplied !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {application.resume_name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Description sx={{ color: '#1976d2', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                          Resume Used
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {application.resume_name}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {application.contact_email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email sx={{ color: '#d32f2f', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                          Contact Email
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {application.contact_email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Cover Letter Section */}
            {application.cover_letter && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ color: '#1D503A', mb: 1, fontWeight: 600 }}>
                  Your Cover Letter
                </Typography>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: '#FAF5EE',
                  borderRadius: 2,
                  border: '1px solid rgba(29, 80, 58, 0.1)'
                }}>
                  <Typography variant="body2" sx={{ 
                    color: '#484848', 
                    lineHeight: 1.6,
                    fontStyle: 'italic'
                  }}>
                    "{application.cover_letter}"
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Status-specific Actions */}
            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
              {application.status === 'interviewing' && (
                <Button variant="outlined" size="small" startIcon={<Phone />}>
                  Prepare for Interview
                </Button>
              )}
              {application.status === 'offered' && (
                <Button variant="contained" size="small" startIcon={<CheckCircle />}>
                  Review Offer
                </Button>
              )}
              <Button variant="outlined" size="small" startIcon={<Visibility />}>
                View Job Details
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    );
  };

  const stats = getApplicationStats();

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', flexDirection: 'column', gap: 3 }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ color: '#1D503A' }} 
          />
          <Typography variant="h6" sx={{ color: '#1D503A', fontWeight: 600 }}>
            Loading your applications...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h3" sx={{ 
              color: '#1D503A', 
              fontWeight: 800,
              background: 'linear-gradient(45deg, #1D503A, #2a6b4f)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 1
            }}>
              My Applications
            </Typography>
            <Typography variant="h6" sx={{ color: '#666', fontWeight: 400 }}>
              Track and manage your job applications in one place
            </Typography>
          </Box>
          <Tooltip title="Refresh applications">
            <IconButton 
              onClick={loadApplications}
              sx={{ 
                p: 2,
                background: 'linear-gradient(135deg, #1D503A, #2a6b4f)',
                color: 'white',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #16412e, #1D503A)',
                  transform: 'rotate(45deg)'
                },
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(29, 80, 58, 0.3)'
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={4} md={2}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #1D503A15, #1D503A08)',
              border: '1px solid rgba(29, 80, 58, 0.1)'
            }}>
              <Typography variant="h4" sx={{ color: '#1D503A', fontWeight: 800 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                Total
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #1976d215, #1976d208)',
              border: '1px solid rgba(25, 118, 210, 0.1)'
            }}>
              <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 800 }}>
                {stats.pending}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                Under Review
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #0288d115, #0288d108)',
              border: '1px solid rgba(2, 136, 209, 0.1)'
            }}>
              <Typography variant="h4" sx={{ color: '#0288d1', fontWeight: 800 }}>
                {stats.interviewing}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                Interviewing
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ed6c0215, #ed6c0208)',
              border: '1px solid rgba(237, 108, 2, 0.1)'
            }}>
              <Typography variant="h4" sx={{ color: '#ed6c02', fontWeight: 800 }}>
                {stats.offered}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                Offers
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #2e7d3215, #2e7d3208)',
              border: '1px solid rgba(46, 125, 50, 0.1)'
            }}>
              <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 800 }}>
                {stats.hired}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                Hired
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #d32f2f15, #d32f2f08)',
              border: '1px solid rgba(211, 47, 47, 0.1)'
            }}>
              <Typography variant="h4" sx={{ color: '#d32f2f', fontWeight: 800 }}>
                {stats.rejected}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                Not Selected
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ 
          mb: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #FAF5EE 0%, #f5f0e9 100%)'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { 
                minHeight: 60,
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'none',
                '&.Mui-selected': {
                  color: '#1D503A'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1D503A',
                height: 3,
                borderRadius: 3
              }
            }}
          >
            {statusTabs.map((tab, index) => (
              <Tab 
                key={tab.value}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.label}
                    {tab.value !== 'all' && (
                      <Chip 
                        label={stats[tab.value] || 0} 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#1D503A', 
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20,
                          minWidth: 20
                        }} 
                      />
                    )}
                  </Box>
                } 
              />
            ))}
          </Tabs>
        </Paper>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)'
          }}
          action={
            <Button color="inherit" size="small" onClick={loadApplications}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Work sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#666', mb: 2, fontWeight: 600 }}>
            {activeTab === 0 ? 'No Applications Yet' : `No ${statusTabs[activeTab].label}`}
          </Typography>
          <Typography variant="body1" sx={{ color: '#999', mb: 3 }}>
            {activeTab === 0 
              ? "Start applying to jobs to see your applications here!" 
              : `You don't have any applications with status "${statusTabs[activeTab].label}"`
            }
          </Typography>
          {activeTab !== 0 && (
            <Button 
              variant="contained" 
              onClick={() => setActiveTab(0)}
              sx={{
                background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)'
                },
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600
              }}
            >
              View All Applications
            </Button>
          )}
        </Box>
      ) : (
        <Box>
          <Typography variant="h6" sx={{ color: '#1D503A', mb: 3, fontWeight: 600 }}>
            {statusTabs[activeTab].label} ({filteredApplications.length})
          </Typography>
          {filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </Box>
      )}
    </Container>
  );
};

export default MyApplications;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  Tabs,
  Tab,
  LinearProgress,
  IconButton,
  CircularProgress,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Avatar,
  Rating,
  Tooltip,
  Snackbar,
  alpha,
  Fade,
  Slide,
  useTheme
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Business,
  People,
  TrendingUp,
  Email,
  Visibility,
  Download,
  LocationOn,
  Work,
  AttachMoney,
  Schedule,
  Star,
  Refresh,
  Phone,
  LinkedIn,
  GitHub,
  AutoAwesome,
  RocketLaunch,
  Psychology,
  Diversity3,
  CheckCircle,
  Lightbulb,
  Bolt
} from '@mui/icons-material';
import { jobsAPI } from '../api/jobs';
import { employerAPI } from '../api/employer';
import EmployerApplications from '../components/EmployerApplications';

const EmployerDashboard = () => {
  const theme = useTheme();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [candidateRecommendations, setCandidateRecommendations] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [applicationsCount, setApplicationsCount] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary_min: '',
    salary_max: '',
    job_type: 'Full-time',
    remote: false,
    apply_url: ''
  });

  const jobTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Freelance',
    'Internship',
    'Temporary'
  ];

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

const fetchEmployerJobs = async () => {
  setLoading(true);
  setError('');
  try {
    const response = await jobsAPI.getEmployerJobs();
    setJobs(response.data.jobs || []);
    
    // Fetch applications count
    await fetchApplicationsCount();
    
    if (response.data.jobs?.length > 0) {
      fetchCandidateRecommendations(response.data.jobs);
    }
  } catch (error) {
    setError('Failed to fetch your job postings');
    console.error('Fetch jobs error:', error);
  } finally {
    setLoading(false);
  }
};

  const fetchCandidateRecommendations = async (jobsList) => {
    setCandidateLoading(true);
    try {
      const jobIds = jobsList.map(job => job.id);
      const response = await employerAPI.getBatchCandidateRecommendations({ 
        job_ids: jobIds, 
        top_k_per_job: 3 
      });
      setCandidateRecommendations(response.data.results || {});
    } catch (error) {
      console.error('Fetch candidates error:', error);
      showSnackbar('Failed to fetch candidate recommendations');
    } finally {
      setCandidateLoading(false);
    }
  };

  const fetchApplicationsCount = async () => {
  try {
    const applicationsData = await employerApplicationsApi.getApplications();
    setApplicationsCount(applicationsData.length || 0);
  } catch (error) {
    console.error('Fetch applications count error:', error);
    setApplicationsCount(0);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (editingJob) {
        await jobsAPI.updateJob(editingJob.id, formData);
        showSnackbar('Job updated successfully!');
      } else {
        await jobsAPI.createJob(formData);
        showSnackbar('Job created successfully!');
      }
      
      setDialogOpen(false);
      setEditingJob(null);
      setFormData({
        title: '',
        company: '',
        location: '',
        description: '',
        requirements: '',
        salary_min: '',
        salary_max: '',
        job_type: 'Full-time',
        remote: false,
        apply_url: ''
      });
      
      fetchEmployerJobs();
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description || '',
      requirements: job.requirements || '',
      salary_min: job.salary_min || '',
      salary_max: job.salary_max || '',
      job_type: job.job_type || 'Full-time',
      remote: job.remote || false,
      apply_url: job.apply_url || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobsAPI.deleteJob(jobId);
        showSnackbar('Job deleted successfully');
        fetchEmployerJobs();
      } catch (error) {
        setError('Failed to delete job');
      }
    }
  };

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setCandidateDialogOpen(true);
  };

  const handleContactCandidate = async (candidate) => {
    try {
      const message = `Hi ${candidate.candidate.full_name}, I'm interested in discussing potential opportunities with you.`;
      await employerAPI.contactCandidate(candidate.candidate.user_id, { message });
      showSnackbar(`Message sent to ${candidate.candidate.full_name}`);
    } catch (error) {
      setError('Failed to contact candidate');
    }
  };

  const handleDownloadResume = async (candidate) => {
    try {
      if (candidate.candidate?.resume_id) {
        await employerAPI.downloadCandidateResume(candidate.candidate.resume_id);
        showSnackbar('Resume download started');
      }
    } catch (error) {
      setError('Failed to download resume');
    }
  };

  const handleRefreshRecommendations = () => {
    if (jobs.length > 0) {
      fetchCandidateRecommendations(jobs);
    }
  };

  useEffect(() => {
    fetchEmployerJobs();
  }, []);

  // Stats for the dashboard
  const totalCandidates = Object.values(candidateRecommendations).flat().length;
  const averageMatchScore = totalCandidates > 0 
    ? Math.round(Object.values(candidateRecommendations).flat().reduce((sum, cand) => sum + (cand.score || 0), 0) / totalCandidates)
    : 0;

  const highQualityCandidates = Object.values(candidateRecommendations).flat().filter(cand => cand.score >= 80).length;

  return (
    <Box>
      <Fade in={true} timeout={800}>
        <Paper sx={{ 
          p: 3, 
          mb: 2,
          borderRadius: 2,
          background: 'white',
          boxShadow: '0 4px 12px rgba(29, 80, 58, 0.1)',
          border: '1px solid rgba(29, 80, 58, 0.08)'
        }}>
          {/* Enhanced Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#1D503A', 
                  mb: 1, 
                  fontWeight: 700,
                }}
              >
                Employer Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', fontWeight: 400 }}>
                Manage your job postings and find qualified candidates with AI-powered matching
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<RocketLaunch />}
              onClick={() => {
                setDialogOpen(true);
                setEditingJob(null);
                setFormData({
                  title: '',
                  company: '',
                  location: '',
                  description: '',
                  requirements: '',
                  salary_min: '',
                  salary_max: '',
                  job_type: 'Full-time',
                  remote: false,
                  apply_url: ''
                });
              }}
              sx={{
                background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)',
                  transform: 'translateY(-1px)'
                },
                px: 3,
                py: 1,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '0.875rem',
                boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)',
                transition: 'all 0.3s ease',
                minWidth: '180px'
              }}
            >
              Post New Job
            </Button>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
              }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Enhanced Stats Overview */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <EnhancedStatCard
                icon={<Business sx={{ fontSize: 24 }} />}
                value={jobs.length}
                label="Active Jobs"
                color="#1D503A"
                trend="+2 this month"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <EnhancedStatCard
                icon={<People sx={{ fontSize: 24 }} />}
                value={totalCandidates}
                label="Total Candidates"
                color="#1976d2"
                trend="AI Matched"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <EnhancedStatCard
                icon={<AutoAwesome sx={{ fontSize: 24 }} />}
                value={`${averageMatchScore}%`}
                label="Avg Match Score"
                color="#ed6c02"
                trend="High Quality"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <EnhancedStatCard
                icon={<Star sx={{ fontSize: 24 }} />}
                value={highQualityCandidates}
                label="Top Candidates"
                color="#2e7d32"
                trend="Score ≥ 80%"
              />
            </Grid>
          </Grid>

          {/* Enhanced Tabs */}
          <Paper sx={{ 
            mb: 3, 
            borderRadius: 2,
            background: 'white',
            boxShadow: '0 2px 8px rgba(29, 80, 58, 0.08)'
          }}>
          
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
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
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business />
                  Job Postings
                  {jobs.length > 0 && (
                    <Chip 
                      label={jobs.length} 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#1D503A', 
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 20
                      }} 
                    />
                  )}
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Psychology />
                  AI Recommendations
                  {totalCandidates > 0 && (
                    <Chip 
                      label={totalCandidates} 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#1976d2', 
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 20
                      }} 
                    />
                  )}
                </Box>
              }
              disabled={jobs.length === 0}
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Work />
                  Applications
                  {applicationsCount > 0 && (
                    <Chip 
                      label={applicationsCount} 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#d32f2f', 
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 20
                      }} 
                    />
                  )}
                </Box>
              }
              disabled={jobs.length === 0}
            />
          </Tabs>
          </Paper>

          {/* Tab Content */}
          {activeTab === 0 && (
            <JobPostingsTab
              jobs={jobs}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreateJob={() => setDialogOpen(true)}
            />
          )}
          
          {activeTab === 2 && (
            <EmployerApplications />
          )}

          {activeTab === 1 && (
            <CandidateRecommendationsTab
              jobs={jobs}
              recommendations={candidateRecommendations}
              loading={candidateLoading}
              onViewCandidate={handleViewCandidate}
              onContactCandidate={handleContactCandidate}
              onDownloadResume={handleDownloadResume}
              onRefresh={handleRefreshRecommendations}
            />
          )}
        </Paper>
      </Fade>

      {/* Enhanced Add/Edit Job Dialog */}
      <JobDialog
        open={dialogOpen}
        editingJob={editingJob}
        formData={formData}
        setFormData={setFormData}
        loading={loading}
        jobTypes={jobTypes}
        onClose={() => {
          setDialogOpen(false);
          setEditingJob(null);
          setError('');
        }}
        onSubmit={handleSubmit}
      />

      {/* Enhanced Candidate Detail Dialog */}
      <CandidateDialog
        open={candidateDialogOpen}
        candidate={selectedCandidate}
        onClose={() => setCandidateDialogOpen(false)}
        onContact={handleContactCandidate}
        onDownloadResume={handleDownloadResume}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

// Enhanced Stat Card Component
const EnhancedStatCard = ({ icon, value, label, color, trend }) => (
  <Card sx={{ 
    textAlign: 'center', 
    p: 2, 
    height: '100%',
    background: `linear-gradient(135deg, ${color}15, ${color}08)`,
    border: `1px solid ${color}20`,
    borderRadius: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 12px ${color}20`
    }
  }}>
    <Box sx={{ 
      color, 
      mb: 1.5,
      display: 'inline-flex',
      p: 1,
      borderRadius: 2,
      background: `linear-gradient(135deg, ${color}20, ${color}10)`
    }}>
      {icon}
    </Box>
    <Typography variant="h4" sx={{ color, fontWeight: 700, mb: 1, fontSize: '1.75rem' }}>
      {value}
    </Typography>
    <Typography variant="h6" sx={{ color: '#484848', fontWeight: 600, mb: 1, fontSize: '0.875rem' }}>
      {label}
    </Typography>
    <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
      {trend}
    </Typography>
  </Card>
);

// Job Postings Tab Component
const JobPostingsTab = ({ jobs, loading, onEdit, onDelete, onCreateJob }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, flexDirection: 'column', gap: 2 }}>
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ color: '#1D503A' }} 
        />
        <Typography variant="h6" sx={{ color: '#1D503A', fontWeight: 500 }}>
          Loading your job postings...
        </Typography>
      </Box>
    );
  }

  if (jobs.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Box
          sx={{
            display: 'inline-flex',
            p: 3,
            mb: 2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #FAF5EE 0%, #f5f0e9 100%)',
            boxShadow: '0 4px 12px rgba(29, 80, 58, 0.1)'
          }}
        >
          <RocketLaunch sx={{ fontSize: 60, color: '#1D503A', opacity: 0.8 }} />
        </Box>
        <Typography variant="h5" sx={{ color: '#1D503A', mb: 1, fontWeight: 600 }}>
          Ready to Hire?
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', mb: 3, fontWeight: 400, maxWidth: 500, mx: 'auto' }}>
          Create your first job posting and let our AI find the perfect candidates for your team
        </Typography>
        <Button
          variant="contained"
          size="medium"
          startIcon={<RocketLaunch />}
          onClick={onCreateJob}
          sx={{
            background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)',
              transform: 'translateY(-1px)'
            },
            px: 4,
            py: 1,
            fontSize: '1rem',
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          Launch Your First Job
        </Button>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {jobs.map((job) => (
        <Grid item xs={12} md={6} lg={4} key={job.id}>
          <EnhancedJobCard job={job} onEdit={onEdit} onDelete={onDelete} />
        </Grid>
      ))}
    </Grid>
  );
};

// Enhanced Job Card Component
const EnhancedJobCard = ({ job, onEdit, onDelete }) => (
  <Card sx={{ 
    height: '100%', 
    transition: 'all 0.3s ease',
    background: 'white',
    border: '1px solid rgba(29, 80, 58, 0.1)',
    borderRadius: 2,
    '&:hover': { 
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(29, 80, 58, 0.15)',
      borderColor: 'rgba(29, 80, 58, 0.2)'
    }
  }}>
    <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ color: '#1D503A', mb: 1.5, fontWeight: 600, lineHeight: 1.3 }}>
          {job.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
          <Business sx={{ fontSize: 16, color: '#666' }} />
          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
            {job.company}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
          <LocationOn sx={{ fontSize: 16, color: '#666' }} />
          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
            {job.location}
          </Typography>
        </Box>

        {job.salary_min && job.salary_max && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <AttachMoney sx={{ fontSize: 16, color: '#666' }} />
            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
              R{job.salary_min.toLocaleString()} - R{job.salary_max.toLocaleString()}
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={job.job_type} 
            size="small" 
            sx={{ 
              backgroundColor: '#1D503A20', 
              color: '#1D503A',
              fontWeight: 600,
              borderRadius: 1
            }} 
          />
          {job.remote && (
            <Chip 
              label="Remote" 
              size="small" 
              sx={{ 
                backgroundColor: '#1976d220', 
                color: '#1976d2',
                fontWeight: 600,
                borderRadius: 1
              }} 
            />
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => onEdit(job)}
          fullWidth
          sx={{
            borderColor: '#1D503A',
            color: '#1D503A',
            fontWeight: 600,
            borderRadius: 1,
            py: 0.5,
            fontSize: '0.75rem',
            '&:hover': {
              borderColor: '#16412e',
              backgroundColor: 'rgba(29, 80, 58, 0.04)'
            }
          }}
        >
          Edit
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={() => onDelete(job.id)}
          fullWidth
          sx={{
            borderRadius: 1,
            py: 0.5,
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          Delete
        </Button>
      </Box>
    </CardContent>
  </Card>
);

// Enhanced Candidate Recommendations Tab Component
const CandidateRecommendationsTab = ({
  jobs,
  recommendations,
  loading,
  onViewCandidate,
  onContactCandidate,
  onDownloadResume,
  onRefresh
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, flexDirection: 'column', gap: 2 }}>
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ color: '#1D503A' }} 
        />
        <Typography variant="h6" sx={{ color: '#1D503A', fontWeight: 500 }}>
          AI is finding your perfect candidates...
        </Typography>
      </Box>
    );
  }

  const hasRecommendations = Object.values(recommendations).some(arr => arr?.length > 0);

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        p: 2,
        background: 'linear-gradient(135deg, #FAF5EE 0%, #f5f0e9 100%)',
        borderRadius: 2,
        border: '1px solid rgba(29, 80, 58, 0.1)'
      }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#1D503A', fontWeight: 600, mb: 0.5 }}>
            AI-Powered Candidate Matches
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Smart recommendations based on skills, experience, and job requirements
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AutoAwesome />}
          onClick={onRefresh}
          sx={{
            background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)',
              transform: 'translateY(-1px)'
            },
            px: 2,
            py: 1,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          Refresh AI Matches
        </Button>
      </Box>

      {!hasRecommendations ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Box
            sx={{
              display: 'inline-flex',
              p: 3,
              mb: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #FAF5EE 0%, #f5f0e9 100%)',
              boxShadow: '0 4px 12px rgba(29, 80, 58, 0.1)'
            }}
          >
            <Psychology sx={{ fontSize: 60, color: '#1D503A', opacity: 0.8 }} />
          </Box>
          <Typography variant="h5" sx={{ color: '#1D503A', mb: 1, fontWeight: 600 }}>
            No Candidate Matches Yet
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 3, fontWeight: 400 }}>
            Our AI is analyzing resumes and will provide matches soon
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {jobs.map((job) => (
            recommendations[job.id]?.length > 0 && (
              <Grid item xs={12} key={job.id}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  background: 'white',
                  boxShadow: '0 4px 12px rgba(29, 80, 58, 0.1)',
                  border: '1px solid rgba(29, 80, 58, 0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: '#1D503A', 
                      width: 48, 
                      height: 48,
                      boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)'
                    }}>
                      <Work />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#1D503A', fontWeight: 600 }}>
                        {job.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                        {job.company} • {job.location}
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    {recommendations[job.id].map((candidate, index) => (
                      <Grid item xs={12} md={6} lg={4} key={candidate.candidate?.user_id || index}>
                        <EnhancedCandidateCard
                          candidate={candidate}
                          onView={() => onViewCandidate(candidate)}
                          onContact={() => onContactCandidate(candidate)}
                          onDownloadResume={() => onDownloadResume(candidate)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            )
          ))}
        </Grid>
      )}
    </Box>
  );
};

// Enhanced Candidate Card Component
const EnhancedCandidateCard = ({ candidate, onView, onContact, onDownloadResume }) => {
  const matchScore = candidate.score || 0;
  const candidateData = candidate.candidate || {};

  const getScoreColor = (score) => {
    if (score >= 80) return '#2e7d32';
    if (score >= 60) return '#ed6c02';
    return '#d32f2f';
  };

  return (
    <Card sx={{ 
      height: '100%', 
      transition: 'all 0.3s ease',
      background: 'white',
      border: '1px solid rgba(29, 80, 58, 0.1)',
      borderRadius: 2,
      '&:hover': { 
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(29, 80, 58, 0.15)',
        borderColor: 'rgba(29, 80, 58, 0.2)'
      }
    }}>
      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header with Avatar and Score */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, gap: 1.5 }}>
          <Avatar sx={{ 
            bgcolor: '#1D503A', 
            width: 48, 
            height: 48,
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)'
          }}>
            {candidateData.full_name?.[0]?.toUpperCase() || 'C'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.2, fontSize: '0.875rem' }}>
              {candidateData.full_name || 'Unknown Candidate'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ 
                width: 6, 
                height: 6, 
                borderRadius: '50%', 
                backgroundColor: getScoreColor(matchScore) 
              }} />
              <Typography variant="body2" sx={{ color: getScoreColor(matchScore), fontWeight: 600, fontSize: '0.75rem' }}>
                {matchScore}% Match
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Contact Info */}
        {candidateData.email && (
          <Typography variant="body2" sx={{ color: '#666', mb: 1.5, fontWeight: 500, fontSize: '0.75rem' }}>
            {candidateData.email}
          </Typography>
        )}

        {/* Skills Preview */}
        {candidate.relevance?.matching_skills?.length > 0 && (
          <Box sx={{ mb: 2, flexGrow: 1 }}>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
              Top Matching Skills:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {candidate.relevance.matching_skills.slice(0, 3).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  sx={{ 
                    backgroundColor: '#1D503A20', 
                    color: '#1D503A',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    borderRadius: 1,
                    height: 20
                  }}
                />
              ))}
              {candidate.relevance.matching_skills.length > 3 && (
                <Chip
                  label={`+${candidate.relevance.matching_skills.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: '#1D503A', 
                    color: '#1D503A',
                    fontSize: '0.65rem',
                    borderRadius: 1,
                    height: 20
                  }}
                />
              )}
            </Box>
          </Box>
        )}

        {/* Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#1D503A', fontWeight: 700, fontSize: '0.875rem' }}>
              {candidate.relevance?.total_skills_matched || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
              Skills Match
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#1D503A', fontWeight: 700, fontSize: '0.875rem' }}>
              {candidate.relevance?.skill_match_percentage?.toFixed(0) || 0}%
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
              Match Rate
            </Typography>
          </Box>
        </Box>

        {/* Enhanced Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View full profile">
            <IconButton 
              onClick={onView} 
              size="small"
              sx={{
                backgroundColor: '#1D503A10',
                '&:hover': { backgroundColor: '#1D503A20' },
                borderRadius: 1,
                flex: 1
              }}
            >
              <Visibility sx={{ color: '#1D503A', fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Contact candidate">
            <IconButton 
              onClick={onContact} 
              size="small"
              sx={{
                backgroundColor: '#1976d210',
                '&:hover': { backgroundColor: '#1976d220' },
                borderRadius: 1,
                flex: 1
              }}
            >
              <Email sx={{ color: '#1976d2', fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download resume">
            <IconButton 
              onClick={onDownloadResume} 
              size="small"
              disabled={!candidateData.resume_id}
              sx={{
                backgroundColor: '#2e7d3210',
                '&:hover': { backgroundColor: '#2e7d3220' },
                borderRadius: 1,
                flex: 1,
                '&.Mui-disabled': {
                  backgroundColor: '#e0e0e0'
                }
              }}
            >
              <Download sx={{ 
                color: candidateData.resume_id ? '#2e7d32' : '#9e9e9e',
                fontSize: '1rem'
              }} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

// Enhanced Job Dialog Component
const JobDialog = ({ open, editingJob, formData, setFormData, loading, jobTypes, onClose, onSubmit }) => (
  <Dialog 
    open={open} 
    onClose={onClose} 
    maxWidth="md" 
    fullWidth
    TransitionComponent={Slide}
    TransitionProps={{ direction: 'up' }}
  >
    <DialogTitle sx={{ 
      background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
      color: 'white',
      py: 2,
      textAlign: 'center'
    }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
        {editingJob ? 'Edit Job' : 'Create New Job'}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.9 }}>
        {editingJob ? 'Update your job posting details' : 'Fill in the details to attract the best candidates'}
      </Typography>
    </DialogTitle>
    <form onSubmit={onSubmit}>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Job Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              variant="outlined"
              size="small"
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
            <TextField
              fullWidth
              label="Company Name *"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location *"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Job Type *"
              value={formData.job_type}
              onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
            >
              {jobTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.remote}
                  onChange={(e) => setFormData({ ...formData, remote: e.target.checked })}
                  color="primary"
                />
              }
              label="Remote Position"
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Minimum Salary (ZAR)"
              type="number"
              value={formData.salary_min}
              onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
              placeholder="35000"
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Maximum Salary (ZAR)"
              type="number"
              value={formData.salary_max}
              onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
              placeholder="55000"
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Job Description *"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Requirements *"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              required
              placeholder="List the required skills, experience, and qualifications..."
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Application URL"
              value={formData.apply_url}
              onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })}
              placeholder="https://yourcompany.com/apply"
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          size="small"
          sx={{ 
            borderRadius: 1,
            px: 3,
            borderColor: '#666',
            color: '#666',
            fontWeight: 600
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          size="small"
          startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <RocketLaunch />}
          sx={{
            background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)',
              transform: 'translateY(-1px)'
            },
            px: 4,
            py: 1,
            borderRadius: 1,
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)',
            transition: 'all 0.3s ease',
          }}
        >
          {loading ? 'Saving...' : editingJob ? 'Update Job' : 'Create Job'}
        </Button>
      </DialogActions>
    </form>
  </Dialog>
);

// Enhanced Candidate Dialog Component
const CandidateDialog = ({ open, candidate, onClose, onContact, onDownloadResume }) => {
  if (!candidate) return null;

  const candidateData = candidate.candidate || {};
  const relevance = candidate.relevance || {};

  const getScoreColor = (score) => {
    if (score >= 80) return '#2e7d32';
    if (score >= 60) return '#ed6c02';
    return '#d32f2f';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
        color: 'white',
        py: 2,
        textAlign: 'center'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          Candidate Profile
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Detailed candidate information and match analysis
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: '#1D503A', 
            width: 64, 
            height: 64,
            fontSize: '1.5rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(29, 80, 58, 0.3)'
          }}>
            {candidateData.full_name?.[0]?.toUpperCase() || 'C'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              {candidateData.full_name || 'Unknown Candidate'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', fontWeight: 500 }}>
              {candidateData.email}
            </Typography>
            {candidateData.phone && (
              <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                {candidateData.phone}
              </Typography>
            )}
          </Box>
          <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, background: `linear-gradient(135deg, ${getScoreColor(candidate.score)}20, ${getScoreColor(candidate.score)}10)` }}>
            <Typography variant="h4" sx={{ color: getScoreColor(candidate.score), fontWeight: 700, lineHeight: 1 }}>
              {candidate.score}%
            </Typography>
            <Typography variant="caption" sx={{ color: getScoreColor(candidate.score), fontWeight: 600 }}>
              Match Score
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Skills Section */}
        {relevance.matching_skills?.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1D503A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Bolt /> Matching Skills ({relevance.total_skills_matched})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {relevance.matching_skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  sx={{ 
                    backgroundColor: '#1D503A20', 
                    color: '#1D503A',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    py: 1.5,
                    borderRadius: 1
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Enhanced Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, background: 'linear-gradient(135deg, #1D503A10, #1D503A05)' }}>
              <Typography variant="h4" sx={{ color: '#1D503A', fontWeight: 700, mb: 0.5, fontSize: '1.5rem' }}>
                {relevance.skill_match_percentage?.toFixed(1) || 0}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>Skill Match</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, background: 'linear-gradient(135deg, #1976d210, #1976d205)' }}>
              <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 700, mb: 0.5, fontSize: '1.5rem' }}>
                {relevance.resume_skills_count || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>Total Skills</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, background: 'linear-gradient(135deg, #2e7d3210, #2e7d3205)' }}>
              <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 700, mb: 0.5, fontSize: '1.5rem' }}>
                {relevance.total_skills_matched || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>Skills Matched</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, background: 'linear-gradient(135deg, #ed6c0210, #ed6c0205)' }}>
              <Typography variant="h4" sx={{ color: '#ed6c02', fontWeight: 700, mb: 0.5, fontSize: '1.5rem' }}>
                {candidate.score}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>Overall Match</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Resume Info */}
        {candidateData.resume_uploaded && (
          <Box sx={{ mb: 2, p: 1.5, borderRadius: 1, backgroundColor: '#FAF5EE' }}>
            <Typography variant="body2" sx={{ color: '#1D503A', fontWeight: 600 }}>
              Resume uploaded: {new Date(candidateData.resume_uploaded).toLocaleDateString()}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          size="small"
          sx={{ 
            borderRadius: 1,
            px: 3,
            borderColor: '#666',
            color: '#666',
            fontWeight: 600
          }}
        >
          Close
        </Button>
        <Button
          variant="outlined"
          onClick={() => onDownloadResume(candidate)}
          disabled={!candidateData.resume_id}
          startIcon={<Download />}
          size="small"
          sx={{
            borderRadius: 1,
            px: 3,
            borderColor: '#2e7d32',
            color: '#2e7d32',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#2e7d3208'
            }
          }}
        >
          Download Resume
        </Button>
        <Button
          variant="contained"
          onClick={() => onContact(candidate)}
          startIcon={<Email />}
          size="small"
          sx={{
            background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)',
              transform: 'translateY(-1px)'
            },
            px: 3,
            borderRadius: 1,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          Contact Candidate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployerDashboard;
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
  Snackbar
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
  GitHub
} from '@mui/icons-material';
import { jobsAPI } from '../api/jobs';
import { employerAPI } from '../api/employer';

const EmployerDashboard = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (editingJob) {
        await jobsAPI.updateJob(editingJob.id, formData);
        showSnackbar('Job updated successfully');
      } else {
        await jobsAPI.createJob(formData);
        showSnackbar('Job created successfully');
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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#1D503A', mb: 1, fontWeight: 'bold' }}>
              Employer Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Manage your job postings and find qualified candidates
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
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
              backgroundColor: '#1D503A',
              '&:hover': { backgroundColor: '#16412e' },
              px: 3,
              py: 1.5
            }}
          >
            Post New Job
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<Business sx={{ fontSize: 32 }} />}
              value={jobs.length}
              label="Active Jobs"
              color="#1D503A"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<People sx={{ fontSize: 32 }} />}
              value={totalCandidates}
              label="Total Candidates"
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<TrendingUp sx={{ fontSize: 32 }} />}
              value={`${averageMatchScore}%`}
              label="Avg Match Score"
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<Star sx={{ fontSize: 32 }} />}
              value={highQualityCandidates}
              label="Top Candidates"
              color="#2e7d32"
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': { 
                minHeight: 60,
                fontWeight: 600 
              }
            }}
          >
            <Tab label="Job Postings" icon={<Business />} />
            <Tab 
              label="Candidate Recommendations" 
              icon={<People />}
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

      {/* Add/Edit Job Dialog */}
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

      {/* Candidate Detail Dialog */}
      <CandidateDialog
        open={candidateDialogOpen}
        candidate={selectedCandidate}
        onClose={() => setCandidateDialogOpen(false)}
        onContact={handleContactCandidate}
        onDownloadResume={handleDownloadResume}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

// Stat Card Component
const StatCard = ({ icon, value, label, color }) => (
  <Card sx={{ 
    textAlign: 'center', 
    p: 3, 
    height: '100%',
    background: `linear-gradient(135deg, ${color}20, ${color}10)`,
    border: `1px solid ${color}30`
  }}>
    <Box sx={{ color, mb: 1 }}>{icon}</Box>
    <Typography variant="h4" sx={{ color, fontWeight: 'bold', mb: 1 }}>
      {value}
    </Typography>
    <Typography variant="body2" sx={{ color: '#666' }}>
      {label}
    </Typography>
  </Card>
);

// Job Postings Tab Component
const JobPostingsTab = ({ jobs, loading, onEdit, onDelete, onCreateJob }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (jobs.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Business sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#666', mb: 2, fontWeight: 'medium' }}>
          No job postings yet
        </Typography>
        <Typography variant="body2" sx={{ color: '#999', mb: 4 }}>
          Create your first job posting to start attracting qualified candidates
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={onCreateJob}
          sx={{
            backgroundColor: '#1D503A',
            '&:hover': { backgroundColor: '#16412e' },
            px: 4,
            py: 1.5
          }}
        >
          Create Your First Job
        </Button>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {jobs.map((job) => (
        <Grid item xs={12} md={6} lg={4} key={job.id}>
          <JobCard job={job} onEdit={onEdit} onDelete={onDelete} />
        </Grid>
      ))}
    </Grid>
  );
};

// Job Card Component
const JobCard = ({ job, onEdit, onDelete }) => (
  <Card sx={{ 
    height: '100%', 
    transition: 'all 0.3s ease',
    '&:hover': { 
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
    }
  }}>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: '#1D503A', mb: 2, fontWeight: 'bold' }}>
        {job.title}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <Business sx={{ fontSize: 16, color: '#666' }} />
        <Typography variant="body2" sx={{ color: '#666' }}>
          {job.company}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <LocationOn sx={{ fontSize: 16, color: '#666' }} />
        <Typography variant="body2" sx={{ color: '#666' }}>
          {job.location}
        </Typography>
      </Box>

      {job.salary_min && job.salary_max && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <AttachMoney sx={{ fontSize: 16, color: '#666' }} />
          <Typography variant="body2" sx={{ color: '#666' }}>
            R{job.salary_min.toLocaleString()} - R{job.salary_max.toLocaleString()}
          </Typography>
        </Box>
      )}

      <Box sx={{ mb: 3 }}>
        <Chip 
          label={job.job_type} 
          size="small" 
          sx={{ 
            backgroundColor: '#1D503A20', 
            color: '#1D503A',
            fontWeight: 'medium'
          }} 
        />
        {job.remote && (
          <Chip 
            label="Remote" 
            size="small" 
            sx={{ 
              ml: 1,
              backgroundColor: '#1976d220', 
              color: '#1976d2',
              fontWeight: 'medium'
            }} 
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => onEdit(job)}
          fullWidth
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
        >
          Delete
        </Button>
      </Box>
    </CardContent>
  </Card>
);

// Candidate Recommendations Tab Component
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
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const hasRecommendations = Object.values(recommendations).some(arr => arr?.length > 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ color: '#1D503A' }}>
          AI-Powered Candidate Matches
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={onRefresh}
          size="small"
        >
          Refresh Matches
        </Button>
      </Box>

      {!hasRecommendations ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <People sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
            No candidate recommendations yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#999' }}>
            Our AI is analyzing resumes and will provide matches soon
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {jobs.map((job) => (
            recommendations[job.id]?.length > 0 && (
              <Grid item xs={12} key={job.id}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#1D503A' }}>
                      <Work />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#1D503A' }}>
                        {job.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {job.company} • {job.location}
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    {recommendations[job.id].map((candidate, index) => (
                      <Grid item xs={12} md={6} lg={4} key={candidate.candidate?.user_id || index}>
                        <CandidateCard
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

// Candidate Card Component (Improved)
const CandidateCard = ({ candidate, onView, onContact, onDownloadResume }) => {
  const matchScore = candidate.score || 0;
  const candidateData = candidate.candidate || {};

  return (
    <Card sx={{ 
      height: '100%', 
      transition: 'all 0.3s ease',
      '&:hover': { 
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header with Avatar and Score */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Avatar sx={{ bgcolor: '#1D503A', width: 48, height: 48 }}>
            {candidateData.full_name?.[0]?.toUpperCase() || 'C'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {candidateData.full_name || 'Unknown Candidate'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating value={matchScore / 20} precision={0.5} readOnly size="small" />
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 'bold' }}>
                {matchScore}%
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Contact Info */}
        {candidateData.email && (
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            📧 {candidateData.email}
          </Typography>
        )}

        {/* Skills Preview */}
        {candidate.relevance?.matching_skills?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 'medium' }}>
              Top Skills:
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {candidate.relevance.matching_skills.slice(0, 4).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  sx={{ 
                    backgroundColor: '#1D503A20', 
                    color: '#1D503A',
                    fontSize: '0.7rem'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Typography variant="caption" sx={{ color: '#666' }}>
            🎯 {candidate.relevance?.total_skills_matched || 0} skills match
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            ⭐ {candidate.relevance?.skill_match_percentage?.toFixed(1) || 0}% match
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View candidate details">
            <IconButton onClick={onView} size="small">
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Contact candidate">
            <IconButton onClick={onContact} size="small" color="primary">
              <Email />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download resume">
            <IconButton 
              onClick={onDownloadResume} 
              size="small"
              disabled={!candidateData.resume_id}
            >
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

// Job Dialog Component (Improved)
const JobDialog = ({ open, editingJob, formData, setFormData, loading, jobTypes, onClose, onSubmit }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle sx={{ 
      backgroundColor: '#1D503A', 
      color: 'white',
      fontWeight: 'bold'
    }}>
      {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
    </DialogTitle>
    <form onSubmit={onSubmit}>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Job Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              variant="outlined"
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
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Job Description *"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Requirements *"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              required
              placeholder="List the required skills, experience, and qualifications..."
              variant="outlined"
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
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          sx={{
            backgroundColor: '#1D503A',
            '&:hover': { backgroundColor: '#16412e' },
            px: 4
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : editingJob ? (
            'Update Job'
          ) : (
            'Create Job'
          )}
        </Button>
      </DialogActions>
    </form>
  </Dialog>
);

// Candidate Dialog Component (Improved)
const CandidateDialog = ({ open, candidate, onClose, onContact, onDownloadResume }) => {
  if (!candidate) return null;

  const candidateData = candidate.candidate || {};
  const relevance = candidate.relevance || {};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        backgroundColor: '#1D503A', 
        color: 'white',
        fontWeight: 'bold'
      }}>
        Candidate Profile
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: '#1D503A', 
            width: 64, 
            height: 64,
            fontSize: '1.5rem'
          }}>
            {candidateData.full_name?.[0]?.toUpperCase() || 'C'}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {candidateData.full_name || 'Unknown Candidate'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              {candidateData.email}
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: '#1D503A', fontWeight: 'bold' }}>
              {candidate.score}%
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Match Score
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Skills Section */}
        {relevance.matching_skills?.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1D503A' }}>
              Matching Skills ({relevance.total_skills_matched})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {relevance.matching_skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  sx={{ 
                    backgroundColor: '#1D503A20', 
                    color: '#1D503A',
                    fontWeight: 'medium'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#1D503A' }}>
                {relevance.skill_match_percentage?.toFixed(1) || 0}%
              </Typography>
              <Typography variant="body2">Skill Match</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#1D503A' }}>
                {relevance.resume_skills_count || 0}
              </Typography>
              <Typography variant="body2">Total Skills</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Resume Info */}
        {candidateData.resume_uploaded && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              📄 Resume uploaded: {new Date(candidateData.resume_uploaded).toLocaleDateString()}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="outlined"
          onClick={() => onDownloadResume(candidate)}
          disabled={!candidateData.resume_id}
          startIcon={<Download />}
        >
          Download Resume
        </Button>
        <Button
          variant="contained"
          onClick={() => onContact(candidate)}
          startIcon={<Email />}
          sx={{
            backgroundColor: '#1D503A',
            '&:hover': { backgroundColor: '#16412e' }
          }}
        >
          Contact Candidate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployerDashboard;
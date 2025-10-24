import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Tab,
  Tabs,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Business,
  Person,
  Email,
  Schedule,
  Download,
  Visibility,
  Work,
  LocationOn,
  Refresh,
  Phone,
  LinkedIn
} from '@mui/icons-material';
import { employerApplicationsApi } from '../api/employerApplications';
import { jobsAPI } from '../api/jobs';

const EmployerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const statusColors = {
    pending: 'default',
    reviewed: 'primary',
    interviewing: 'warning',
    rejected: 'error',
    offered: 'info',
    hired: 'success'
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'default' },
    { value: 'reviewed', label: 'Reviewed', color: 'primary' },
    { value: 'interviewing', label: 'Interviewing', color: 'warning' },
    { value: 'offered', label: 'Offered', color: 'info' },
    { value: 'rejected', label: 'Rejected', color: 'error' },
    { value: 'hired', label: 'Hired', color: 'success' }
  ];

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (selectedJob !== 'all') filters.jobId = selectedJob;
      if (selectedStatus !== 'all') filters.status = selectedStatus;
      
      const applicationsData = await employerApplicationsApi.getApplications(filters);
      setApplications(applicationsData);
    } catch (error) {
      setError('Failed to fetch applications');
      console.error('Fetch applications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await jobsAPI.getEmployerJobs();
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Fetch jobs error:', error);
    }
  };

  const fetchJobStats = async (jobId) => {
    try {
      if (jobId !== 'all') {
        const statsData = await employerApplicationsApi.getJobApplicationStats(jobId);
        setStats(statsData);
      } else {
        setStats({});
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await employerApplicationsApi.updateApplicationStatus(applicationId, newStatus);
      setSuccess('Application status updated successfully');
      await fetchApplications();
      if (selectedJob !== 'all') {
        await fetchJobStats(selectedJob);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update application status');
    }
  };

  const handleViewApplication = async (applicationId) => {
    try {
      const application = await employerApplicationsApi.getApplication(applicationId);
      setSelectedApplication(application);
      setDetailDialogOpen(true);
    } catch (error) {
      setError('Failed to fetch application details');
    }
  };

  const filteredApplications = applications.filter(app => 
    app.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  useEffect(() => {
    fetchApplications();
    if (selectedJob !== 'all') {
      fetchJobStats(selectedJob);
    } else {
      setStats({});
    }
  }, [selectedJob, selectedStatus]);

  return (
    <Box>
      
        <Typography variant="body1" sx={{ color: 'black', opacity: 0.9 }}>
          Manage and review all applications for your job postings
        </Typography>
      

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job title, company, or status..."
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Job</InputLabel>
              <Select
                value={selectedJob}
                label="Filter by Job"
                onChange={(e) => setSelectedJob(e.target.value)}
              >
                <MenuItem value="all">All Jobs</MenuItem>
                {jobs.map((job) => (
                  <MenuItem key={job.id} value={job.id}>
                    {job.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Filter by Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={option.label} 
                        size="small" 
                        color={option.color}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchApplications}
              disabled={loading}
              fullWidth
              sx={{ 
                height: '40px',
                background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)'
                }
              }}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Overview */}
      {selectedJob !== 'all' && stats.total_applications !== undefined && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #1D503A10, #1D503A05)' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ color: '#1D503A', fontWeight: 700 }}>
                  {stats.total_applications}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                  Total Applications
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {Object.entries(stats.status_breakdown || {}).map(([status, count]) => (
            <Grid item xs={12} sm={6} md={3} key={status}>
              <Card sx={{ background: 'linear-gradient(135deg, #1D503A10, #1D503A05)' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" sx={{ color: '#1D503A', fontWeight: 700 }}>
                    {count}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                    {status}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Applications List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: '#1D503A' }} />
        </Box>
      ) : filteredApplications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Work sx={{ fontSize: 60, color: '#1D503A', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No applications found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {selectedJob === 'all' ? 'You haven\'t received any applications yet.' : 'No applications match your current filters.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredApplications.map((application) => (
            <Grid item xs={12} key={application.id}>
              <ApplicationCard
                application={application}
                onStatusUpdate={handleStatusUpdate}
                onViewApplication={handleViewApplication}
                statusOptions={statusOptions}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Application Detail Dialog */}
      <ApplicationDetailDialog
        open={detailDialogOpen}
        application={selectedApplication}
        onClose={() => setDetailDialogOpen(false)}
        onStatusUpdate={handleStatusUpdate}
        statusOptions={statusOptions}
      />
    </Box>
  );
};

const ApplicationCard = ({ application, onStatusUpdate, onViewApplication, statusOptions }) => {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    await onStatusUpdate(application.id, newStatus);
    setUpdating(false);
  };

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'default';
  };

  return (
    <Card sx={{ 
      '&:hover': { 
        boxShadow: 3,
        transform: 'translateY(-2px)',
        transition: 'all 0.3s ease'
      },
      transition: 'all 0.3s ease'
    }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#1D503A', width: 48, height: 48 }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1D503A' }}>
                  Application #{application.id}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Applied {new Date(application.applied_at).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" fontWeight="medium" sx={{ color: '#1D503A' }}>
                {application.job_title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {application.company_name}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={2}>
            <Chip
              label={application.status}
              color={getStatusColor(application.status)}
              size="small"
              sx={{ fontWeight: 600, textTransform: 'capitalize' }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={application.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updating}
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<Visibility />}
                onClick={() => onViewApplication(application.id)}
                sx={{ 
                  borderColor: '#1D503A',
                  color: '#1D503A',
                  '&:hover': {
                    borderColor: '#16412e',
                    backgroundColor: '#1D503A10'
                  }
                }}
              >
                View Details
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const ApplicationDetailDialog = ({ open, application, onClose, onStatusUpdate, statusOptions }) => {
  const [selectedStatus, setSelectedStatus] = useState(application?.status || '');

  useEffect(() => {
    setSelectedStatus(application?.status || '');
  }, [application]);

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    if (application) {
      onStatusUpdate(application.id, newStatus);
    }
  };

  if (!application) return null;

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'default';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
        color: 'white'
      }}>
        <Typography variant="h5" fontWeight="600">
          Application Details
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Application #{application.id}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Job Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1D503A', fontWeight: 600 }}>
              Job Information
            </Typography>
            <Card variant="outlined" sx={{ p: 2, background: '#FAF5EE' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {application.job_title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {application.company_name}
              </Typography>
            </Card>
          </Grid>

          {/* Application Status */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1D503A', fontWeight: 600 }}>
              Application Status
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={option.label} 
                        size="small" 
                        color={option.color}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Cover Letter */}
          {application.cover_letter && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1D503A', fontWeight: 600 }}>
                Cover Letter
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 200, overflow: 'auto' }}>
                <Typography variant="body2" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {application.cover_letter}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Timeline */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1D503A', fontWeight: 600 }}>
              Application Timeline
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight="medium">
                  Applied:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(application.applied_at).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight="medium">
                  Last Updated:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(application.updated_at).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderColor: '#666',
            color: '#666',
            fontWeight: 600
          }}
        >
          Close
        </Button>
        {application.resume_id && (
          <Button 
            variant="contained" 
            startIcon={<Download />}
            sx={{
              background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)'
              },
              fontWeight: 600
            }}
          >
            Download Resume
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EmployerApplications;
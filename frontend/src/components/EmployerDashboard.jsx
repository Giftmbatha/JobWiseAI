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
  Chip
} from '@mui/material';
import { Add, Edit, Delete, Business } from '@mui/icons-material';
import { jobsAPI } from '../api/jobs';

const EmployerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
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

  const fetchEmployerJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getEmployerJobs();
      setJobs(response.data.jobs);
    } catch (error) {
      setError('Failed to fetch your job postings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingJob) {
        await jobsAPI.updateJob(editingJob.id, formData);
        setSuccess('Job updated successfully');
      } else {
        await jobsAPI.createJob(formData);
        setSuccess('Job created successfully');
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
      setError('Failed to save job: ' + (error.response?.data?.detail || 'Please try again'));
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
      description: job.description,
      requirements: job.requirements,
      salary_min: job.salary_min || '',
      salary_max: job.salary_max || '',
      job_type: job.job_type,
      remote: job.remote,
      apply_url: job.apply_url || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobsAPI.deleteJob(jobId);
        setSuccess('Job deleted successfully');
        fetchEmployerJobs();
      } catch (error) {
        setError('Failed to delete job');
      }
    }
  };

  useEffect(() => {
    fetchEmployerJobs();
  }, []);

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#1D503A', mb: 1 }}>
              Employer Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: '#484848' }}>
              Manage your job postings and find qualified candidates
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            sx={{
              backgroundColor: '#1D503A',
              '&:hover': { backgroundColor: '#16412e' }
            }}
          >
            Post New Job
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {jobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Business sx={{ fontSize: 64, color: '#cccccc', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#484848', mb: 2 }}>
              No job postings yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#484848', mb: 3 }}>
              Create your first job posting to start attracting candidates
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setDialogOpen(true)}
              sx={{
                backgroundColor: '#1D503A',
                '&:hover': { backgroundColor: '#16412e' }
              }}
            >
              Create Your First Job
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {jobs.map((job) => (
              <Grid item xs={12} md={6} key={job.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#1D503A', mb: 1 }}>
                      {job.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#484848', mb: 1 }}>
                      {job.company} • {job.location}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#484848', mb: 2 }}>
                      {job.salary_min && job.salary_max 
                        ? `R${job.salary_min.toLocaleString()} - R${job.salary_max.toLocaleString()}`
                        : 'Salary negotiable'
                      }
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip label={job.job_type} size="small" />
                      {job.remote && <Chip label="Remote" size="small" />}
                      <Chip label={job.source} size="small" variant="outlined" />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => handleEdit(job)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(job.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Add/Edit Job Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Title *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name *"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location *"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Minimum Salary (ZAR)"
                  type="number"
                  value={formData.salary_min}
                  onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                  placeholder="35000"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Maximum Salary (ZAR)"
                  type="number"
                  value={formData.salary_max}
                  onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                  placeholder="55000"
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
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Application URL"
                  value={formData.apply_url}
                  onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })}
                  placeholder="https://yourcompany.com/apply"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving...' : (editingJob ? 'Update Job' : 'Create Job')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default EmployerDashboard;
// src/components/JobsList.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Pagination,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Business,
  LocationOn,
  AttachMoney,
  Schedule,
  Search
} from '@mui/icons-material';
import { jobsAPI } from '../api/jobs';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [fetchExternal, setFetchExternal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 9,
    totalCount: 0,
    totalPages: 0
  });

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      console.log('🔄 Fetching jobs with params:', {
        page,
        pageSize: pagination.pageSize,
        searchTerm,
        location,
        fetchExternal
      });
      
      const response = await jobsAPI.getJobs(page, pagination.pageSize, searchTerm, location, fetchExternal);
      
      console.log('✅ Jobs API response:', {
        data: response.data,
        jobsCount: response.data.jobs?.length,
        totalCount: response.data.total_count
      });
      
      setJobs(response.data.jobs || []);
      setPagination(prev => ({
        ...prev,
        page: response.data.page,
        totalCount: response.data.total_count,
        totalPages: Math.ceil(response.data.total_count / pagination.pageSize)
      }));
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const handlePageChange = (event, value) => {
    fetchJobs(value);
  };

  useEffect(() => {
    fetchJobs(1);
  }, []);

  const JobCard = ({ job }) => (
    <Card sx={{ 
      height: '100%', 
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      },
      border: '1px solid #e0e0e0',
      borderRadius: 2,
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: '#1D503A', mb: 1, fontWeight: 'bold' }}>
          {job.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Business sx={{ fontSize: 16, color: '#484848', mr: 1 }} />
          <Typography variant="body2" sx={{ color: '#484848' }}>
            {job.company}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn sx={{ fontSize: 16, color: '#484848', mr: 1 }} />
          <Typography variant="body2" sx={{ color: '#484848' }}>
            {job.location}
          </Typography>
        </Box>

        {(job.salary_min || job.salary_max) && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AttachMoney sx={{ fontSize: 16, color: '#484848', mr: 1 }} />
            <Typography variant="body2" sx={{ color: '#484848' }}>
              {job.salary_min && job.salary_max 
                ? `R${job.salary_min.toLocaleString()} - R${job.salary_max.toLocaleString()}`
                : job.salary_min 
                  ? `From R${job.salary_min.toLocaleString()}`
                  : `Up to R${job.salary_max.toLocaleString()}`
              }
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Schedule sx={{ fontSize: 16, color: '#484848', mr: 1 }} />
          <Typography variant="body2" sx={{ color: '#484848' }}>
            {job.job_type}
            {job.remote && ' • Remote'}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ 
          color: '#484848', 
          mb: 2, 
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {job.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            label={job.source?.toUpperCase() || 'INTERNAL'}
            size="small"
            sx={{
              backgroundColor: job.source === 'internal' ? '#1D503A' : '#1976d2',
              color: 'white',
              fontSize: '0.7rem',
            }}
          />
          <Button
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#1D503A',
              '&:hover': { backgroundColor: '#16412e' },
              borderRadius: 1,
              fontWeight: 'bold',
            }}
            onClick={() => window.open(job.apply_url || '#', '_blank')}
          >
            Apply Now
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading && jobs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#1D503A' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#1D503A' }}>
          Find Your Dream Job
        </Typography>
        
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Job title, skills, or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: '#1D503A', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Location (e.g., Johannesburg)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                InputProps={{
                  startAdornment: <LocationOn sx={{ color: '#1D503A', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={fetchExternal}
                    onChange={(e) => setFetchExternal(e.target.checked)}
                    sx={{ color: '#1D503A' }}
                  />
                }
                label="Search Adzuna"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: '#1D503A',
                  '&:hover': { backgroundColor: '#16412e' },
                  height: '56px',
                  borderRadius: 1,
                  fontWeight: 'bold',
                }}
              >
                Search Jobs
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="body2" sx={{ color: '#484848' }}>
          {pagination.totalCount} jobs found
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Jobs Grid */}
      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid item xs={12} md={6} lg={4} key={job.id}>
            <JobCard job={job} />
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#1D503A',
                '&.Mui-selected': {
                  backgroundColor: '#1D503A',
                  color: 'white',
                },
              },
            }}
          />
        </Box>
      )}

      {jobs.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: '#484848', mb: 2 }}>
            No jobs found matching your criteria
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setSearchTerm('');
              setLocation('');
              setFetchExternal(false);
              fetchJobs(1);
            }}
            sx={{
              backgroundColor: '#1D503A',
              '&:hover': { backgroundColor: '#16412e' }
            }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default JobsList;
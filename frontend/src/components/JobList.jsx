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
  Checkbox,
  Tooltip,
  alpha,
  Fade,
  InputAdornment,
  Divider,
  Avatar,
  Rating
} from '@mui/material';
import {
  Business,
  LocationOn,
  AttachMoney,
  Schedule,
  Search,
  OpenInNew,
  TrendingUp,
  AutoAwesome,
  FilterList,
  Clear,
  Work,
  Star,
  Bolt,
  Public
} from '@mui/icons-material';
import { jobsAPI } from '../api/jobs';

const JobsList = ({ onApplyClick }) => {
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
      const response = await jobsAPI.getJobs(page, pagination.pageSize, searchTerm, location, fetchExternal);
      setJobs(response.data.jobs || []);
      setPagination(prev => ({
        ...prev,
        page: response.data.page,
        totalCount: response.data.total_count,
        totalPages: Math.ceil(response.data.total_count / pagination.pageSize)
      }));
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocation('');
    setFetchExternal(false);
    fetchJobs(1);
  };

  const handlePageChange = (event, value) => {
    fetchJobs(value);
  };

  useEffect(() => {
    fetchJobs(1);
  }, []);

  const getJobBadge = (job) => {
    if (!job.is_external) return { label: 'Internal', color: 'success', icon: <Star /> };
    if (job.source === 'adzuna') return { label: 'Adzuna', color: 'info', icon: <Public /> };
    return { label: 'External', color: 'default', icon: <OpenInNew /> };
  };

  const handleJobAction = (job) => {
    if (job.is_external && job.apply_url) {
      window.open(job.apply_url, '_blank', 'noopener,noreferrer');
    } else if (job.is_external && !job.apply_url) {
      alert('This is an external job. Please visit the company website to apply.');
    } else {
      onApplyClick(job);
    }
  };

  const getActionButtonText = (job) => {
    if (job.is_external && job.apply_url) return 'Apply Externally';
    if (job.is_external && !job.apply_url) return 'External Job';
    return 'Apply Now';
  };

  const getActionButtonVariant = (job) => {
    if (job.is_external && !job.apply_url) return 'outlined';
    return 'contained';
  };

  const isActionDisabled = (job) => {
    return job.is_external && !job.apply_url;
  };

  const JobCard = ({ job }) => {
    const badge = getJobBadge(job);
    
    return (
      <Fade in={true} timeout={800}>
        <Card sx={{ 
          height: '100%', 
          transition: 'all 0.3s ease',
          background: 'white',
          border: '1px solid rgba(29, 80, 58, 0.1)',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(29, 80, 58, 0.15)',
            borderColor: 'rgba(29, 80, 58, 0.2)'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #1D503A 0%, #2a6b4f 100%)'
          }
        }}>
          <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header with Badge */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Chip 
                icon={badge.icon}
                label={badge.label} 
                color={badge.color} 
                size="small" 
                sx={{ 
                  fontWeight: 600,
                  borderRadius: 1
                }}
              />
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
                {new Date(job.created_at).toLocaleDateString()}
              </Typography>
            </Box>

            {/* Job Title */}
            <Typography variant="h6" sx={{ 
              color: '#1D503A', 
              mb: 1.5, 
              fontWeight: 600,
              lineHeight: 1.3,
              minHeight: '2.6em'
            }}>
              {job.title}
            </Typography>
            
            {/* Company & Location */}
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Business sx={{ fontSize: 16, color: '#666', mr: 1 }} />
                <Typography variant="body1" sx={{ color: '#484848', fontWeight: 600 }}>
                  {job.company}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ fontSize: 16, color: '#666', mr: 1 }} />
                <Typography variant="body1" sx={{ color: '#484848', fontWeight: 500 }}>
                  {job.location}
                </Typography>
              </Box>
            </Box>

            {/* Salary */}
            {(job.salary_min || job.salary_max) && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1.5,
                p: 1,
                borderRadius: 1,
                backgroundColor: '#2e7d3210',
                border: '1px solid rgba(46, 125, 50, 0.1)'
              }}>
                <AttachMoney sx={{ fontSize: 18, color: '#2e7d32', mr: 1 }} />
                <Typography variant="subtitle1" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                  {job.salary_min && job.salary_max 
                    ? `R${job.salary_min.toLocaleString()} - R${job.salary_max.toLocaleString()}`
                    : job.salary_min 
                      ? `From R${job.salary_min.toLocaleString()}`
                      : `Up to R${job.salary_max.toLocaleString()}`
                  }
                </Typography>
              </Box>
            )}

            {/* Job Type & Remote */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={job.job_type} 
                size="small"
                sx={{ 
                  backgroundColor: '#1D503A20', 
                  color: '#1D503A',
                  fontWeight: 500,
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
                    fontWeight: 500,
                    borderRadius: 1
                  }} 
                />
              )}
            </Box>

            {/* Description */}
            <Box sx={{ flexGrow: 1, mb: 2 }}>
              <Typography variant="body2" sx={{ 
                color: '#484848', 
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {job.description || 'No description available'}
              </Typography>
            </Box>

            {/* Action Button */}
            <Tooltip 
              title={isActionDisabled(job) ? "This external job doesn't have an apply link" : ""}
            >
              <span>
                <Button
                  variant={getActionButtonVariant(job)}
                  size="small"
                  fullWidth
                  sx={{
                    background: job.is_external ? 
                      'linear-gradient(135deg, #1976d2, #2196f3)' : 
                      'linear-gradient(135deg, #1D503A, #2a6b4f)',
                    '&:hover': { 
                      background: job.is_external ? 
                        'linear-gradient(135deg, #1565c0, #1976d2)' : 
                        'linear-gradient(135deg, #16412e, #1D503A)',
                      transform: 'translateY(-1px)'
                    },
                    '&:disabled': {
                      background: '#f5f5f5',
                      color: '#999',
                      borderColor: '#ddd'
                    },
                    borderRadius: 1,
                    fontWeight: 600,
                    py: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => handleJobAction(job)}
                  disabled={isActionDisabled(job)}
                  endIcon={job.is_external && job.apply_url ? <OpenInNew /> : null}
                >
                  {getActionButtonText(job)}
                </Button>
              </span>
            </Tooltip>
          </CardContent>
        </Card>
      </Fade>
    );
  };

  if (loading && jobs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, flexDirection: 'column', gap: 2 }}>
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ color: '#1D503A' }} 
        />
        <Typography variant="h6" sx={{ color: '#1D503A', fontWeight: 600 }}>
          Finding amazing jobs for you...
        </Typography>
      </Box>
    );
  }

  const hasActiveFilters = searchTerm || location || fetchExternal;

  return (
    <Box>
      {/* Enhanced Search Header */}
      <Paper sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: 2,
        background: 'white',
        boxShadow: '0 4px 12px rgba(29, 80, 58, 0.1)',
        border: '1px solid rgba(29, 80, 58, 0.08)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{
            p: 1,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1D503A, #2a6b4f)',
            color: 'white'
          }}>
            <Work sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ 
              color: '#1D503A', 
              fontWeight: 700,
              mb: 0.5
            }}>
              Discover Your Next Opportunity
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', fontWeight: 400 }}>
              Find jobs that match your skills and aspirations
            </Typography>
          </Box>
        </Box>
        
        <Box component="form" onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Job title, skills, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#1D503A' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: 'white',
                    '&:hover fieldset': {
                      borderColor: '#1D503A',
                    },
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ color: '#1D503A' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: 'white',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={fetchExternal}
                    onChange={(e) => setFetchExternal(e.target.checked)}
                    icon={<Public />}
                    checkedIcon={<Public sx={{ color: '#1976d2' }} />}
                    sx={{ 
                      color: '#1D503A',
                      '&.Mui-checked': {
                        color: '#1976d2',
                      }
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Public />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Include Adzuna Jobs
                    </Typography>
                  </Box>
                }
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                startIcon={<Search />}
                sx={{
                  background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)',
                    transform: 'translateY(-1px)'
                  },
                  height: '48px',
                  borderRadius: 1,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                Search
              </Button>
            </Grid>
          </Grid>

          {/* Active Filters Bar */}
          {hasActiveFilters && (
            <Fade in={hasActiveFilters}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, p: 1.5, backgroundColor: '#FAF5EE', borderRadius: 1 }}>
                <FilterList sx={{ color: '#1D503A' }} />
                <Typography variant="body2" sx={{ color: '#1D503A', fontWeight: 600 }}>
                  Active Filters:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {searchTerm && (
                    <Chip 
                      label={`Search: ${searchTerm}`} 
                      size="small" 
                      onDelete={() => setSearchTerm('')}
                      sx={{ backgroundColor: '#1D503A20', color: '#1D503A' }}
                    />
                  )}
                  {location && (
                    <Chip 
                      label={`Location: ${location}`} 
                      size="small" 
                      onDelete={() => setLocation('')}
                      sx={{ backgroundColor: '#1976d220', color: '#1976d2' }}
                    />
                  )}
                  {fetchExternal && (
                    <Chip 
                      label="Adzuna Jobs" 
                      size="small" 
                      onDelete={() => setFetchExternal(false)}
                      sx={{ backgroundColor: '#2e7d3220', color: '#2e7d32' }}
                    />
                  )}
                </Box>
                <Button
                  startIcon={<Clear />}
                  onClick={handleClearFilters}
                  sx={{ 
                    color: '#666',
                    fontWeight: 600,
                    ml: 'auto'
                  }}
                >
                  Clear All
                </Button>
              </Box>
            </Fade>
          )}
        </Box>

        {/* Results Count */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="h6" sx={{ color: '#1D503A', fontWeight: 600 }}>
            {pagination.totalCount.toLocaleString()} Job{pagination.totalCount !== 1 ? 's' : ''} Found
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Page {pagination.page} of {pagination.totalPages}
          </Typography>
        </Box>
      </Paper>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            borderRadius: 2,
          }}
          action={
            <Button color="inherit" size="small" onClick={() => fetchJobs(1)}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Enhanced Jobs Grid */}
      <Grid container spacing={2}>
        {jobs.map((job) => (
          <Grid item xs={12} md={6} lg={4} key={job.id}>
            <JobCard job={job} />
          </Grid>
        ))}
      </Grid>

      {/* Enhanced Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#1D503A',
                fontWeight: 600,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: '#1D503A20',
                },
                '&.Mui-selected': {
                  backgroundColor: '#1D503A',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)',
                  '&:hover': {
                    backgroundColor: '#16412e',
                  },
                },
              },
            }}
          />
        </Box>
      )}

      {jobs.length === 0 && !loading && (
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
            <Work sx={{ fontSize: 60, color: '#1D503A', opacity: 0.8 }} />
          </Box>
          <Typography variant="h5" sx={{ color: '#1D503A', mb: 1, fontWeight: 600 }}>
            No Jobs Found
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 3, fontWeight: 400, maxWidth: 500, mx: 'auto' }}>
            {hasActiveFilters 
              ? "Try adjusting your search criteria or clear filters to see more results"
              : "No jobs are currently available. Check back later for new opportunities"
            }
          </Typography>
          {hasActiveFilters && (
            <Button
              variant="contained"
              onClick={handleClearFilters}
              startIcon={<Clear />}
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
                boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              Clear All Filters
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default JobsList;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Button,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { TrendingUp, Work, Star, OpenInNew, Refresh } from '@mui/icons-material';
import { aiAPI } from '../api/ai';

const AIRecommendations = ({ onApplyClick }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await aiAPI.getRecommendations();
      // Handle both response structures for backward compatibility
      const matches = response.data.recommendations || response.data.matches || [];
      setRecommendations(matches);
    } catch (error) {
      setError('Failed to load recommendations. Please try again.');
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const getJobBadge = (job) => {
    if (!job.is_external) return { label: 'Internal', color: 'success' };
    if (job.source === 'adzuna') return { label: 'Adzuna', color: 'info' };
    return { label: 'External', color: 'default' };
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

  const RecommendationCard = ({ recommendation }) => {
    const job = recommendation.job || recommendation; // Handle both structures
    const matchScore = recommendation.score || 0;
    const rank = recommendation.rank || 1;
    
    const badge = getJobBadge(job);
    
    return (
      <Card sx={{ 
        mb: 2, 
        borderLeft: `4px solid ${matchScore > 80 ? '#2e7d32' : matchScore > 60 ? '#ed6c02' : '#1976d2'}`,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Chip 
                label={badge.label} 
                color={badge.color} 
                size="small" 
                sx={{ mb: 1 }}
              />
              <Typography variant="h6" sx={{ color: '#1D503A', mb: 1, fontWeight: 'bold' }}>
                {job.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#484848', mb: 1 }}>
                {job.company} • {job.location}
              </Typography>
              <Typography variant="body2" sx={{ color: '#484848', mb: 1 }}>
                {job.salary_min && job.salary_max ? 
                  `R${job.salary_min.toLocaleString()} - R${job.salary_max.toLocaleString()}` : 
                  job.salary || 'Salary negotiable'
                }
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right', ml: 2 }}>
              <Chip 
                icon={<Star />}
                label={`${matchScore}% Match`} 
                color={matchScore > 80 ? 'success' : matchScore > 60 ? 'warning' : 'default'}
                sx={{ mb: 1, fontWeight: 'bold' }}
              />
              <Typography variant="caption" sx={{ color: '#484848', display: 'block' }}>
                Rank #{rank}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#484848', lineHeight: 1.6 }}>
              {job.description?.substring(0, 200) || job.summary?.substring(0, 200) || 'No description available'}...
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="outlined" 
              size="small"
              sx={{ 
                borderColor: '#1D503A', 
                color: '#1D503A',
                '&:hover': { borderColor: '#16412e', backgroundColor: '#f5f5f5' }
              }}
            >
              View Details
            </Button>
            <Button 
              variant={getActionButtonVariant(job)}
              size="small" 
              sx={{ 
                backgroundColor: job.is_external ? '#1976d2' : '#1D503A',
                '&:hover': { 
                  backgroundColor: job.is_external ? '#1565c0' : '#16412e' 
                },
                '&:disabled': {
                  backgroundColor: '#f5f5f5',
                  color: '#999'
                }
              }}
              onClick={() => handleJobAction(job)}
              disabled={isActionDisabled(job)}
              endIcon={job.is_external && job.apply_url ? <OpenInNew /> : null}
            >
              {getActionButtonText(job)}
            </Button>
            
            {job.job_type && (
              <Chip 
                label={job.job_type} 
                size="small" 
                variant="outlined"
                sx={{ ml: 'auto' }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingUp sx={{ color: '#1D503A', mr: 2, fontSize: 32 }} />
          <Box>
            <Typography variant="h5" sx={{ color: '#1D503A', fontWeight: 'bold' }}>
              AI-Powered Job Recommendations
            </Typography>
            <Typography variant="body2" sx={{ color: '#484848' }}>
              Matched to your skills and experience
            </Typography>
          </Box>
        </Box>
        
        <Tooltip title="Refresh recommendations">
          <IconButton 
            onClick={fetchRecommendations} 
            disabled={loading}
            sx={{ 
              color: '#1D503A',
              '&:hover': { backgroundColor: '#e8f5e8' }
            }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchRecommendations}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LinearProgress sx={{ mb: 2, color: '#1D503A', height: 6, borderRadius: 3 }} />
          <Typography variant="body2" sx={{ color: '#484848' }}>
            Analyzing your profile and finding the best matches...
          </Typography>
        </Box>
      ) : recommendations.length > 0 ? (
        <Box>
          <Typography variant="subtitle1" sx={{ color: '#484848', mb: 2 }}>
            Found {recommendations.length} matching job{recommendations.length !== 1 ? 's' : ''}
          </Typography>
          {recommendations.map((recommendation, index) => (
            <RecommendationCard key={index} recommendation={recommendation} />
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Work sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#484848', mb: 1, fontWeight: 'medium' }}>
            No recommendations yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#484848', mb: 3, maxWidth: 400, mx: 'auto' }}>
            Upload your resume or update your profile to get personalized AI-powered job matches
          </Typography>
          <Button 
            variant="contained" 
            onClick={fetchRecommendations}
            startIcon={<Refresh />}
            sx={{ 
              backgroundColor: '#1D503A',
              '&:hover': { backgroundColor: '#16412e' },
              px: 3,
              py: 1
            }}
          >
            Refresh Recommendations
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default AIRecommendations;
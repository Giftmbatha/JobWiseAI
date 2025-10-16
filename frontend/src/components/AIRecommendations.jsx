import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  CircularProgress,
  Button,
  Alert,
  IconButton,
  Tooltip,
  Grid,
  alpha,
  Fade,
  Slide,
  Avatar,
  Rating
} from '@mui/material';
import { 
  TrendingUp, 
  Work, 
  Star, 
  OpenInNew, 
  Refresh, 
  AutoAwesome,
  Bolt,
  Psychology,
  LocationOn,
  Business,
  AttachMoney,
  Schedule,
  CheckCircle,
  Lightbulb,
  RocketLaunch
} from '@mui/icons-material';
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
    if (!job.is_external) return { label: 'Internal', color: 'success', icon: <CheckCircle /> };
    if (job.source === 'adzuna') return { label: 'Adzuna', color: 'info', icon: <Business /> };
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

  const getMatchColor = (score) => {
    if (score >= 80) return '#2e7d32';
    if (score >= 60) return '#ed6c02';
    return '#1976d2';
  };

  const getMatchGradient = (score) => {
    if (score >= 80) return 'linear-gradient(135deg, #2e7d32, #4caf50)';
    if (score >= 60) return 'linear-gradient(135deg, #ed6c02, #ff9800)';
    return 'linear-gradient(135deg, #1976d2, #2196f3)';
  };

  const RecommendationCard = ({ recommendation }) => {
    const job = recommendation.job || recommendation; // Handle both structures
    const matchScore = recommendation.score || 0;
    const rank = recommendation.rank || 1;
    
    const badge = getJobBadge(job);
    
    return (
      <Fade in={true} timeout={800}>
        <Card sx={{ 
          mb: 2, 
          borderRadius: 2,
          background: 'white',
          border: `1px solid ${alpha(getMatchColor(matchScore), 0.2)}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 12px ${alpha(getMatchColor(matchScore), 0.15)}`,
            borderColor: alpha(getMatchColor(matchScore), 0.4)
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: getMatchGradient(matchScore)
          }
        }}>
          <CardContent sx={{ p: 2 }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
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
                  <Chip 
                    icon={<Star />}
                    label={`Rank #${rank}`} 
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderColor: '#1D503A',
                      color: '#1D503A',
                      fontWeight: 600,
                      borderRadius: 1
                    }}
                  />
                </Box>
                
                <Typography variant="h6" sx={{ 
                  color: '#1D503A', 
                  mb: 1, 
                  fontWeight: 600,
                  lineHeight: 1.2
                }}>
                  {job.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Business sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="body2" sx={{ color: '#484848', fontWeight: 500 }}>
                      {job.company}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOn sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="body2" sx={{ color: '#484848', fontWeight: 500 }}>
                      {job.location}
                    </Typography>
                  </Box>
                </Box>

                {/* Salary */}
                {job.salary_min && job.salary_max && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                    <AttachMoney sx={{ fontSize: 16, color: '#2e7d32' }} />
                    <Typography variant="subtitle1" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                      R{job.salary_min.toLocaleString()} - R{job.salary_max.toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Match Score */}
              <Box sx={{ 
                textAlign: 'center',
                p: 1.5,
                borderRadius: 2,
                background: getMatchGradient(matchScore),
                color: 'white',
                minWidth: 80,
                boxShadow: `0 2px 8px ${alpha(getMatchColor(matchScore), 0.3)}`
              }}>
                <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1, mb: 0.5 }}>
                  {matchScore}%
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.9 }}>
                  AI Match
                </Typography>
                <Rating 
                  value={matchScore / 20} 
                  precision={0.5} 
                  readOnly 
                  size="small" 
                  sx={{ mt: 0.5, color: 'white' }}
                />
              </Box>
            </Box>
            
            {/* Description */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ 
                color: '#484848', 
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {job.description?.substring(0, 200) || job.summary?.substring(0, 200) || 'No description available'}...
              </Typography>
            </Box>

            {/* Footer Actions */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap',
              gap: 1 
            }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                {job.job_type && (
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
                )}
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
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ 
                    borderColor: '#1D503A', 
                    color: '#1D503A',
                    fontWeight: 500,
                    borderRadius: 1,
                    px: 2,
                    '&:hover': { 
                      borderColor: '#16412e', 
                      backgroundColor: '#1D503A08' 
                    }
                  }}
                >
                  View Details
                </Button>
                <Button 
                  variant={getActionButtonVariant(job)}
                  size="small" 
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
                      color: '#999'
                    },
                    px: 2,
                    borderRadius: 1,
                    fontWeight: 500,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => handleJobAction(job)}
                  disabled={isActionDisabled(job)}
                  endIcon={job.is_external && job.apply_url ? <OpenInNew /> : null}
                >
                  {getActionButtonText(job)}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    );
  };

  return (
    <Paper sx={{ 
      p: 3, 
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1D503A, #2a6b4f)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(29, 80, 58, 0.3)'
          }}>
            <AutoAwesome sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ 
              color: '#1D503A', 
              fontWeight: 700,
              mb: 0.5
            }}>
              AI-Powered Job Recommendations
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#484848', 
              fontWeight: 400,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}>
              <Bolt sx={{ color: '#ed6c02' }} />
              Smart matches based on your skills and experience
            </Typography>
          </Box>
        </Box>
        
        <Tooltip title="Refresh AI recommendations">
          <IconButton 
            onClick={fetchRecommendations} 
            disabled={loading}
            sx={{ 
              p: 1.5,
              background: 'linear-gradient(135deg, #1D503A, #2a6b4f)',
              color: 'white',
              '&:hover': { 
                background: 'linear-gradient(135deg, #16412e, #1D503A)',
                transform: 'rotate(45deg)'
              },
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)'
            }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            borderRadius: 2,
          }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchRecommendations}
              startIcon={<Refresh />}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
            <CircularProgress 
              size={60} 
              thickness={4}
              sx={{ 
                color: '#1D503A',
                animationDuration: '1000ms'
              }} 
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Psychology sx={{ fontSize: 24, color: '#1D503A' }} />
            </Box>
          </Box>
          <Typography variant="h6" sx={{ color: '#1D503A', fontWeight: 600, mb: 1 }}>
            🤖 AI is analyzing your profile...
          </Typography>
          <Typography variant="body2" sx={{ color: '#484848', maxWidth: 400, mx: 'auto' }}>
            Finding the perfect job matches based on your skills, experience, and preferences
          </Typography>
          <LinearProgress 
            sx={{ 
              mt: 2, 
              height: 4, 
              borderRadius: 2, 
              background: 'linear-gradient(90deg, #1D503A20, #1D503A)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #1D503A, #2a6b4f)',
                borderRadius: 2
              }
            }} 
          />
        </Box>
      ) : recommendations.length > 0 ? (
        <Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            p: 2,
            background: 'linear-gradient(135deg, #FAF5EE 0%, #f5f0e9 100%)',
            borderRadius: 2,
            border: '1px solid rgba(29, 80, 58, 0.1)'
          }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#1D503A', fontWeight: 600, mb: 0.5 }}>
                🎯 Personalized Job Matches
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Found {recommendations.length} perfect match{recommendations.length !== 1 ? 'es' : ''} for you
              </Typography>
            </Box>
            <Chip 
              icon={<AutoAwesome />}
              label="AI Powered" 
              sx={{ 
                backgroundColor: '#1D503A',
                color: 'white',
                fontWeight: 500,
              }}
            />
          </Box>
          
          <Grid container spacing={2}>
            {recommendations.map((recommendation, index) => (
              <Grid item xs={12} key={index}>
                <RecommendationCard recommendation={recommendation} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 6 }}>
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
            No Recommendations Yet
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 3, fontWeight: 400, maxWidth: 500, mx: 'auto' }}>
            Upload your resume or update your profile to get personalized AI-powered job matches
          </Typography>
          <Button 
            variant="contained" 
            onClick={fetchRecommendations}
            startIcon={<RocketLaunch />}
            sx={{ 
              background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
              '&:hover': { 
                background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)',
                transform: 'translateY(-1px)'
              },
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 500,
              boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            Find My Matches
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default AIRecommendations;
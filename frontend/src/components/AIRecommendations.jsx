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
  Alert
} from '@mui/material';
import { TrendingUp, Work, Star } from '@mui/icons-material';
import { aiAPI } from '../api/ai';

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await aiAPI.getRecommendations();
      setRecommendations(response.data.matches || []);
    } catch (error) {
      setError('Failed to load recommendations');
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const RecommendationCard = ({ job, match_score, rank }) => (
    <Card sx={{ mb: 2, borderLeft: `4px solid #1D503A` }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#1D503A', mb: 1 }}>
              {job.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#484848', mb: 1 }}>
              {job.company} • {job.location}
            </Typography>
            <Typography variant="body2" sx={{ color: '#484848' }}>
              {job.salary_min && job.salary_max ? 
                `R${job.salary_min.toLocaleString()} - R${job.salary_max.toLocaleString()}` : 
                'Salary negotiable'
              }
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Chip 
              label={`${match_score}% Match`} 
              color={match_score > 80 ? 'success' : match_score > 60 ? 'warning' : 'default'}
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" sx={{ color: '#484848', display: 'block' }}>
              Rank #{rank}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#484848' }}>
            {job.description?.substring(0, 150)}...
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small">
            View Details
          </Button>
          <Button variant="contained" size="small" sx={{ backgroundColor: '#1D503A' }}>
            Apply Now
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LinearProgress sx={{ mb: 2, color: '#1D503A' }} />
          <Typography variant="body2" sx={{ color: '#484848' }}>
            Analyzing your profile and finding the best matches...
          </Typography>
        </Box>
      ) : recommendations.length > 0 ? (
        <Box>
          {recommendations.map((rec, index) => (
            <RecommendationCard key={index} {...rec} />
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Work sx={{ fontSize: 48, color: '#cccccc', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#484848', mb: 1 }}>
            No recommendations yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#484848', mb: 3 }}>
            Upload your resume to get AI-powered job matches
          </Typography>
          <Button 
            variant="contained" 
            onClick={fetchRecommendations}
            sx={{ backgroundColor: '#1D503A' }}
          >
            Refresh Recommendations
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default AIRecommendations;
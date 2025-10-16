import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ApplicationModal from './ApplicationModal';
import { resumesAPI } from '../api/resumes';
import {
  Card,
  CardContent,
  Button,
  Typography,
  Box,
  Chip,
  Tooltip,
  Fade,
  alpha
} from '@mui/material';
import {
  Business,
  LocationOn,
  AttachMoney,
  Schedule,
  OpenInNew,
  Work,
  Star,
  Bolt,
  TrendingUp
} from '@mui/icons-material';

const JobCard = ({ job }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [userResumes, setUserResumes] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // Enhanced job card logic to handle different job types
  const handleApplyClick = async (job) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // For external jobs with apply_url, redirect to external site
    if (job.is_external && job.apply_url) {
      window.open(job.apply_url, '_blank');
      return;
    }

    // For internal jobs, open application modal
    setSelectedJob(job);
    
    try {
      const response = await resumesAPI.getUserResumes();
      const resumes = Array.isArray(response.data) ? response.data : [];
      setUserResumes(resumes);
      setApplicationModalOpen(true);
    } catch (error) {
      console.error('Failed to load resumes:', error);
      alert('Please upload a resume first before applying to jobs.');
    }
  };

  const getJobBadge = (job) => {
    if (!job.is_external) return { label: 'Internal', color: 'success', icon: <Star /> };
    if (job.source === 'adzuna') return { label: 'Adzuna', color: 'info', icon: <TrendingUp /> };
    return { label: 'External', color: 'default', icon: <OpenInNew /> };
  };

  const getActionButton = (job) => {
    const badge = getJobBadge(job);
    
    if (job.is_external && job.apply_url) {
      return {
        variant: 'outlined',
        text: 'Apply Externally',
        icon: <OpenInNew />,
        color: '#1976d2',
        onClick: () => window.open(job.apply_url, '_blank')
      };
    } else if (!job.is_external) {
      return {
        variant: 'contained',
        text: 'Apply Now',
        icon: <Bolt />,
        color: '#1D503A',
        onClick: () => handleApplyClick(job)
      };
    } else {
      return {
        variant: 'outlined',
        text: 'External Job',
        icon: <Work />,
        color: '#666',
        disabled: true,
        onClick: null
      };
    }
  };

  const actionButton = getActionButton(job);
  const badge = getJobBadge(job);

  return (
    <>
      <Fade in={true} timeout={800}>
        <Card sx={{ 
          height: '100%', 
          transition: 'all 0.3s ease',
          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
          border: '1px solid rgba(29, 80, 58, 0.1)',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 16px 40px rgba(29, 80, 58, 0.15)',
            borderColor: 'rgba(29, 80, 58, 0.2)'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: job.is_external ? 
              'linear-gradient(90deg, #1976d2, #2196f3)' : 
              'linear-gradient(90deg, #1D503A, #2a6b4f)'
          }
        }}>
          <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header with Badge */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Chip 
                icon={badge.icon}
                label={badge.label} 
                color={badge.color} 
                size="small" 
                sx={{ 
                  fontWeight: 600,
                  borderRadius: 2
                }}
              />
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
                {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently posted'}
              </Typography>
            </Box>

            {/* Job Title */}
            <Typography variant="h6" sx={{ 
              color: '#1D503A', 
              mb: 2, 
              fontWeight: 700,
              lineHeight: 1.3,
              minHeight: '2.6em'
            }}>
              {job.title}
            </Typography>
            
            {/* Company & Location */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Business sx={{ fontSize: 18, color: '#666', mr: 1.5 }} />
                <Typography variant="body1" sx={{ color: '#484848', fontWeight: 600 }}>
                  {job.company}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ fontSize: 18, color: '#666', mr: 1.5 }} />
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
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: '#2e7d3210',
                border: '1px solid rgba(46, 125, 50, 0.1)'
              }}>
                <AttachMoney sx={{ fontSize: 20, color: '#2e7d32', mr: 1.5 }} />
                <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 700 }}>
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
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              <Chip 
                label={job.job_type || 'Full-time'} 
                size="small"
                sx={{ 
                  backgroundColor: '#1D503A20', 
                  color: '#1D503A',
                  fontWeight: 600,
                  borderRadius: 2
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
                    borderRadius: 2
                  }} 
                />
              )}
              {job.is_external && (
                <Chip 
                  label="External" 
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: '#666',
                    color: '#666',
                    fontWeight: 500,
                    borderRadius: 2
                  }} 
                />
              )}
            </Box>

            {/* Description */}
            <Box sx={{ flexGrow: 1, mb: 3 }}>
              <Typography variant="body2" sx={{ 
                color: '#484848', 
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {job.description || job.summary || 'No description available. Click to learn more about this position.'}
              </Typography>
            </Box>

            {/* Skills Preview */}
            {job.skills && job.skills.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, mb: 1, display: 'block' }}>
                  Key Skills:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {job.skills.slice(0, 3).map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      sx={{
                        backgroundColor: '#1D503A20',
                        color: '#1D503A',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        borderRadius: 1.5
                      }}
                    />
                  ))}
                  {job.skills.length > 3 && (
                    <Chip
                      label={`+${job.skills.length - 3}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: '#1D503A',
                        color: '#1D503A',
                        fontSize: '0.7rem',
                        borderRadius: 1.5
                      }}
                    />
                  )}
                </Box>
              </Box>
            )}

            {/* Action Button */}
            <Tooltip 
              title={
                !job.is_external && !user 
                  ? "Sign in to apply" 
                  : job.is_external && !job.apply_url 
                  ? "This external job doesn't have an apply link"
                  : ""
              }
            >
              <Box>
                <Button
                  variant={actionButton.variant}
                  size="medium"
                  fullWidth
                  startIcon={actionButton.icon}
                  disabled={actionButton.disabled || (!user && !job.is_external)}
                  onClick={actionButton.onClick}
                  sx={{
                    background: actionButton.disabled ? '#f5f5f5' : 
                      actionButton.variant === 'contained' ? 
                      'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)' :
                      `linear-gradient(135deg, ${alpha(actionButton.color, 0.1)} 0%, ${alpha(actionButton.color, 0.05)} 100%)`,
                    color: actionButton.disabled ? '#999' :
                      actionButton.variant === 'contained' ? 'white' : actionButton.color,
                    border: actionButton.variant === 'outlined' ? `1.5px solid ${actionButton.color}` : 'none',
                    '&:hover': actionButton.disabled ? {} : {
                      background: actionButton.variant === 'contained' ? 
                        'linear-gradient(135deg, #16412e 0%, #1D503A 100%)' :
                        `linear-gradient(135deg, ${alpha(actionButton.color, 0.2)} 0%, ${alpha(actionButton.color, 0.1)} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: actionButton.variant === 'contained' ? 
                        '0 8px 25px rgba(29, 80, 58, 0.4)' : 
                        `0 8px 25px ${alpha(actionButton.color, 0.3)}`
                    },
                    borderRadius: 2,
                    fontWeight: 700,
                    py: 1.2,
                    boxShadow: actionButton.variant === 'contained' ? 
                      '0 4px 15px rgba(29, 80, 58, 0.3)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {!user && !job.is_external ? 'Sign In to Apply' : actionButton.text}
                </Button>
              </Box>
            </Tooltip>

            {/* Additional Info */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="caption" sx={{ color: '#666' }}>
                {job.source === 'adzuna' ? 'Via Adzuna' : 'Direct Posting'}
              </Typography>
              
              {job.apply_count >= 0 && (
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
                  {job.apply_count} application{job.apply_count !== 1 ? 's' : ''}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Application Modal */}
      <ApplicationModal
        job={selectedJob}
        open={applicationModalOpen && !!selectedJob}
        onClose={(success) => {
          setApplicationModalOpen(false);
          setSelectedJob(null);
          if (success) {
            // Optional: Add success feedback here
          }
        }}
        userResumes={userResumes}
      />
    </>
  );
};

export default JobCard;
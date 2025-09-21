import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ApplicationModal from './ApplicationModal';
import { resumesAPI } from '../api/resumes';

const JobCard = ({ job }) => {
  const { user } = useAuth();
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [userResumes, setUserResumes] = useState([]);

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
    const resumes = await resumesAPI.getUserResumes();
    setUserResumes(resumes);
    setApplicationModalOpen(true);
  } catch (error) {
    console.error('Failed to load resumes:', error);
    alert('Please upload a resume first before applying to jobs.');
  }
};

// In the job card render method:
{job.is_external && job.apply_url ? (
  <Button 
    variant="outlined" 
    onClick={() => window.open(job.apply_url, '_blank')}
    sx={{ color: '#1D503A', borderColor: '#1D503A' }}
  >
    Apply on External Site
  </Button>
) : !job.is_external ? (
  <Button 
    variant="contained" 
    onClick={() => handleApplyClick(job)}
    sx={{
      backgroundColor: '#1D503A',
      '&:hover': { backgroundColor: '#16412e' }
    }}
  >
    Apply Now
  </Button>
) : (
  <Button 
    variant="outlined" 
    disabled
    sx={{ color: 'text.secondary' }}
  >
    External Job
  </Button>
)}
};
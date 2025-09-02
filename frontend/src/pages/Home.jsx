// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  InputAdornment,
  Alert,
  CircularProgress,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search,
  LocationOn,
  Business,
  AttachMoney,
  Schedule,
  PlayCircle,
  CheckCircle,
  TrendingUp,
  Groups
} from '@mui/icons-material';
import HomeNavbar from '../components/HomeNavbar';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else if (tabValue === 0) {
      navigate('/register');
    } else {
      navigate('/register/employer');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  // Mock job data for demo
  const mockJobs = [
    {
      id: 1,
      title: 'Senior Software Developer',
      company: 'TechCorp SA',
      location: 'Johannesburg',
      salary: 'R60,000 - R80,000',
      type: 'Full-time',
      posted: '2 days ago',
      description: 'Build innovative software solutions with modern technologies.',
      skills: ['React', 'Node.js', 'Python', 'AWS'],
      remote: true
    },
    {
      id: 2,
      title: 'Data Scientist',
      company: 'DataFlow Analytics',
      location: 'Cape Town',
      salary: 'R55,000 - R75,000',
      type: 'Full-time',
      posted: '1 week ago',
      description: 'Analyze complex datasets and build machine learning models.',
      skills: ['Python', 'ML', 'SQL', 'TensorFlow'],
      remote: false
    },
    {
      id: 3,
      title: 'UX/UI Designer',
      company: 'CreativeMinds',
      location: 'Remote',
      salary: 'R45,000 - R65,000',
      type: 'Contract',
      posted: '3 days ago',
      description: 'Design beautiful user interfaces for digital products.',
      skills: ['Figma', 'UI/UX', 'Prototyping'],
      remote: true
    }
  ];

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
            {job.remote && ' • Remote'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AttachMoney sx={{ fontSize: 16, color: '#484848', mr: 1 }} />
          <Typography variant="body2" sx={{ color: '#484848' }}>
            {job.salary}
          </Typography>
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
            <Schedule sx={{ fontSize: 16, color: '#484848', mr: 1 }} />
            <Typography variant="body2" sx={{ color: '#484848' }}>
              {job.type}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: '#484848', mb: 2, lineHeight: 1.4 }}>
          {job.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          {job.skills.map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              size="small"
              sx={{
                mr: 0.5,
                mb: 0.5,
                backgroundColor: '#1D503A',
                color: 'white',
                fontSize: '0.7rem',
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#484848', opacity: 0.7 }}>
            Posted {job.posted}
          </Typography>
          <Button
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#1D503A',
              '&:hover': { backgroundColor: '#16412e' },
              borderRadius: 1,
              fontWeight: 'bold',
            }}
            onClick={handleGetStarted}
          >
            Apply Now
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FAF5EE' }}>
      <HomeNavbar />
      
      {/* Hero Section */}
      <Box sx={{ 
        backgroundColor: '#1D503A', 
        color: 'white', 
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, #1D503A 0%, #2D6B52 100%)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
              Find Your Dream Job with AI
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, mb: 4, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
              Intelligent job matching powered by artificial intelligence
            </Typography>
            
            {/* Role Selection Tabs */}
            <Paper sx={{ 
              maxWidth: 500, 
              mx: 'auto', 
              mb: 4, 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                centered
                sx={{
                  '& .MuiTab-root': { color: 'white', opacity: 0.7 },
                  '& .Mui-selected': { color: 'white', opacity: 1, fontWeight: 'bold' },
                }}
              >
                <Tab label="I'm a Job Seeker" />
                <Tab label="I'm an Employer" />
              </Tabs>
            </Paper>

            {tabValue === 0 ? (
              <Box component="form" onSubmit={handleSearch} sx={{ maxWidth: 600, mx: 'auto' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      placeholder="Job title, skills, or company"
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
                        backgroundColor: 'white',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      placeholder="Location"
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
                        backgroundColor: 'white',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{
                        backgroundColor: '#FAF5EE',
                        color: '#1D503A',
                        '&:hover': {
                          backgroundColor: '#e8e0d5',
                        },
                        fontWeight: 'bold',
                        height: '56px',
                        borderRadius: 1,
                      }}
                    >
                      Search
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                  Ready to find the perfect candidates for your company?
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    backgroundColor: '#FAF5EE',
                    color: '#1D503A',
                    '&:hover': { backgroundColor: '#e8e0d5' },
                    px: 4,
                    py: 1.5,
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                  }}
                >
                  Start Posting Jobs
                </Button>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} sx={{ textAlign: 'center', mb: 8 }}>
          <Grid item xs={6} md={3}>
            <Typography variant="h3" sx={{ color: '#1D503A', fontWeight: 'bold', mb: 1 }}>
              10K+
            </Typography>
            <Typography variant="h6" sx={{ color: '#484848' }}>
              Available Jobs
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="h3" sx={{ color: '#1D503A', fontWeight: 'bold', mb: 1 }}>
              95%
            </Typography>
            <Typography variant="h6" sx={{ color: '#484848' }}>
              Match Accuracy
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="h3" sx={{ color: '#1D503A', fontWeight: 'bold', mb: 1 }}>
              24h
            </Typography>
            <Typography variant="h6" sx={{ color: '#484848' }}>
              Average Hire Time
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="h3" sx={{ color: '#1D503A', fontWeight: 'bold', mb: 1 }}>
              500+
            </Typography>
            <Typography variant="h6" sx={{ color: '#484848' }}>
              Companies
            </Typography>
          </Grid>
        </Grid>

        {/* How It Works Section */}
        <Box id="how-it-works" sx={{ mb: 8 }}>
          <Typography variant="h3" sx={{ color: '#1D503A', fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
            How It Works
          </Typography>
          <Typography variant="h6" sx={{ color: '#484848', mb: 6, textAlign: 'center' }}>
            Simple steps to your next career opportunity
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ fontSize: 48, color: '#1D503A', mb: 2 }}>1</Box>
                <PlayCircle sx={{ fontSize: 60, color: '#1D503A', mb: 2 }} />
                <Typography variant="h5" sx={{ color: '#1D503A', mb: 2 }}>
                  Create Profile
                </Typography>
                <Typography sx={{ color: '#484848' }}>
                  Sign up and upload your resume. Our AI will analyze your skills and experience.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ fontSize: 48, color: '#1D503A', mb: 2 }}>2</Box>
                <TrendingUp sx={{ fontSize: 60, color: '#1D503A', mb: 2 }} />
                <Typography variant="h5" sx={{ color: '#1D503A', mb: 2 }}>
                  Get Matched
                </Typography>
                <Typography sx={{ color: '#484848' }}>
                  Receive personalized job recommendations based on your profile.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ fontSize: 48, color: '#1D503A', mb: 2 }}>3</Box>
                <CheckCircle sx={{ fontSize: 60, color: '#1D503A', mb: 2 }} />
                <Typography variant="h5" sx={{ color: '#1D503A', mb: 2 }}>
                  Apply & Succeed
                </Typography>
                <Typography sx={{ color: '#484848' }}>
                  Apply to perfect matches and land your dream job faster.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* For Employers Section */}
        <Box id="employers" sx={{ mb: 8 }}>
          <Typography variant="h3" sx={{ color: '#1D503A', fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
            For Employers
          </Typography>
          <Typography variant="h6" sx={{ color: '#484848', mb: 6, textAlign: 'center' }}>
            Find the perfect candidates with AI-powered matching
          </Typography>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Groups sx={{ fontSize: 120, color: '#1D503A', mb: 2 }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ color: '#1D503A', mb: 2 }}>
                  Smart Candidate Matching
                </Typography>
                <Typography sx={{ color: '#484848', mb: 3 }}>
                  Our AI algorithm analyzes resumes and job requirements to find the perfect matches, saving you time and improving hire quality.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle sx={{ color: '#1D503A', mr: 2 }} />
                    <Typography>AI-powered candidate matching</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle sx={{ color: '#1D503A', mr: 2 }} />
                    <Typography>Automated resume screening</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle sx={{ color: '#1D503A', mr: 2 }} />
                    <Typography>Skills-based candidate ranking</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle sx={{ color: '#1D503A', mr: 2 }} />
                    <Typography>Diverse talent pool access</Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register/employer')}
                  sx={{
                    mt: 3,
                    backgroundColor: '#1D503A',
                    '&:hover': { backgroundColor: '#16412e' },
                    px: 4,
                    py: 1.5,
                    fontWeight: 'bold',
                  }}
                >
                  Start Hiring Now
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Jobs Preview Section */}
        <Box id="jobs">
          <Typography variant="h3" sx={{ color: '#1D503A', fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
            Latest Job Opportunities
          </Typography>
          <Typography variant="h6" sx={{ color: '#484848', mb: 6, textAlign: 'center' }}>
            Discover your next career move
          </Typography>

          <Grid container spacing={3}>
            {mockJobs.map((job) => (
              <Grid item xs={12} md={4} key={job.id}>
                <JobCard job={job} />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                backgroundColor: '#1D503A',
                '&:hover': { backgroundColor: '#16412e' },
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                fontSize: '1.1rem',
              }}
            >
              View All Jobs
            </Button>
          </Box>
        </Box>

        {/* Final CTA Section */}
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          mt: 8,
          backgroundColor: 'rgba(29, 80, 58, 0.05)',
          borderRadius: 2,
        }}>
          <Typography variant="h3" sx={{ color: '#1D503A', fontWeight: 'bold', mb: 2 }}>
            Ready to Transform Your Career?
          </Typography>
          <Typography variant="h6" sx={{ color: '#484848', mb: 4, maxWidth: 600, mx: 'auto' }}>
            Join thousands of job seekers and employers who found success with JobWiseAI
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                backgroundColor: '#1D503A',
                '&:hover': { backgroundColor: '#16412e' },
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                fontSize: '1.1rem',
              }}
            >
              Find Your Dream Job
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register/employer')}
              sx={{
                borderColor: '#1D503A',
                color: '#1D503A',
                '&:hover': { 
                  borderColor: '#16412e',
                  backgroundColor: 'rgba(29, 80, 58, 0.04)'
                },
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                fontSize: '1.1rem',
              }}
            >
              Post Jobs Now
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
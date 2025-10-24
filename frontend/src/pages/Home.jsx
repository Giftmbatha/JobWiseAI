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
  Tab,
  alpha,
  Fade,
  Slide,
  Avatar,
  Divider,
  IconButton
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
  Groups,
  AutoAwesome,
  RocketLaunch,
  Star,
  Bolt,
  Psychology,
  Work,
  ArrowForward,
  LinkedIn,
  Twitter,
  Facebook
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
      description: 'Build innovative software solutions with modern technologies in a fast-paced startup environment.',
      skills: ['React', 'Node.js', 'Python', 'AWS'],
      remote: true,
      featured: true
    },
    {
      id: 2,
      title: 'Data Scientist',
      company: 'DataFlow Analytics',
      location: 'Cape Town',
      salary: 'R55,000 - R75,000',
      type: 'Full-time',
      posted: '1 week ago',
      description: 'Analyze complex datasets and build machine learning models to drive business insights.',
      skills: ['Python', 'ML', 'SQL', 'TensorFlow'],
      remote: false,
      featured: false
    },
    {
      id: 3,
      title: 'UX/UI Designer',
      company: 'CreativeMinds',
      location: 'Remote',
      salary: 'R45,000 - R65,000',
      type: 'Contract',
      posted: '3 days ago',
      description: 'Design beautiful user interfaces for digital products used by millions of users worldwide.',
      skills: ['Figma', 'UI/UX', 'Prototyping', 'User Research'],
      remote: true,
      featured: true
    }
  ];

  const stats = [
    { number: '10K+', label: 'Available Jobs', icon: <Work /> },
    { number: '95%', label: 'Match Accuracy', icon: <Psychology /> },
    { number: '24h', label: 'Average Hire Time', icon: <Bolt /> },
    { number: '500+', label: 'Top Companies', icon: <Business /> }
  ];

  const features = [
    {
      step: '1',
      icon: <AutoAwesome sx={{ fontSize: 48 }} />,
      title: 'AI Profile Analysis',
      description: 'Our AI analyzes your skills and experience to create a smart profile.'
    },
    {
      step: '2',
      icon: <TrendingUp sx={{ fontSize: 48 }} />,
      title: 'Smart Job Matching',
      description: 'Get personalized job recommendations that match your profile perfectly.'
    },
    {
      step: '3',
      icon: <RocketLaunch sx={{ fontSize: 48 }} />,
      title: 'Quick Applications',
      description: 'Apply to multiple jobs with one click using your optimized profile.'
    }
  ];

  const employerBenefits = [
    'AI-powered candidate matching',
    'Automated resume screening',
    'Skills-based candidate ranking',
    'Diverse talent pool access',
    'Advanced analytics dashboard',
    'Quick hiring process'
  ];

  const JobCard = ({ job }) => (
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
        }
      }}>
        {job.featured && (
          <Box sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            <Star sx={{ fontSize: 16, color: '#ffd700' }} />
            <Chip 
              label="Featured" 
              size="small" 
              sx={{ 
                backgroundColor: '#ffd70020', 
                color: '#b8860b',
                fontWeight: 600,
                fontSize: '0.7rem'
              }} 
            />
          </Box>
        )}
        
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ 
            color: '#1D503A', 
            mb: 2, 
            fontWeight: 700,
            lineHeight: 1.3
          }}>
            {job.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <Business sx={{ fontSize: 18, color: '#666' }} />
            <Typography variant="body1" sx={{ color: '#484848', fontWeight: 600 }}>
              {job.company}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <LocationOn sx={{ fontSize: 18, color: '#666' }} />
            <Typography variant="body2" sx={{ color: '#484848' }}>
              {job.location}
              {job.remote && ' • 🌍 Remote'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <AttachMoney sx={{ fontSize: 18, color: '#2e7d32' }} />
            <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
              {job.salary}
            </Typography>
            <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule sx={{ fontSize: 16, color: '#666' }} />
              <Typography variant="body2" sx={{ color: '#666' }}>
                {job.type}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" sx={{
            color: '#484848', 
            mb: 3, 
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {job.description}
          </Typography>

          <Box sx={{ mb: 3 }}>
            {job.skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                sx={{
                  mr: 0.5,
                  mb: 0.5,
                  backgroundColor: '#1D503A20',
                  color: '#1D503A',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  borderRadius: 1.5
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#666', opacity: 0.8 }}>
              📅 {job.posted}
            </Typography>
            <Button
              variant="contained"
              size="small"
              endIcon={<ArrowForward />}
              sx={{
                background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)',
                  transform: 'translateX(4px)'
                },
                borderRadius: 2,
                fontWeight: 700,
                px: 2,
                transition: 'all 0.3s ease'
              }}
              onClick={handleGetStarted}
            >
              Apply Now
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FAF5EE' }}>
      <HomeNavbar />
      
      {/* Enhanced Hero Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1000}>
                <Box>
                  <Chip 
                    label="🚀 AI-Powered Job Matching" 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 600,
                      mb: 3,
                      fontSize: '0.9rem'
                    }} 
                  />
                  <Typography variant="h2" sx={{ 
                    fontWeight: 800, 
                    mb: 3, 
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    color: 'white',
                    lineHeight: 1.2
                  }}>
                    Find Your Dream Job with{' '}
                    <Box component="span" sx={{ 
                      background: 'linear-gradient(45deg, #FFD700, #FFEC8B)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent'
                    }}>
                      AI Intelligence
                    </Box>
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    opacity: 0.9, 
                    mb: 4, 
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    color: 'white',
                    lineHeight: 1.6
                  }}>
                    Smart job matching, personalized recommendations, and career growth powered by artificial intelligence.
                  </Typography>
                </Box>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Slide direction="left" in={true} timeout={1200}>
                <Paper sx={{ 
                  p: 4, 
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                }}>
                  {/* Role Selection Tabs */}
                  <Paper sx={{ 
                    mb: 4, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #FAF5EE 0%, #f5f0e9 100%)'
                  }}>
                    <Tabs
                      value={tabValue}
                      onChange={handleTabChange}
                      centered
                      sx={{
                        '& .MuiTab-root': { 
                          minHeight: 60,
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          textTransform: 'none',
                          '&.Mui-selected': {
                            color: '#1D503A'
                          }
                        },
                        '& .MuiTabs-indicator': {
                          backgroundColor: '#1D503A',
                          height: 3,
                          borderRadius: 3
                        }
                      }}
                    >
                      <Tab label="👤 I'm a Job Seeker" />
                      <Tab label="🏢 I'm an Employer" />
                    </Tabs>
                  </Paper>

                  {tabValue === 0 ? (
                    <Box component="form" onSubmit={handleSearch}>
                      <Typography variant="h6" sx={{ color: '#1D503A', mb: 3, fontWeight: 700, textAlign: 'center' }}>
                        Find Your Perfect Job Match
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
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
                                borderRadius: 2,
                                backgroundColor: 'white',
                                '&:hover fieldset': {
                                  borderColor: '#1D503A',
                                },
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            placeholder="Location, city, or remote..."
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
                                borderRadius: 2,
                                backgroundColor: 'white'
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={<RocketLaunch />}
                            sx={{
                              background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)',
                                transform: 'translateY(-2px)'
                              },
                              fontWeight: 700,
                              height: '56px',
                              borderRadius: 2,
                              fontSize: '1.1rem',
                              boxShadow: '0 8px 25px rgba(29, 80, 58, 0.3)',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Discover Jobs
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: '#1D503A', mb: 3, fontWeight: 700 }}>
                        Ready to Find Top Talent?
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
                        Access our pool of pre-screened, AI-matched candidates and hire faster.
                      </Typography>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={<Groups />}
                        onClick={handleGetStarted}
                        sx={{
                          background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
                          '&:hover': { 
                            background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)',
                            transform: 'translateY(-2px)'
                          },
                          px: 4,
                          py: 1.5,
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          borderRadius: 2,
                          boxShadow: '0 8px 25px rgba(29, 80, 58, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Start Hiring Now
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Enhanced Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Fade in={true} timeout={800 + index * 200}>
                <Paper sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid rgba(29, 80, 58, 0.1)',
                  boxShadow: '0 8px 32px rgba(29, 80, 58, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(29, 80, 58, 0.15)'
                  }
                }}>
                  <Box sx={{ 
                    color: '#1D503A', 
                    mb: 2,
                    display: 'inline-flex',
                    p: 1.5,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #1D503A20, #1D503A10)'
                  }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h3" sx={{ 
                    color: '#1D503A', 
                    fontWeight: 800, 
                    mb: 1 
                  }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#484848', 
                    fontWeight: 600 
                  }}>
                    {stat.label}
                  </Typography>
                </Paper>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Enhanced How It Works Section */}
        <Box id="how-it-works" sx={{ mb: 12 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" sx={{ 
              color: '#1D503A', 
              fontWeight: 800, 
              mb: 2,
              background: 'linear-gradient(45deg, #1D503A, #2a6b4f)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
              How JobWiseAI Works
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#666', 
              maxWidth: 600, 
              mx: 'auto',
              fontSize: '1.2rem'
            }}>
              Three simple steps to your dream career with AI-powered precision
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in={true} timeout={1000 + index * 300}>
                  <Card sx={{ 
                    height: '100%',
                    textAlign: 'center', 
                    p: 4,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                    border: '1px solid rgba(29, 80, 58, 0.1)',
                    boxShadow: '0 8px 32px rgba(29, 80, 58, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 40px rgba(29, 80, 58, 0.15)'
                    }
                  }}>
                    <Box sx={{ 
                      fontSize: 72, 
                      color: '#1D503A', 
                      mb: 2,
                      fontWeight: 800,
                      opacity: 0.1
                    }}>
                      {feature.step}
                    </Box>
                    <Box sx={{ color: '#1D503A', mb: 3 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" sx={{ 
                      color: '#1D503A', 
                      mb: 2,
                      fontWeight: 700
                    }}>
                      {feature.title}
                    </Typography>
                    <Typography sx={{ 
                      color: '#484848', 
                      lineHeight: 1.6 
                    }}>
                      {feature.description}
                    </Typography>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Enhanced Jobs Preview Section */}
        <Box id="jobs" sx={{ mb: 12 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ 
              color: '#1D503A', 
              fontWeight: 800, 
              mb: 2 
            }}>
              🔥 Hot Job Opportunities
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#666',
              fontSize: '1.2rem'
            }}>
              Curated selections from top companies
            </Typography>
          </Box>

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
              endIcon={<ArrowForward />}
              sx={{
                background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)',
                  transform: 'translateY(-2px)'
                },
                px: 6,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1.1rem',
                borderRadius: 3,
                boxShadow: '0 8px 25px rgba(29, 80, 58, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              Explore All Jobs
            </Button>
          </Box>
        </Box>

        {/* Enhanced Final CTA Section */}
        <Box sx={{ 
          textAlign: 'center', 
          py: 10,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 800, 
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' }
          }}>
            Ready to Transform Your Career?
          </Typography>
          <Typography variant="h6" sx={{ 
            mb: 4, 
            maxWidth: 600, 
            mx: 'auto',
            opacity: 0.9,
            fontSize: { xs: '1rem', md: '1.2rem' }
          }}>
            Join thousands of job seekers and employers who found success with AI-powered JobWiseAI
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              startIcon={<RocketLaunch />}
              sx={{
                backgroundColor: '#FAF5EE',
                color: '#1D503A',
                '&:hover': { 
                  backgroundColor: '#e8e0d5',
                  transform: 'translateY(-2px)'
                },
                px: 5,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1.1rem',
                borderRadius: 3,
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              Start Job Hunting
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register/employer')}
              startIcon={<Groups />}
              sx={{
                borderColor: '#FAF5EE',
                color: '#FAF5EE',
                '&:hover': { 
                  borderColor: '#FAF5EE',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)'
                },
                px: 5,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1.1rem',
                borderRadius: 3,
                transition: 'all 0.3s ease'
              }}
            >
              Start Hiring
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
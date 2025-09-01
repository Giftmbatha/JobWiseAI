// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  Search,
  LocationOn,
  Business,
  AttachMoney,
  Schedule,
} from '@mui/icons-material';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Mock job data - in Week 2 we'll replace this with real API calls
  const mockJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '$120,000 - $150,000',
      type: 'Full-time',
      posted: '2 days ago',
      description: 'We are looking for an experienced React developer to join our growing team.',
      skills: ['React', 'TypeScript', 'Node.js', 'CSS']
    },
    {
      id: 2,
      title: 'Data Scientist',
      company: 'DataFlow Analytics',
      location: 'New York, NY',
      salary: '$100,000 - $130,000',
      type: 'Full-time',
      posted: '1 week ago',
      description: 'Join our data team to build innovative machine learning solutions.',
      skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow']
    },
    {
      id: 3,
      title: 'UX/UI Designer',
      company: 'CreativeMinds',
      location: 'Remote',
      salary: '$80,000 - $100,000',
      type: 'Contract',
      posted: '3 days ago',
      description: 'Design beautiful and intuitive user interfaces for our products.',
      skills: ['Figma', 'UI/UX', 'Prototyping', 'User Research']
    },
    {
      id: 4,
      title: 'Backend Engineer',
      company: 'CloudSystems',
      location: 'Austin, TX',
      salary: '$110,000 - $140,000',
      type: 'Full-time',
      posted: 'Just now',
      description: 'Build scalable backend systems using modern technologies.',
      skills: ['Java', 'Spring Boot', 'AWS', 'Microservices']
    },
    {
      id: 5,
      title: 'Product Manager',
      company: 'InnovateTech',
      location: 'Boston, MA',
      salary: '$90,000 - $120,000',
      type: 'Full-time',
      posted: '5 days ago',
      description: 'Lead product development and work with cross-functional teams.',
      skills: ['Product Management', 'Agile', 'JIRA', 'Strategy']
    },
    {
      id: 6,
      title: 'DevOps Engineer',
      company: 'InfraSolutions',
      location: 'Remote',
      salary: '$100,000 - $130,000',
      type: 'Full-time',
      posted: '2 weeks ago',
      description: 'Manage our cloud infrastructure and deployment pipelines.',
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS']
    }
  ];

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Filter jobs based on search - will be replaced with real search in Week 2
    const filteredJobs = mockJobs.filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setJobs(filteredJobs);
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

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
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 1, fontWeight: 'bold' }}>
          {job.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Business sx={{ fontSize: 16, color: 'neutral.main', mr: 1 }} />
          <Typography variant="body2" sx={{ color: 'neutral.main' }}>
            {job.company}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn sx={{ fontSize: 16, color: 'neutral.main', mr: 1 }} />
          <Typography variant="body2" sx={{ color: 'neutral.main' }}>
            {job.location}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AttachMoney sx={{ fontSize: 16, color: 'neutral.main', mr: 1 }} />
          <Typography variant="body2" sx={{ color: 'neutral.main' }}>
            {job.salary}
          </Typography>
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
            <Schedule sx={{ fontSize: 16, color: 'neutral.main', mr: 1 }} />
            <Typography variant="body2" sx={{ color: 'neutral.main' }}>
              {job.type}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: 'neutral.main', mb: 2, lineHeight: 1.4 }}>
          {job.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          {job.skills.slice(0, 4).map((skill, index) => (
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
          <Typography variant="caption" sx={{ color: 'neutral.main', opacity: 0.7 }}>
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
      {/* Hero Section */}
      <Box sx={{ 
        backgroundColor: '#1D503A', 
        color: 'white', 
        py: 8,
        background: 'linear-gradient(135deg, #1D503A 0%, #2D6B52 100%)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
              Find Your Dream Job with AI
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, mb: 4 }}>
              Let our AI match you with perfect opportunities based on your skills and preferences
            </Typography>
            
            <Box component="form" onSubmit={handleSearch} sx={{ maxWidth: 600, mx: 'auto' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={5}>
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
                <Grid item xs={12} md={3}>
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
                    Search Jobs
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4} sx={{ textAlign: 'center', mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="h3" sx={{ color: '#1D503A', fontWeight: 'bold', mb: 1 }}>
              10K+
            </Typography>
            <Typography variant="h6" sx={{ color: '#484848' }}>
              Available Jobs
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h3" sx={{ color: '#1D503A', fontWeight: 'bold', mb: 1 }}>
              95%
            </Typography>
            <Typography variant="h6" sx={{ color: '#484848' }}>
              Match Accuracy
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h3" sx={{ color: '#1D503A', fontWeight: 'bold', mb: 1 }}>
              24h
            </Typography>
            <Typography variant="h6" sx={{ color: '#484848' }}>
              Average Hire Time
            </Typography>
          </Grid>
        </Grid>

        {/* Jobs Section */}
        <Box>
          <Typography variant="h4" sx={{ 
            color: '#1D503A', 
            fontWeight: 'bold', 
            mb: 4, 
            textAlign: 'center' 
          }}>
            Featured Jobs
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#1D503A' }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {jobs.map((job) => (
                <Grid item xs={12} md={6} lg={4} key={job.id}>
                  <JobCard job={job} />
                </Grid>
              ))}
            </Grid>
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
                  setJobs(mockJobs);
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

        {/* CTA Section */}
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          mt: 6,
          backgroundColor: 'rgba(29, 80, 58, 0.05)',
          borderRadius: 2,
        }}>
          <Typography variant="h3" sx={{ color: '#1D503A', fontWeight: 'bold', mb: 2 }}>
            Ready to Find Your Perfect Job?
          </Typography>
          <Typography variant="h6" sx={{ color: '#484848', mb: 4, maxWidth: 600, mx: 'auto' }}>
            Join thousands of job seekers who found their dream career through JobWiseAI
          </Typography>
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
            Get Started Free
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
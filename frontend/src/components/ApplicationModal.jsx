import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  alpha,
  Fade,
  Slide,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Description,
  Work,
  Business,
  LocationOn,
  AttachMoney,
  Schedule,
  Send,
  Cancel,
  CheckCircle,
  AutoAwesome,
  RocketLaunch
} from '@mui/icons-material';
import { applicationsApi } from '../api/applications';

const ApplicationModal = ({ job, open, onClose, userResumes }) => {
  const [selectedResume, setSelectedResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  // Safe handling of userResumes - ensure it's always an array
  const resumes = Array.isArray(userResumes) ? userResumes : [];
  
  // Reset form when modal opens/closes or job changes
  useEffect(() => {
    if (open) {
      setSelectedResume('');
      setCoverLetter('');
      setError('');
      setLoading(false);
      setActiveStep(0);
    }
  }, [open, job]);

  const handleApply = async () => {
    if (!job) {
      setError('No job selected');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await applicationsApi.applyToJob({
        job_id: job.id,
        resume_id: selectedResume || null,
        cover_letter: coverLetter
      });
      onClose(true); // Pass success flag
    } catch (error) {
      console.error('Application failed:', error);
      setError('Application failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose(false);
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const steps = [
    {
      label: 'Job Details',
      description: 'Review the job information'
    },
    {
      label: 'Select Resume',
      description: 'Choose which resume to submit'
    },
    {
      label: 'Cover Letter',
      description: 'Add a personalized message'
    },
    {
      label: 'Review & Submit',
      description: 'Finalize your application'
    }
  ];

  // Don't render anything if no job is selected
  if (!job) {
    return null;
  }

  const getSelectedResumeName = () => {
    const resume = resumes.find(r => r.id === selectedResume);
    return resume ? resume.name : 'No resume selected';
  };

  return (
    <Dialog 
      open={open && !!job} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
        color: 'white',
        py: 3
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            🚀 Apply for Position
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
            Complete your application in a few simple steps
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {/* Stepper */}
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      color: index < activeStep ? '#1D503A' : '#ccc',
                      '&.Mui-completed': { color: '#1D503A' },
                      '&.Mui-active': { 
                        color: '#1D503A',
                        backgroundColor: '#1D503A20'
                      }
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {step.label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              m: 3, 
              mb: 2,
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)'
            }}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ p: 3 }}>
          {/* Step 1: Job Details */}
          {activeStep === 0 && (
            <Fade in={true}>
              <Box>
                <Typography variant="h6" sx={{ color: '#1D503A', mb: 3, fontWeight: 600 }}>
                  📋 Job Overview
                </Typography>
                
                <Card sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #FAF5EE 0%, #f5f0e9 100%)',
                  border: '1px solid rgba(29, 80, 58, 0.1)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ color: '#1D503A', mb: 2, fontWeight: 700 }}>
                      {job.title}
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Business sx={{ color: '#1D503A' }} />
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {job.company}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <LocationOn sx={{ color: '#1D503A' }} />
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {job.location}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {job.salary_min && job.salary_max && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AttachMoney sx={{ color: '#2e7d32' }} />
                        <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                          R{job.salary_min.toLocaleString()} - R{job.salary_max.toLocaleString()}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={job.job_type} 
                        sx={{ 
                          backgroundColor: '#1D503A20', 
                          color: '#1D503A',
                          fontWeight: 600
                        }} 
                      />
                      {job.remote && (
                        <Chip 
                          label="Remote" 
                          sx={{ 
                            backgroundColor: '#1976d220', 
                            color: '#1976d2',
                            fontWeight: 600
                          }} 
                        />
                      )}
                    </Box>

                    <Typography variant="body2" sx={{ color: '#484848', lineHeight: 1.6 }}>
                      {job.description?.substring(0, 300)}...
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          )}

          {/* Step 2: Resume Selection */}
          {activeStep === 1 && (
            <Fade in={true}>
              <Box>
                <Typography variant="h6" sx={{ color: '#1D503A', mb: 3, fontWeight: 600 }}>
                  📄 Select Your Resume
                </Typography>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Choose Resume</InputLabel>
                  <Select
                    value={selectedResume}
                    onChange={(e) => setSelectedResume(e.target.value)}
                    label="Choose Resume"
                    disabled={loading || resumes.length === 0}
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1D503A'
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>No resume selected</em>
                    </MenuItem>
                    {resumes.length > 0 ? (
                      resumes.map((resume) => (
                        <MenuItem key={resume.id} value={resume.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#1D503A', width: 32, height: 32 }}>
                              <Description />
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {resume.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        No resumes available
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>

                {resumes.length === 0 && (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mt: 2, 
                      borderRadius: 3,
                      boxShadow: '0 4px 12px rgba(237, 108, 2, 0.1)'
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      You need to upload a resume before applying to jobs.
                    </Typography>
                  </Alert>
                )}

                {selectedResume && (
                  <Fade in={true}>
                    <Alert 
                      severity="success" 
                      sx={{ 
                        mt: 2, 
                        borderRadius: 3,
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.1)'
                      }}
                      icon={<CheckCircle />}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Resume selected: {getSelectedResumeName()}
                      </Typography>
                    </Alert>
                  </Fade>
                )}
              </Box>
            </Fade>
          )}

          {/* Step 3: Cover Letter */}
          {activeStep === 2 && (
            <Fade in={true}>
              <Box>
                <Typography variant="h6" sx={{ color: '#1D503A', mb: 3, fontWeight: 600 }}>
                  ✍️ Personalize Your Application
                </Typography>

                <TextField
                  fullWidth
                  margin="normal"
                  label="Cover Letter (Optional)"
                  multiline
                  rows={6}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the employer why you're the perfect fit for this position. Highlight your relevant skills and experience..."
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#1D503A',
                      },
                    }
                  }}
                />

                <Box sx={{ mt: 2, p: 2, backgroundColor: '#FAF5EE', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: '#1D503A', fontWeight: 600, mb: 1 }}>
                    💡 Pro Tip:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#484848' }}>
                    A personalized cover letter can increase your chances of getting an interview by up to 40%. Mention specific skills from the job description and how your experience matches their requirements.
                  </Typography>
                </Box>
              </Box>
            </Fade>
          )}

          {/* Step 4: Review & Submit */}
          {activeStep === 3 && (
            <Fade in={true}>
              <Box>
                <Typography variant="h6" sx={{ color: '#1D503A', mb: 3, fontWeight: 600 }}>
                  👀 Review Your Application
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, border: '1px solid rgba(29, 80, 58, 0.1)' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#1D503A', mb: 2, fontWeight: 600 }}>
                          Job Details
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                          {job.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          {job.company} • {job.location}
                        </Typography>
                        <Chip 
                          label={job.job_type} 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#1D503A20', 
                            color: '#1D503A',
                            fontWeight: 600
                          }} 
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, border: '1px solid rgba(29, 80, 58, 0.1)' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#1D503A', mb: 2, fontWeight: 600 }}>
                          Your Application
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Resume:</strong> {getSelectedResumeName()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Cover Letter:</strong> {coverLetter ? `${coverLetter.length} characters` : 'Not included'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {coverLetter && (
                  <Card sx={{ mt: 3, borderRadius: 3, border: '1px solid rgba(29, 80, 58, 0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#1D503A', mb: 2, fontWeight: 600 }}>
                        Cover Letter Preview
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#484848', lineHeight: 1.6 }}>
                        {coverLetter}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 3, 
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(2, 136, 209, 0.1)'
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Ready to submit your application? Make sure everything looks perfect!
                  </Typography>
                </Alert>
              </Box>
            </Fade>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={activeStep === 0 ? handleClose : handleBack}
          variant="outlined"
          startIcon={<Cancel />}
          disabled={loading}
          sx={{ 
            borderRadius: 2,
            px: 4,
            borderColor: '#666',
            color: '#666',
            fontWeight: 600,
            '&:hover': {
              borderColor: '#333',
              backgroundColor: 'rgba(0,0,0,0.04)'
            }
          }}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>

        {activeStep < steps.length - 1 ? (
          <Button 
            onClick={handleNext}
            variant="contained"
            disabled={activeStep === 1 && !selectedResume}
            sx={{ 
              background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
              '&:hover': { 
                background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)',
                transform: 'translateY(-2px)'
              },
              px: 4,
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(29, 80, 58, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            Continue
          </Button>
        ) : (
          <Button 
            onClick={handleApply} 
            variant="contained" 
            disabled={loading || !job || resumes.length === 0}
            startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <RocketLaunch />}
            sx={{ 
              background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
              '&:hover': { 
                background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                transform: 'translateY(-2px)'
              },
              '&:disabled': {
                background: '#cccccc'
              },
              px: 4,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Submitting...' : 'Launch Application 🚀'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationModal;
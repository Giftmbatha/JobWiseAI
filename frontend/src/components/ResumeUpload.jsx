import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  alpha,
  Fade,
  Slide,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Divider
} from '@mui/material';
import { 
  CloudUpload, 
  Delete, 
  Description, 
  Visibility,
  Download,
  CheckCircle,
  Error,
  AutoAwesome,
  Article,
  School,
  Work,
  Code,
  Schedule,
  FilePresent,
  UploadFile,
  Analytics,
  Celebration,
  Folder,
  Psychology
} from '@mui/icons-material';
import { resumesAPI } from '../api/resumes';
import { useAuth } from '../context/AuthContext';

const ResumeUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resumes, setResumes] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const { user } = useAuth();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a PDF, DOC, or DOCX file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      setError('');
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await resumesAPI.uploadResume(formData);
      setMessage('Resume uploaded successfully! AI is analyzing your skills...');
      setSelectedFile(null);
      document.getElementById('resume-upload').value = '';
      fetchResumes();
    } catch (error) {
      setError(error.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await resumesAPI.getUserResumes();
      setResumes(response.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      setError('Failed to load resumes');
    }
  };

  const handleDeleteResume = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await resumesAPI.deleteResume(id);
        setMessage('Resume deleted successfully');
        fetchResumes();
      } catch (error) {
        setError('Error deleting resume');
      }
    }
  };

  const handleViewResume = async (resume) => {
    try {
      const response = await resumesAPI.getResume(resume.id);
      setSelectedResume(response.data);
      setViewDialogOpen(true);
    } catch (error) {
      setError('Failed to load resume details');
    }
  };

  const handleDownloadResume = async (resumeId, fileName) => {
    try {
      const response = await resumesAPI.downloadResume(resumeId);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage('Resume download started');
    } catch (error) {
      setError('Failed to download resume');
    }
  };

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const getFileTypeColor = (fileType) => {
    if (fileType?.includes('pdf')) return '#f44336';
    if (fileType?.includes('word')) return '#1976d2';
    return '#666';
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType?.includes('pdf')) return <Article />;
    if (fileType?.includes('word')) return <Description />;
    return <FilePresent />;
  };

  return (
    <Paper sx={{ 
      p: 3, 
      mb: 2,
      borderRadius: 2,
      background: 'white',
      boxShadow: '0 4px 12px rgba(29, 80, 58, 0.1)',
      border: '1px solid rgba(29, 80, 58, 0.08)'
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{
          p: 1.5,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #1D503A, #2a6b4f)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(29, 80, 58, 0.3)'
        }}>
          <UploadFile sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ 
            color: '#1D503A', 
            fontWeight: 700,
            mb: 0.5
          }}>
            Upload Your Resume
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontWeight: 400 }}>
            Let AI analyze your skills and match you with perfect opportunities
          </Typography>
        </Box>
      </Box>

      {/* Upload Section */}
      <Card sx={{ 
        mb: 3, 
        border: '2px dashed rgba(29, 80, 58, 0.3)',
        borderRadius: 2,
        background: 'linear-gradient(135deg, #FAF5EE 0%, #f5f0e9 100%)',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: '#1D503A',
          background: 'linear-gradient(135deg, #FAF5EE 0%, #e8e0d5 100%)'
        }
      }}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <CloudUpload sx={{ fontSize: 48, color: '#1D503A', mb: 2, opacity: 0.8 }} />
          
          <Typography variant="h6" sx={{ color: '#1D503A', mb: 2, fontWeight: 600 }}>
            Drag & drop your resume or click to browse
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            Supports PDF, DOC, DOCX files up to 5MB
          </Typography>

          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <label htmlFor="resume-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUpload />}
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
                fontSize: '0.875rem',
                boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)',
                transition: 'all 0.3s ease',
                mb: 2
              }}
            >
              Choose File
            </Button>
          </label>

          {selectedFile && (
            <Fade in={true}>
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                borderRadius: 2, 
                backgroundColor: 'rgba(29, 80, 58, 0.05)',
                border: '1px solid rgba(29, 80, 58, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <FilePresent sx={{ color: '#1D503A' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1D503A' }}>
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ color: '#2e7d32' }} />
                </Box>
                
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={uploading}
                  startIcon={uploading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <AutoAwesome />}
                  fullWidth
                  sx={{
                    background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)',
                      transform: 'translateY(-1px)'
                    },
                    '&:disabled': {
                      background: '#cccccc'
                    },
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {uploading ? 'AI Analyzing...' : 'Upload & Analyze'}
                </Button>

                {uploading && (
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
                )}
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      {message && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 2, 
            borderRadius: 2,
          }}
          onClose={() => setMessage('')}
          icon={<Celebration />}
        >
          {message}
        </Alert>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            borderRadius: 2,
          }}
          onClose={() => setError('')}
          icon={<Error />}
        >
          {error}
        </Alert>
      )}

      {/* Resumes List */}
      {resumes.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: '#1D503A', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Folder /> Your Resumes ({resumes.length})
          </Typography>
          
          <Grid container spacing={2}>
            {resumes.map((resume) => (
              <Grid item xs={12} key={resume.id}>
                <Fade in={true}>
                  <Card sx={{ 
                    borderRadius: 2,
                    background: 'white',
                    border: '1px solid rgba(29, 80, 58, 0.1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(29, 80, 58, 0.15)'
                    }
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* File Icon */}
                        <Avatar sx={{ 
                          bgcolor: getFileTypeColor(resume.file_type),
                          width: 48, 
                          height: 48 
                        }}>
                          {getFileTypeIcon(resume.file_type)}
                        </Avatar>

                        {/* File Info */}
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ color: '#1D503A', fontWeight: 600, mb: 0.5 }}>
                            {resume.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="body2" sx={{ color: '#666', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Schedule sx={{ fontSize: 16 }} />
                              Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Type: {resume.file_type || 'Unknown'}
                            </Typography>
                            {resume.skills_count > 0 && (
                              <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                                {resume.skills_count} skills extracted
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* Actions */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View AI Analysis">
                            <IconButton
                              onClick={() => handleViewResume(resume)}
                              sx={{ 
                                color: '#1D503A',
                                backgroundColor: '#1D503A10',
                                '&:hover': { backgroundColor: '#1D503A20' }
                              }}
                            >
                              <Analytics />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton
                              onClick={() => handleDownloadResume(resume.id, resume.name)}
                              sx={{ 
                                color: '#1976d2',
                                backgroundColor: '#1976d210',
                                '&:hover': { backgroundColor: '#1976d220' }
                              }}
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDeleteResume(resume.id)}
                              sx={{ 
                                color: '#d32f2f',
                                backgroundColor: '#d32f2f10',
                                '&:hover': { backgroundColor: '#d32f2f20' }
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {resumes.length === 0 && !uploading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Description sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#666', mb: 1, fontWeight: 600 }}>
            No resumes uploaded yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#999', maxWidth: 400, mx: 'auto' }}>
            Upload your first resume to unlock AI-powered job matching and skill analysis
          </Typography>
        </Box>
      )}

      {/* Enhanced Resume Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
          color: 'white',
          py: 2
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology /> AI Resume Analysis
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Detailed breakdown of your resume content
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedResume && (
            <Box>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ 
                  bgcolor: getFileTypeColor(selectedResume.file_type),
                  width: 56, 
                  height: 56 
                }}>
                  {getFileTypeIcon(selectedResume.file_type)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1D503A' }}>
                    {selectedResume.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Uploaded {new Date(selectedResume.uploaded_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                {/* Skills Section */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#1D503A', mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Code /> Skills Extracted ({selectedResume.skills?.length || 0})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedResume.skills && selectedResume.skills.length > 0 ? (
                      selectedResume.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          size="small"
                          sx={{ 
                            backgroundColor: '#1D503A20', 
                            color: '#1D503A',
                            fontWeight: 500,
                            borderRadius: 1
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No skills extracted
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Experience Section */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#1D503A', mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Work /> Experience
                  </Typography>
                  {selectedResume.experience && selectedResume.experience.length > 0 ? (
                    selectedResume.experience.map((exp, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, borderRadius: 2, backgroundColor: '#FAF5EE' }}>
                        <Typography variant="body1" fontWeight="bold" sx={{ color: '#1D503A' }}>
                          {exp.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          {exp.company} • {exp.duration}
                        </Typography>
                        {exp.description && (
                          <Typography variant="body2">
                            {exp.description}
                          </Typography>
                        )}
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No experience extracted
                    </Typography>
                  )}
                </Grid>

                {/* Education Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: '#1D503A', mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School /> Education
                  </Typography>
                  {selectedResume.education && selectedResume.education.length > 0 ? (
                    <Grid container spacing={2}>
                      {selectedResume.education.map((edu, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#f8f9fa', height: '100%' }}>
                            <Typography variant="body1" fontWeight="bold" sx={{ color: '#1D503A' }}>
                              {edu.degree}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {edu.institution} • {edu.year}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No education extracted
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              borderColor: '#666',
              color: '#666',
              fontWeight: 500
            }}
          >
            Close
          </Button>
          {selectedResume && (
            <Button
              variant="contained"
              onClick={() => handleDownloadResume(selectedResume.id, selectedResume.name)}
              startIcon={<Download />}
              sx={{
                background: 'linear-gradient(135deg, #1D503A 0%, #2a6b4f 100%)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #16412e 0%, #1D503A 100%)',
                  transform: 'translateY(-1px)'
                },
                px: 3,
                borderRadius: 2,
                fontWeight: 500,
                boxShadow: '0 2px 8px rgba(29, 80, 58, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              Download Resume
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ResumeUpload;
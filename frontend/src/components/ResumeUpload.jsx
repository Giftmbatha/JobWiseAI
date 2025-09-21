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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  CloudUpload, 
  Delete, 
  Description, 
  Visibility,
  Download 
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
      setMessage('Resume uploaded successfully!');
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
      // Create a blob from the response
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to download resume');
    }
  };

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ color: '#1D503A' }}>
        Upload Your Resume
      </Typography>

      <Box sx={{ mb: 3 }}>
        <input
          id="resume-upload"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <label htmlFor="resume-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUpload />}
            sx={{
              borderColor: '#1D503A',
              color: '#1D503A',
              '&:hover': {
                borderColor: '#16412e',
                backgroundColor: 'rgba(29, 80, 58, 0.04)'
              }
            }}
          >
            Select File
          </Button>
        </label>

        {selectedFile && (
          <Typography variant="body2" sx={{ mt: 1, color: '#484848' }}>
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          startIcon={uploading ? <CircularProgress size={16} /> : null}
          sx={{
            mt: 2,
            ml: 2,
            backgroundColor: '#1D503A',
            '&:hover': { backgroundColor: '#16412e' },
            '&:disabled': { backgroundColor: '#cccccc' }
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Resume'}
        </Button>
      </Box>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {resumes.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: '#1D503A' }}>
            Your Resumes
          </Typography>
          <List>
            {resumes.map((resume) => (
              <ListItem
                key={resume.id}
                secondaryAction={
                  <Box>
                    <IconButton
                      onClick={() => handleViewResume(resume)}
                      sx={{ color: '#1D503A' }}
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDownloadResume(resume.id, resume.name)}
                      sx={{ color: '#1976d2' }}
                      title="Download"
                    >
                      <Download />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteResume(resume.id)}
                      sx={{ color: '#d32f2f' }}
                      title="Delete"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                }
              >
                <Description sx={{ mr: 2, color: '#1D503A' }} />
                <ListItemText
                  primary={resume.name}
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        File type: {resume.file_type || 'Unknown'}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {resumes.length === 0 && !uploading && (
        <Typography variant="body2" sx={{ color: '#484848', fontStyle: 'italic' }}>
          No resumes uploaded yet. Upload your first resume to get started!
        </Typography>
      )}

      {/* Resume Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Resume Details</DialogTitle>
        <DialogContent>
          {selectedResume && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedResume.name}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Skills Extracted:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedResume.skills && selectedResume.skills.length > 0 ? (
                    selectedResume.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        sx={{ backgroundColor: '#1D503A', color: 'white' }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No skills extracted
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Experience:
                </Typography>
                {selectedResume.experience && selectedResume.experience.length > 0 ? (
                  selectedResume.experience.map((exp, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {exp.title} at {exp.company}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {exp.duration}
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
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Education:
                </Typography>
                {selectedResume.education && selectedResume.education.length > 0 ? (
                  selectedResume.education.map((edu, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {edu.degree}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {edu.institution} • {edu.year}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No education extracted
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ResumeUpload;
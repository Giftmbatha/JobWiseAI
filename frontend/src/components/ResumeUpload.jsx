// src/components/ResumeUpload.jsx
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
  IconButton
} from '@mui/material';
import { CloudUpload, Delete, Description } from '@mui/icons-material';
import { resumesAPI } from '../api/resumes';
import { useAuth } from '../context/AuthContext';

const ResumeUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resumes, setResumes] = useState([]);
  const { user } = useAuth();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a PDF, DOC, or DOCX file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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

      const response = await resumesAPI.uploadResume(formData);
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
      // Parse JSON strings to objects if needed
      const parsedResumes = response.data.map(resume => ({
        ...resume,
        skills: typeof resume.skills === 'string' ? JSON.parse(resume.skills) : resume.skills,
        experience: typeof resume.experience === 'string' ? JSON.parse(resume.experience) : resume.experience,
        education: typeof resume.education === 'string' ? JSON.parse(resume.education) : resume.education
      }));
      setResumes(parsedResumes);
    } catch (error) {
      console.error('Error fetching resumes:', error);
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

  React.useEffect(() => {
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

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteResume(resume.id)}
                    sx={{ color: '#d32f2f' }}
                  >
                    <Delete />
                  </IconButton>
                }
              >
                <Description sx={{ mr: 2, color: '#1D503A' }} />
                <ListItemText
                  primary={resume.filename}
                  secondary={`Uploaded: ${new Date(resume.created_at).toLocaleDateString()} • ${resume.skills?.length || 0} skills extracted`}
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
    </Paper>
  );
};

export default ResumeUpload;
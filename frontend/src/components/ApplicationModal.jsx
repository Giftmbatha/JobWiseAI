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
  Typography
} from '@mui/material';
import { applicationsApi } from '../api/applications';

const ApplicationModal = ({ job, open, onClose, userResumes }) => {
  const [selectedResume, setSelectedResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Safe handling of userResumes - ensure it's always an array
  const resumes = Array.isArray(userResumes) ? userResumes : [];
  
  // Reset form when modal opens/closes or job changes
  useEffect(() => {
    if (open) {
      setSelectedResume('');
      setCoverLetter('');
      setError('');
      setLoading(false);
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

  // Don't render anything if no job is selected
  if (!job) {
    return null;
  }

  return (
    <Dialog open={open && !!job} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6">Apply to {job.title}</Typography>
          <Typography variant="body2" color="textSecondary">
            {job.company} • {job.location}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth margin="normal">
          <InputLabel>Select Resume</InputLabel>
          <Select
            value={selectedResume}
            onChange={(e) => setSelectedResume(e.target.value)}
            label="Select Resume"
            disabled={loading || resumes.length === 0}
          >
            <MenuItem value="">No resume selected</MenuItem>
            {resumes.length > 0 ? (
              resumes.map((resume) => (
                <MenuItem key={resume.id} value={resume.id}>
                  {resume.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                No resumes available. Please upload a resume first.
              </MenuItem>
            )}
          </Select>
        </FormControl>

        {resumes.length === 0 && (
          <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
            You need to upload a resume before applying to jobs.
          </Alert>
        )}

        <TextField
          fullWidth
          margin="normal"
          label="Cover Letter (Optional)"
          multiline
          rows={4}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Why are you interested in this position? What makes you a good fit?"
          disabled={loading}
        />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleApply} 
          variant="contained" 
          disabled={loading || !job || resumes.length === 0}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? 'Applying...' : 'Submit Application'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationModal;
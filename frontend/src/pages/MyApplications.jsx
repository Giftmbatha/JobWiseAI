// frontend/src/pages/MyApplications.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Box,
  CircularProgress
} from '@mui/material';
import { applicationsApi } from '../api/applications';

const statusColors = {
  pending: 'default',
  reviewed: 'primary',
  interviewing: 'info',
  rejected: 'error',
  offered: 'warning',
  hired: 'success'
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await applicationsApi.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        My Applications
      </Typography>

      {applications.length === 0 ? (
        <Typography variant="body1">You haven't applied to any jobs yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {applications.map((app) => (
            <Grid item xs={12} key={app.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6">{app.job_title}</Typography>
                      <Typography color="textSecondary">{app.company_name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Applied on: {new Date(app.applied_at).toLocaleDateString()}
                      </Typography>
                      {app.resume_name && (
                        <Typography variant="body2">Resume: {app.resume_name}</Typography>
                      )}
                    </Box>
                    <Chip
                      label={app.status}
                      color={statusColors[app.status] || 'default'}
                    />
                  </Box>
                  {app.cover_letter && (
                    <Box mt={2}>
                      <Typography variant="subtitle2">Cover Letter:</Typography>
                      <Typography variant="body2">{app.cover_letter}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyApplications;
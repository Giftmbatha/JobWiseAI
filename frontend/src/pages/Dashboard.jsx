// src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" sx={{ color: 'primary.main', mb: 2 }}>
          Welcome, {user?.full_name || user?.email}!
        </Typography>
        <Typography variant="body1" sx={{ color: 'neutral.main', mb: 3 }}>
          You have successfully logged into JobWiseAI.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            component={Link}
            to="/"
            sx={{
              backgroundColor: '#1D503A',
              '&:hover': { backgroundColor: '#16412e' },
            }}
          >
            Browse Jobs
          </Button>
          <Button
            variant="outlined"
            onClick={logout}
            sx={{
              color: '#1D503A',
              borderColor: '#1D503A',
              '&:hover': {
                borderColor: '#16412e',
                backgroundColor: 'rgba(29, 80, 58, 0.04)',
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;
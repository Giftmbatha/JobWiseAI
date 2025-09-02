// src/components/ProtectedRoute.jsx - Prevent re-renders
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress style={{ color: '#1D503A' }} />
      </Box>
    );
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
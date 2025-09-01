// src/components/ProtectedRoute.jsx
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

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
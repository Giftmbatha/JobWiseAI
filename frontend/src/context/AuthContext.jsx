// src/context/AuthContext.jsx - Fix the infinite loop
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      getUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]); // Only depend on token

  const getUserProfile = async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data;
      setUser(userData);
      
      console.log('🔄 User profile loaded:', userData);
      console.log('👤 User role:', userData.role);
      
    } catch (error) {
      console.error('Failed to get user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    // getUserProfile will be called automatically by useEffect
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
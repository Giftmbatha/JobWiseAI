// src/api/auth.js
import axios from 'axios';


const API_BASE_URL = 'http://127.0.0.1:8000';  // Ensure this is correct

export const authAPI = {
  register: (userData) => 
    axios.post(`${API_BASE_URL}/auth/register`, userData),
  
  login: (credentials) => 
    axios.post(`${API_BASE_URL}/auth/login`, credentials),
  
  getMe: (token) => 
    axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  googleLogin: () => 
    window.location.href = `${API_BASE_URL}/auth/google`,
};

// Axios interceptor to add token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
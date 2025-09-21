import {api} from './auth';

export const resumesAPI = {
  uploadResume: (formData) => {
    return api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

   getUserResumes: async () => {
    try {
      const response = await api.get('/resumes');
      // Ensure we always return an array
      return {
        ...response,
        data: Array.isArray(response.data) ? response.data : []
      };
    } catch (error) {
      console.error('Error fetching resumes:', error);
      // Return empty array on error
      return { data: [] };
    }
  },

  getResume: (resumeId) => {
    return api.get(`/resumes/${resumeId}`);
  },

  downloadResume: (resumeId) => {
    return api.get(`/resumes/${resumeId}/download`, {
      responseType: 'blob', // Important for file downloads
    });
  },

  deleteResume: (resumeId) => {
    return api.delete(`/resumes/${resumeId}`);
  },

  getResumeContent: (resumeId) => {
    return api.get(`/resumes/${resumeId}/content`);
  },
};

// src/api/resumes.js - ensure proper response handling

import {api} from './auth';

const profileAPI = {
  getMyProfile: async () => {
    const response = await api.get('/users/profile/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    // Ensure skills is always an array
    const processedData = {
      ...profileData,
      skills: Array.isArray(profileData.skills) ? profileData.skills : [],
      education: Array.isArray(profileData.education) ? profileData.education : []
    };
    
    const response = await api.put('/users/profile', processedData);
    return response.data;
  },

  updateEmployerProfile: async (employerData) => {
    const response = await api.put('/users/profile/employer', employerData);
    return response.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAvatar: async () => {
    const response = await api.delete('/users/avatar');
    return response.data;
  },
};

export default profileAPI;
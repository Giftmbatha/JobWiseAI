import { api } from './auth';

export const resumesAPI = {
  uploadResume: (formData) => api.post('/resumes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  getUserResumes: () => api.get('/resumes'),
  
  deleteResume: (id) => api.delete(`/resumes/${id}`),
  
  getResume: (id) => api.get(`/resumes/${id}`)
};
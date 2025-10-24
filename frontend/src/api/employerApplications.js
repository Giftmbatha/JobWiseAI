import { api } from './auth';

export const employerApplicationsApi = {
  // Get all applications for employer's jobs
  getApplications: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.jobId) params.append('job_id', filters.jobId);
    if (filters.status) params.append('status', filters.status);
    if (filters.skip) params.append('skip', filters.skip);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/employer/applications?${params}`);
    return response.data;
  },

  // Get specific application
  getApplication: async (applicationId) => {
    const response = await api.get(`/employer/applications/${applicationId}`);
    return response.data;
  },

  // Update application status
  updateApplicationStatus: async (applicationId, status) => {
    const response = await api.patch(`/employer/applications/${applicationId}`, {
      status: status
    });
    return response.data;
  },

  // Get job application statistics
  getJobApplicationStats: async (jobId) => {
    const response = await api.get(`/employer/applications/jobs/${jobId}/stats`);
    return response.data;
  }
};
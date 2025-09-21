import { api } from './auth';
import qs from 'qs';

// Utility function for handling file downloads
const handleFileDownload = (response, defaultFileName = 'resume.pdf') => {
  const contentDisposition = response.headers['content-disposition'];
  let fileName = defaultFileName;
  
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
    if (fileNameMatch && fileNameMatch[1]) {
      fileName = fileNameMatch[1];
    }
  }

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return fileName;
};

// Utility function for handling API errors
const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.detail || error.response.data?.message || defaultMessage;
    throw new Error(message);
  } else if (error.request) {
    // Request was made but no response received
    throw new Error('Network error. Please check your connection.');
  } else {
    // Something else happened
    throw new Error(error.message || defaultMessage);
  }
};

export const employerAPI = {
  // Get employer's job postings
  getEmployerJobs: async () => {
    try {
      const response = await api.get('/employer/jobs');
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch employer jobs');
    }
  },

  // Get candidate recommendations for all jobs
  getBatchCandidateRecommendations: async (jobIds = null, topK = 5, minScore = 50) => {
    try {
      const params = { 
        top_k_per_job: topK,
        min_score: minScore
      };
      
      if (jobIds && jobIds.length > 0) {
        params.job_ids = jobIds;
      }
      
      const response = await api.get('/employer/candidates/batch-recommendations', {
        params,
        paramsSerializer: params => qs.stringify(params, { 
          arrayFormat: 'repeat',
          skipNulls: true 
        })
      });
      
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch batch candidate recommendations');
    }
  },

  // Get candidate recommendations for specific job
  getJobCandidateRecommendations: async (jobId, topK = 10, minScore = 50) => {
    try {
      const response = await api.get(`/employer/candidates/recommendations/${jobId}`, {
        params: { 
          top_k: topK, 
          min_score: minScore 
        },
        paramsSerializer: params => qs.stringify(params, { skipNulls: true })
      });
      
      return response;
    } catch (error) {
      handleApiError(error, `Failed to fetch candidate recommendations for job ${jobId}`);
    }
  },

  // Search candidates with advanced filters
  searchCandidates: async (filters = {}) => {
    try {
      const response = await api.get('/employer/candidates/search', {
        params: filters,
        paramsSerializer: params => qs.stringify(params, { 
          arrayFormat: 'repeat',
          skipNulls: true 
        })
      });
      
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to search candidates');
    }
  },

  // Download candidate resume
  downloadCandidateResume: async (resumeId, fileName = null) => {
    try {
      const response = await api.get(`/resumes/${resumeId}/download`, {
        responseType: 'blob'
      });
      
      const downloadedFileName = handleFileDownload(response, fileName || 'resume.pdf');
      return downloadedFileName;
    } catch (error) {
      handleApiError(error, 'Failed to download resume');
    }
  },

  // Contact candidate
  contactCandidate: async (candidateId, messageData) => {
    try {
      const response = await api.post(`/employer/candidates/contact/${candidateId}`, messageData);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to contact candidate');
    }
  },

  // Get candidate profile details
  getCandidateProfile: async (candidateId) => {
    try {
      const response = await api.get(`/employer/candidates/${candidateId}/profile`);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch candidate profile');
    }
  },

  // Save candidate to shortlist
  shortlistCandidate: async (candidateId, jobId = null) => {
    try {
      const response = await api.post('/employer/candidates/shortlist', {
        candidate_id: candidateId,
        job_id: jobId
      });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to shortlist candidate');
    }
  },

  // Get shortlisted candidates
  getShortlistedCandidates: async (jobId = null) => {
    try {
      const params = jobId ? { job_id: jobId } : {};
      const response = await api.get('/employer/candidates/shortlisted', { params });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch shortlisted candidates');
    }
  },

  // Remove candidate from shortlist
  removeFromShortlist: async (candidateId, jobId = null) => {
    try {
      const response = await api.delete('/employer/candidates/shortlist', {
        data: {
          candidate_id: candidateId,
          job_id: jobId
        }
      });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to remove candidate from shortlist');
    }
  },

  // Get candidate matching statistics
  getMatchingStats: async (jobId = null) => {
    try {
      const params = jobId ? { job_id: jobId } : {};
      const response = await api.get('/employer/candidates/stats', { params });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch matching statistics');
    }
  },

  // Bulk contact candidates
  bulkContactCandidates: async (candidateIds, messageData) => {
    try {
      const response = await api.post('/employer/candidates/bulk-contact', {
        candidate_ids: candidateIds,
        ...messageData
      });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to send bulk messages');
    }
  },

  // Get candidate communication history
  getCommunicationHistory: async (candidateId) => {
    try {
      const response = await api.get(`/employer/candidates/${candidateId}/communications`);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch communication history');
    }
  },

  // Update candidate status (e.g., contacted, interviewed, hired, rejected)
  updateCandidateStatus: async (candidateId, statusData) => {
    try {
      const response = await api.put(`/employer/candidates/${candidateId}/status`, statusData);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to update candidate status');
    }
  },

  // Get AI matching insights for a job
  getMatchingInsights: async (jobId) => {
    try {
      const response = await api.get(`/employer/jobs/${jobId}/matching-insights`);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch matching insights');
    }
  },

  // Export candidates data
  exportCandidates: async (filters = {}, format = 'csv') => {
    try {
      const response = await api.get('/employer/candidates/export', {
        params: { ...filters, format },
        responseType: 'blob'
      });
      
      const fileName = `candidates_export_${new Date().toISOString().split('T')[0]}.${format}`;
      handleFileDownload(response, fileName);
      return fileName;
    } catch (error) {
      handleApiError(error, 'Failed to export candidates data');
    }
  }
};

// Default export for convenience
export default employerAPI;
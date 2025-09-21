import { api } from './auth';

export const aiAPI = {
  getRecommendations: (params = {}) => 
    api.get('/ai/recommendations', { params })
      .then(response => response)
      .catch(error => {
        console.error('AI API Error:', error);
        throw error;
      }),
  
  matchJobsForResume: (resumeId, data = {}) => 
    api.post(`/ai/match/jobs-for-resume/${resumeId}`, data)
      .then(response => response)
      .catch(error => {
        console.error('AI Matching Error:', error);
        throw error;
      }),
  
  getHealth: () => api.get('/ai/health'),
  
  findSimilarJobs: (jobId, topK = 5) => 
    api.post(`/ai/similar-jobs`, { jobId, topK }),
};
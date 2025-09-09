import { api } from './auth';

export const aiAPI = {
  getRecommendations: () => api.get('/ai/recommendations'),
  
  matchJobsForResume: (resumeId, topK = 10) => 
    api.post(`/ai/match/jobs-for-resume/${resumeId}`, { topK }),
  
  matchCandidatesForJob: (jobId, topK = 10) => 
    api.post(`/ai/match/candidates-for-job/${jobId}`, { topK }),
  
  findSimilarJobs: (jobId, topK = 5) => 
    api.post(`/ai/similar-jobs`, { jobId, topK }),
};
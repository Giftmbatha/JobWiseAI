import { api } from './auth';

export const jobsAPI = {
  getJobs: (page = 1, pageSize = 10, search = '', location = '', fetchExternal = false) => 
    api.get('/jobs', {
      params: { page, page_size: pageSize, search, location, fetch_external: fetchExternal }
    }),
  
  getJob: (id) => api.get(`/jobs/${id}`),
  
  getEmployerJobs: () => api.get('/employer/jobs'),
  
  createJob: (jobData) => api.post('/jobs', jobData),
  
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  
  fetchAdzunaJobs: (searchTerm = '', location = 'za', resultsPerPage = 20) =>
    api.post('/jobs/fetch-adzuna', {
      params: { search_term: searchTerm, location, results_per_page: resultsPerPage }
    })
};
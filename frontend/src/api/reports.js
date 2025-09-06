import { api } from './auth';

export const reportsAPI = {
  getApplicationTrends: (days = 30) => 
    api.get(`/reports/trends?days=${days}`),
  
  getSkillsReport: () => api.get('/reports/skills'),
  
  getSalaryReport: () => api.get('/reports/salaries'),
  
  getAdminDashboard: () => api.get('/reports/admin/dashboard'),
  
  getEmployerOverview: () => api.get('/reports/employer/overview'),
};
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  BarChart,
  TrendingUp,
  AccountTree,
  Paid,
  AdminPanelSettings
} from '@mui/icons-material';
import { reportsAPI } from '../api/reports';

const ReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReport = async (reportType) => {
    setLoading(true);
    setError('');
    try {
      let response;
      switch (reportType) {
        case 'trends':
          response = await reportsAPI.getApplicationTrends();
          break;
        case 'skills':
          response = await reportsAPI.getSkillsReport();
          break;
        case 'salaries':
          response = await reportsAPI.getSalaryReport();
          break;
        case 'employer':
          response = await reportsAPI.getEmployerOverview();
          break;
        default:
          return;
      }
      setReports(prev => ({ ...prev, [reportType]: response.data }));
    } catch (error) {
      setError('Failed to load report: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    const reportTypes = ['trends', 'skills', 'salaries', 'employer'];
    if (!reports[reportTypes[newValue]]) {
      loadReport(reportTypes[newValue]);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = '#1D503A' }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon sx={{ color, mr: 2 }} />
          <Typography variant="h6" sx={{ color }}>{title}</Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>{value}</Typography>
        {subtitle && <Typography variant="body2" sx={{ color: '#484848' }}>{subtitle}</Typography>}
      </CardContent>
    </Card>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<TrendingUp />} label="Application Trends" />
          <Tab icon={<BarChart />} label="Skills Demand" />
          <Tab icon={<Paid />} label="Salary Reports" />
          <Tab icon={<AccountTree />} label="Employer Overview" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#1D503A' }} />
        </Box>
      ) : (
        <>
          {activeTab === 0 && reports.trends && (
            <Box>
              <Typography variant="h5" sx={{ color: '#1D503A', mb: 3 }}>
                Application Trends
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <StatCard
                    icon={TrendingUp}
                    title="Total Applications"
                    value={reports.trends.total_applications}
                    subtitle={reports.trends.time_period}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <StatCard
                    icon={BarChart}
                    title="Daily Average"
                    value={reports.trends.average_daily}
                    subtitle="Applications per day"
                  />
                </Grid>
              </Grid>
              <Box sx={{ textAlign: 'center' }}>
                <img 
                  src={reports.trends.chart} 
                  alt="Application Trends" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>
            </Box>
          )}

          {activeTab === 1 && reports.skills && (
            <Box>
              <Typography variant="h5" sx={{ color: '#1D503A', mb: 3 }}>
                In-Demand Skills
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <img 
                  src={reports.skills.chart} 
                  alt="Skills Demand" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>
              <Grid container spacing={2}>
                {Object.entries(reports.skills.top_skills || {}).map(([skill, count], index) => (
                  <Grid item xs={6} md={3} key={skill}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#1D503A' }}>
                          {count}
                        </Typography>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {skill}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {activeTab === 2 && reports.salaries && (
            <Box>
              <Typography variant="h5" sx={{ color: '#1D503A', mb: 3 }}>
                Salary Distribution
              </Typography>
              {reports.salaries.chart ? (
                <>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                      <StatCard
                        icon={Paid}
                        title="Average Salary"
                        value={`R${reports.salaries.average_salary?.toLocaleString()}`}
                        subtitle="Across all jobs"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <StatCard
                        icon={Paid}
                        title="Salary Range"
                        value={`R${reports.salaries.min_salary?.toLocaleString()} - R${reports.salaries.max_salary?.toLocaleString()}`}
                        subtitle="Min - Max"
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ textAlign: 'center' }}>
                    <img 
                      src={reports.salaries.chart} 
                      alt="Salary Distribution" 
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </Box>
                </>
              ) : (
                <Typography sx={{ color: '#484848', textAlign: 'center', py: 4 }}>
                  No salary data available yet
                </Typography>
              )}
            </Box>
          )}

          {activeTab === 3 && reports.employer && (
            <Box>
              <Typography variant="h5" sx={{ color: '#1D503A', mb: 3 }}>
                Employer Overview - {reports.employer.stats?.company_name}
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                  <StatCard
                    icon={AccountTree}
                    title="Total Jobs"
                    value={reports.employer.stats?.total_jobs}
                    subtitle="Posted jobs"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard
                    icon={BarChart}
                    title="Active Jobs"
                    value={reports.employer.stats?.active_jobs}
                    subtitle="Currently active"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard
                    icon={TrendingUp}
                    title="Total Applications"
                    value={reports.employer.stats?.total_applications}
                    subtitle="All time"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard
                    icon={Paid}
                    title="Avg per Job"
                    value={reports.employer.stats?.average_applications}
                    subtitle="Applications per job"
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ color: '#1D503A', mb: 2 }}>
                Recent Job Postings
              </Typography>
              <Grid container spacing={2}>
                {reports.employer.recent_jobs?.map((job) => (
                  <Grid item xs={12} md={6} key={job.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#1D503A' }}>
                          {job.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#484848' }}>
                          {job.company} • {job.location}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#484848' }}>
                          {job.salary_min && job.salary_max ? 
                            `R${job.salary_min.toLocaleString()} - R${job.salary_max.toLocaleString()}` : 
                            'Salary negotiable'
                          }
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default ReportsDashboard;
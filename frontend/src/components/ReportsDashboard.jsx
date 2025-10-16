import React, { useState, useEffect } from 'react';
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
  Alert,
  alpha,
  Fade,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  useTheme
} from '@mui/material';
import {
  BarChart,
  TrendingUp,
  AccountTree,
  Paid,
  AdminPanelSettings,
  AutoAwesome,
  Analytics,
  Psychology,
  Business,
  People,
  Work,
  LocationOn,
  Schedule,
  Download,
  Refresh
} from '@mui/icons-material';
import { reportsAPI } from '../api/reports';

const ReportsDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reportTypes = [
    { key: 'trends', label: 'Application Trends', icon: <TrendingUp />, color: '#1D503A' },
    { key: 'skills', label: 'Skills Demand', icon: <Psychology />, color: '#1976d2' },
    { key: 'salaries', label: 'Salary Reports', icon: <Paid />, color: '#ed6c02' },
    { key: 'employer', label: 'Employer Overview', icon: <Business />, color: '#2e7d32' }
  ];

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
    const reportType = reportTypes[newValue].key;
    if (!reports[reportType]) {
      loadReport(reportType);
    }
  };

  useEffect(() => {
    // Load initial report
    loadReport(reportTypes[0].key);
  }, []);

  const EnhancedStatCard = ({ icon: Icon, title, value, subtitle, color = '#1D503A', trend, trendValue }) => (
    <Fade in={true} timeout={800}>
      <Card sx={{ 
        height: '100%',
        borderRadius: 3,
        background: `linear-gradient(135deg, ${color}15, ${color}08)`,
        border: `1px solid ${color}20`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${color}20`
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ 
              display: 'inline-flex',
              p: 1.5,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${color}20, ${color}10)`,
              color: color
            }}>
              <Icon sx={{ fontSize: 28 }} />
            </Box>
            {trend && (
              <Chip 
                label={trendValue} 
                size="small" 
                color={trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'default'}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
          <Typography variant="h3" sx={{ 
            color: color, 
            fontWeight: 800, 
            mb: 1,
            fontSize: '2.5rem'
          }}>
            {value}
          </Typography>
          <Typography variant="h6" sx={{ color: '#484848', fontWeight: 600, mb: 1 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Fade>
  );

  const SkillCard = ({ skill, count, index, totalSkills }) => {
    const percentage = (count / totalSkills) * 100;
    const colors = ['#1D503A', '#1976d2', '#ed6c02', '#2e7d32', '#7b1fa2', '#d32f2f'];
    const color = colors[index % colors.length];
    
    return (
      <Fade in={true} timeout={index * 100}>
        <Card sx={{ 
          borderRadius: 3,
          border: `1px solid ${color}20`,
          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 20px ${color}15`
          }
        }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="h6" sx={{ 
                color: color, 
                fontWeight: 700,
                textTransform: 'capitalize'
              }}>
                {skill}
              </Typography>
              <Chip 
                label={count} 
                size="small" 
                sx={{ 
                  backgroundColor: `${color}20`, 
                  color: color,
                  fontWeight: 700
                }} 
              />
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={percentage} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: `${color}15`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                  borderRadius: 4
                }
              }} 
            />
            <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
              {percentage.toFixed(1)}% of total demand
            </Typography>
          </CardContent>
        </Card>
      </Fade>
    );
  };

  const JobCard = ({ job, index }) => (
    <Fade in={true} timeout={index * 100}>
      <Card sx={{ 
        borderRadius: 3,
        border: '1px solid rgba(29, 80, 58, 0.1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 20px rgba(29, 80, 58, 0.15)'
        }
      }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ color: '#1D503A', fontWeight: 700, mb: 1 }}>
            {job.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Business sx={{ fontSize: 16, color: '#666' }} />
            <Typography variant="body2" sx={{ color: '#484848', fontWeight: 500 }}>
              {job.company}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationOn sx={{ fontSize: 16, color: '#666' }} />
            <Typography variant="body2" sx={{ color: '#484848' }}>
              {job.location}
            </Typography>
          </Box>
          {job.salary_min && job.salary_max && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Paid sx={{ fontSize: 16, color: '#2e7d32' }} />
              <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                R{job.salary_min.toLocaleString()} - R{job.salary_max.toLocaleString()}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule sx={{ fontSize: 16, color: '#666' }} />
            <Typography variant="caption" sx={{ color: '#666' }}>
              Posted {new Date(job.created_at).toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );

  const currentReport = reportTypes[activeTab];

  return (
    <Paper sx={{ 
      p: 4, 
      borderRadius: 4,
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      boxShadow: '0 8px 32px rgba(29, 80, 58, 0.1)',
      border: '1px solid rgba(29, 80, 58, 0.08)'
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ 
            color: '#1D503A', 
            fontWeight: 800,
            background: 'linear-gradient(45deg, #1D503A, #2a6b4f)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            mb: 1
          }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', fontWeight: 400 }}>
            Data-driven insights for better hiring decisions
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => loadReport(currentReport.key)}
          disabled={loading}
          sx={{
            borderColor: '#1D503A',
            color: '#1D503A',
            fontWeight: 600,
            borderRadius: 3,
            px: 3
          }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Enhanced Tabs */}
      <Paper sx={{ 
        mb: 4, 
        borderRadius: 3,
        background: 'linear-gradient(135deg, #FAF5EE 0%, #f5f0e9 100%)',
        boxShadow: '0 4px 20px rgba(29, 80, 58, 0.08)'
      }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': { 
              minHeight: 64,
              fontWeight: 600,
              fontSize: '0.9rem',
              textTransform: 'none',
              '&.Mui-selected': {
                color: currentReport.color
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: currentReport.color,
              height: 3,
              borderRadius: 3
            }
          }}
        >
          {reportTypes.map((report, index) => (
            <Tab 
              key={report.key}
              icon={report.icon}
              label={report.label}
              sx={{ 
                color: activeTab === index ? report.color : '#666'
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)'
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12, flexDirection: 'column', gap: 3 }}>
          <CircularProgress 
            size={80} 
            thickness={4}
            sx={{ color: currentReport.color }} 
          />
          <Typography variant="h6" sx={{ color: currentReport.color, fontWeight: 600 }}>
            Loading {currentReport.label.toLowerCase()}...
          </Typography>
        </Box>
      ) : (
        <Fade in={true} timeout={500}>
          <Box>
            {/* Application Trends */}
            {activeTab === 0 && reports.trends && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Avatar sx={{ bgcolor: currentReport.color, width: 48, height: 48 }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ color: currentReport.color, fontWeight: 700 }}>
                      Application Trends
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                      Track application patterns and growth metrics
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={4}>
                    <EnhancedStatCard
                      icon={TrendingUp}
                      title="Total Applications"
                      value={reports.trends.total_applications?.toLocaleString() || '0'}
                      subtitle={reports.trends.time_period || 'All time'}
                      color={currentReport.color}
                      trend="up"
                      trendValue="+12%"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <EnhancedStatCard
                      icon={BarChart}
                      title="Daily Average"
                      value={reports.trends.average_daily?.toLocaleString() || '0'}
                      subtitle="Applications per day"
                      color="#1976d2"
                      trend="up"
                      trendValue="+5%"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <EnhancedStatCard
                      icon={AutoAwesome}
                      title="Success Rate"
                      value="24%"
                      subtitle="Interview to offer ratio"
                      color="#2e7d32"
                      trend="up"
                      trendValue="+3%"
                    />
                  </Grid>
                </Grid>

                {reports.trends.chart && (
                  <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                    <img 
                      src={reports.trends.chart} 
                      alt="Application Trends" 
                      style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
                    />
                  </Paper>
                )}
              </Box>
            )}

            {/* Skills Demand */}
            {activeTab === 1 && reports.skills && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Avatar sx={{ bgcolor: currentReport.color, width: 48, height: 48 }}>
                    <Psychology />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ color: currentReport.color, fontWeight: 700 }}>
                      Skills Demand Analysis
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                      Most requested skills in current job market
                    </Typography>
                  </Box>
                </Box>

                {reports.skills.chart && (
                  <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', mb: 4 }}>
                    <img 
                      src={reports.skills.chart} 
                      alt="Skills Demand" 
                      style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
                    />
                  </Paper>
                )}

                <Typography variant="h5" sx={{ color: currentReport.color, mb: 3, fontWeight: 700 }}>
                  Top In-Demand Skills
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(reports.skills.top_skills || {}).slice(0, 8).map(([skill, count], index) => (
                    <Grid item xs={12} sm={6} md={3} key={skill}>
                      <SkillCard 
                        skill={skill} 
                        count={count} 
                        index={index}
                        totalSkills={Object.values(reports.skills.top_skills || {}).reduce((a, b) => a + b, 0)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Salary Reports */}
            {activeTab === 2 && reports.salaries && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Avatar sx={{ bgcolor: currentReport.color, width: 48, height: 48 }}>
                    <Paid />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ color: currentReport.color, fontWeight: 700 }}>
                      Salary Intelligence
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                      Market salary trends and compensation insights
                    </Typography>
                  </Box>
                </Box>

                {reports.salaries.chart ? (
                  <>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={12} md={4}>
                        <EnhancedStatCard
                          icon={Paid}
                          title="Average Salary"
                          value={`R${reports.salaries.average_salary?.toLocaleString() || '0'}`}
                          subtitle="Across all positions"
                          color={currentReport.color}
                          trend="up"
                          trendValue="+8%"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <EnhancedStatCard
                          icon={TrendingUp}
                          title="Salary Range"
                          value={`R${reports.salaries.min_salary?.toLocaleString() || '0'}`}
                          subtitle={`Min - R${reports.salaries.max_salary?.toLocaleString() || '0'} Max`}
                          color="#1976d2"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <EnhancedStatCard
                          icon={AutoAwesome}
                          title="Top 10% Earn"
                          value={`R${Math.round((reports.salaries.average_salary || 0) * 1.5)?.toLocaleString()}`}
                          subtitle="90th percentile"
                          color="#2e7d32"
                        />
                      </Grid>
                    </Grid>
                    <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                      <img 
                        src={reports.salaries.chart} 
                        alt="Salary Distribution" 
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
                      />
                    </Paper>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Paid sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
                    <Typography variant="h5" sx={{ color: '#666', mb: 2, fontWeight: 600 }}>
                      No Salary Data Available
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#999' }}>
                      Salary reports will be available as more job data is collected
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Employer Overview */}
            {activeTab === 3 && reports.employer && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Avatar sx={{ bgcolor: currentReport.color, width: 48, height: 48 }}>
                    <Business />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ color: currentReport.color, fontWeight: 700 }}>
                      Employer Analytics
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                      {reports.employer.stats?.company_name || 'Company'} performance metrics
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={3}>
                    <EnhancedStatCard
                      icon={AccountTree}
                      title="Total Jobs"
                      value={reports.employer.stats?.total_jobs?.toLocaleString() || '0'}
                      subtitle="Posted positions"
                      color={currentReport.color}
                      trend="up"
                      trendValue="+15%"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <EnhancedStatCard
                      icon={BarChart}
                      title="Active Jobs"
                      value={reports.employer.stats?.active_jobs?.toLocaleString() || '0'}
                      subtitle="Currently listed"
                      color="#1976d2"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <EnhancedStatCard
                      icon={People}
                      title="Total Applications"
                      value={reports.employer.stats?.total_applications?.toLocaleString() || '0'}
                      subtitle="All time"
                      color="#ed6c02"
                      trend="up"
                      trendValue="+22%"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <EnhancedStatCard
                      icon={TrendingUp}
                      title="Avg per Job"
                      value={reports.employer.stats?.average_applications?.toLocaleString() || '0'}
                      subtitle="Applications per job"
                      color="#2e7d32"
                    />
                  </Grid>
                </Grid>

                <Typography variant="h5" sx={{ color: currentReport.color, mb: 3, fontWeight: 700 }}>
                  Recent Job Postings
                </Typography>
                <Grid container spacing={2}>
                  {reports.employer.recent_jobs?.slice(0, 4).map((job, index) => (
                    <Grid item xs={12} md={6} key={job.id}>
                      <JobCard job={job} index={index} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        </Fade>
      )}
    </Paper>
  );
};

export default ReportsDashboard;
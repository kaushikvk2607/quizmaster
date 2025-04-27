// components/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  InsertChartOutlined as LineChartIcon,
  Download as DownloadIcon,
  People as PeopleIcon,
  QuestionAnswer as QuestionIcon,
  Timer as TimeIcon,
  MoreVert as MoreIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  Refresh as RefreshIcon,
  Print
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { getUserQuizzes, getQuizAnalytics } from '../services/quizService';

const Analytics = ({ user }) => {
  const theme = useTheme();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuizId = queryParams.get('quizId');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(initialQuizId || '');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year', 'all'
  
  useEffect(() => {
    fetchUserQuizzes();
  }, [user]);
  
  useEffect(() => {
    if (selectedQuizId) {
      fetchAnalytics(selectedQuizId, dateRange);
    }
  }, [selectedQuizId, dateRange]);
  
  const fetchUserQuizzes = async () => {
    setLoading(true);
    try {
      const data = await getUserQuizzes(user.id);
      setQuizzes(data);
      
      // Set first quiz as selected if no quizId in URL
      if (!initialQuizId && data.length > 0) {
        setSelectedQuizId(data[0].id);
      }
      
      setError('');
    } catch (err) {
      setError('Failed to load your quizzes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAnalytics = async (quizId, range) => {
    setLoading(true);
    try {
      const data = await getQuizAnalytics(quizId, range);
      setAnalyticsData(data);
      setError('');
    } catch (err) {
      setError('Failed to load analytics data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuizChange = (event) => {
    setSelectedQuizId(event.target.value);
  };
  
  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };
  
  const handleRefresh = () => {
    fetchAnalytics(selectedQuizId, dateRange);
  };
  
  const handleDownloadCSV = () => {
    // In a real application, this would generate and download a CSV file
    alert("This would download analytics data as CSV");
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.main,
    theme.palette.info.main,
  ];
  
  if (loading && !analyticsData && quizzes.length === 0) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading analytics data...
        </Typography>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Quiz Analytics
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadCSV}
            disabled={!analyticsData}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
            disabled={!analyticsData}
          >
            Print
          </Button>
          <IconButton 
            color="primary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField
            select
            label="Select Quiz"
            value={selectedQuizId}
            onChange={handleQuizChange}
            sx={{ minWidth: 300 }}
            variant="outlined"
            disabled={loading || quizzes.length === 0}
            SelectProps={{
              MenuProps: { disableScrollLock: true }
            }}
          >
            {quizzes.map((quiz) => (
              <MenuItem key={quiz.id} value={quiz.id}>
                {quiz.title}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            select
            label="Date Range"
            value={dateRange}
            onChange={handleDateRangeChange}
            sx={{ minWidth: 150 }}
            variant="outlined"
            disabled={loading || !selectedQuizId}
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </TextField>
        </Box>
      </Paper>
      
      {quizzes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No quizzes found
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            You need to create a quiz first to view analytics.
          </Typography>
          <Button
            component={RouterLink}
            to="/create-quiz"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Create a Quiz
          </Button>
        </Paper>
      ) : !selectedQuizId ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">
            Select a quiz to view analytics
          </Typography>
        </Paper>
      ) : loading && !analyticsData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : analyticsData ? (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Total Attempts
                    </Typography>
                    <PeopleIcon color="primary" />
                  </Box>
                  <Typography variant="h4">
                    {analyticsData.totalAttempts}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {analyticsData.attemptsChange >= 0 ? (
                      <UpIcon fontSize="small" color="success" />
                    ) : (
                      <DownIcon fontSize="small" color="error" />
                    )}
                    <Typography variant="body2" color={analyticsData.attemptsChange >= 0 ? 'success.main' : 'error.main'}>
                      {Math.abs(analyticsData.attemptsChange)}% from previous period
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Average Score
                    </Typography>
                    <BarChartIcon color="secondary" />
                  </Box>
                  <Typography variant="h4">
                    {analyticsData.averageScore}%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {analyticsData.scoreChange >= 0 ? (
                      <UpIcon fontSize="small" color="success" />
                    ) : (
                      <DownIcon fontSize="small" color="error" />
                    )}
                    <Typography variant="body2" color={analyticsData.scoreChange >= 0 ? 'success.main' : 'error.main'}>
                      {Math.abs(analyticsData.scoreChange)}% from previous period
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Pass Rate
                    </Typography>
                    <PieChartIcon color="success" />
                  </Box>
                  <Typography variant="h4">
                    {analyticsData.passRate}%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {analyticsData.passRateChange >= 0 ? (
                      <UpIcon fontSize="small" color="success" />
                    ) : (
                      <DownIcon fontSize="small" color="error" />
                    )}
                    <Typography variant="body2" color={analyticsData.passRateChange >= 0 ? 'success.main' : 'error.main'}>
                      {Math.abs(analyticsData.passRateChange)}% from previous period
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Avg. Completion Time
                    </Typography>
                    <TimeIcon color="warning" />
                  </Box>
                  <Typography variant="h4">
                    {Math.floor(analyticsData.averageTime / 60)}m {analyticsData.averageTime % 60}s
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {analyticsData.timeChange <= 0 ? (
                      <UpIcon fontSize="small" color="success" />
                    ) : (
                      <DownIcon fontSize="small" color="error" />
                    )}
                    <Typography variant="body2" color={analyticsData.timeChange <= 0 ? 'success.main' : 'error.main'}>
                      {Math.abs(analyticsData.timeChange)}% from previous period
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Charts */}
          <Grid container spacing={4}>
            {/* Attempts Over Time Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Attempts Over Time
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analyticsData.attemptsOverTime}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="attempts" stroke={theme.palette.primary.main} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Score Distribution Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Score Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData.scoreDistribution}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="count" fill={theme.palette.primary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Question Performance Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Question Performance
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData.questionPerformance}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="questionNumber" width={100} />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="correctPercentage" fill={theme.palette.success.main} name="Correct %" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Pass/Fail Ratio Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Pass/Fail Ratio
                </Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="80%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pass', value: analyticsData.passCount },
                          { name: 'Fail', value: analyticsData.failCount }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Pass', value: analyticsData.passCount },
                          { name: 'Fail', value: analyticsData.failCount }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? theme.palette.success.main : theme.palette.error.main} />
                        ))}
                      </Pie>
                      <Legend />
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Detailed Question Analysis */}
          <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Question Analysis
            </Typography>
            <TableContainer>
              <Table aria-label="question analysis table">
                <TableHead>
                  <TableRow>
                    <TableCell>Question</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Attempts</TableCell>
                    <TableCell align="right">Correct</TableCell>
                    <TableCell align="right">Success Rate</TableCell>
                    <TableCell align="right">Avg. Time (s)</TableCell>
                    <TableCell align="center">Difficulty</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.questionAnalysis.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>
                        <Tooltip title={question.text}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {question.text}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={question.type === 'multiple' ? 'Multiple Choice' : 
                                question.type === 'checkbox' ? 'Multiple Answer' : 'True/False'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">{question.attempts}</TableCell>
                      <TableCell align="right">{question.correctCount}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {question.successRate}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={question.successRate}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                            color={
                              question.successRate > 70 ? 'success' : 
                              question.successRate > 40 ? 'warning' : 'error'
                            }
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right">{question.averageTime.toFixed(1)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={
                            question.successRate > 70 ? 'Easy' : 
                            question.successRate > 40 ? 'Medium' : 'Hard'
                          }
                          color={
                            question.successRate > 70 ? 'success' : 
                            question.successRate > 40 ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">
            No analytics data available for this quiz
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Analytics will be available once people start taking your quiz
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Analytics;
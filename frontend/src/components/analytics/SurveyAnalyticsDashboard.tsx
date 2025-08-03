import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Button,
  Chip,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

import { LiveMetricsCard } from './LiveMetricsCard';
import { ResponseTrendChart } from './ResponseTrendChart';
import { CompletionRateChart } from './CompletionRateChart';
import { QuestionAnalyticsGrid } from './QuestionAnalyticsGrid';
import { GeographicDistribution } from './GeographicDistribution';
import { DeviceAnalytics } from './DeviceAnalytics';
import { RealTimeActivity } from './RealTimeActivity';
import { DropoffAnalysis } from './DropoffAnalysis';
import { ResponseTimeAnalysis } from './ResponseTimeAnalysis';
import { ExportDialog } from './ExportDialog';
import { ShareDialog } from './ShareDialog';

import { useSurveyAnalytics } from '../../hooks/useSurveyAnalytics';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Survey } from '../../types/survey';

interface SurveyAnalyticsDashboardProps {
  survey: Survey;
  onClose?: () => void;
}

export const SurveyAnalyticsDashboard: React.FC<SurveyAnalyticsDashboardProps> = ({
  survey,
  onClose
}) => {
  const [refreshInterval, setRefreshInterval] = useState<number>(5); // seconds
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [fullscreenChart, setFullscreenChart] = useState<string | null>(null);

  const {
    analytics,
    liveResults,
    chartData,
    trendData,
    loading,
    error,
    lastUpdated,
    refreshAnalytics,
    setTimeRange: updateTimeRange
  } = useSurveyAnalytics(survey.id!);

  // WebSocket connection for real-time updates
  const {
    isConnected,
    connectionStatus,
    lastMessage
  } = useWebSocket(`/ws/surveys/${survey.id}/analytics`, {
    enabled: autoRefresh,
    onMessage: (data) => {
      // Handle real-time analytics updates
      if (data.type === 'analytics_updated') {
        refreshAnalytics();
      }
    }
  });

  // Presenter mode WebSocket connection
  const {
    isConnected: isPresenterConnected,
    sendMessage: sendPresenterMessage
  } = useWebSocket(`/ws/surveys/${survey.id}/presenter`, {
    enabled: isPresenterMode,
    onMessage: (data) => {
      // Handle presenter control messages
      if (data.type === 'presenter_command') {
        handlePresenterCommand(data);
      }
    }
  });

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshAnalytics();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshAnalytics]);

  // Handle time range changes
  const handleTimeRangeChange = useCallback((newTimeRange: string) => {
    setTimeRange(newTimeRange);
    updateTimeRange(newTimeRange);
  }, [updateTimeRange]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  // Handle export
  const handleExport = useCallback(() => {
    setExportDialogOpen(true);
  }, []);

  // Handle share
  const handleShare = useCallback(() => {
    setShareDialogOpen(true);
  }, []);

  // Calculate key metrics
  const keyMetrics = analytics ? {
    totalResponses: analytics.totalResponses,
    completionRate: analytics.completionRate,
    averageTime: analytics.averageCompletionTime,
    activeUsers: liveResults?.realTimeMetrics?.activeUsers || 0,
    responsesPerMinute: liveResults?.realTimeMetrics?.responsesPerMinute || 0
  } : null;

  if (loading && !analytics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading analytics dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              Survey Analytics
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {survey.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mt={1}>
              <Chip
                icon={isConnected ? <VisibilityIcon /> : <TimerIcon />}
                label={isConnected ? 'Live Updates' : 'Offline'}
                color={isConnected ? 'success' : 'default'}
                size="small"
              />
              {lastUpdated && (
                <Typography variant="caption" color="textSecondary">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Typography>
              )}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {/* Time Range Selector */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value="1h">Last Hour</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>

            {/* Auto-refresh Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  size="small"
                />
              }
              label="Auto-refresh"
            />

            {/* Action Buttons */}
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export Data">
              <IconButton onClick={handleExport}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Share Dashboard">
              <IconButton onClick={handleShare}>
                <ShareIcon />
              </IconButton>
            </Tooltip>

            {onClose && (
              <Button variant="outlined" onClick={onClose}>
                Close
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Key Metrics Cards */}
      {keyMetrics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <LiveMetricsCard
              title="Total Responses"
              value={keyMetrics.totalResponses}
              icon={<PeopleIcon />}
              color="#2196F3"
              trend={analytics?.responseTrends?.growth}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <LiveMetricsCard
              title="Completion Rate"
              value={`${keyMetrics.completionRate.toFixed(1)}%`}
              icon={<AssessmentIcon />}
              color="#4CAF50"
              trend={analytics?.completionTrends?.growth}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <LiveMetricsCard
              title="Avg. Time"
              value={`${Math.round(keyMetrics.averageTime / 60)}m`}
              icon={<TimerIcon />}
              color="#FF9800"
              subtitle="minutes"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <LiveMetricsCard
              title="Active Users"
              value={keyMetrics.activeUsers}
              icon={<VisibilityIcon />}
              color="#9C27B0"
              isLive={true}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <LiveMetricsCard
              title="Responses/Min"
              value={keyMetrics.responsesPerMinute.toFixed(1)}
              icon={<SpeedIcon />}
              color="#F44336"
              isLive={true}
            />
          </Grid>
        </Grid>
      )}

      {/* Main Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Response Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader
              title="Response Trends"
              action={
                <IconButton
                  onClick={() => setFullscreenChart('response-trend')}
                  size="small"
                >
                  <FullscreenIcon />
                </IconButton>
              }
            />
            <CardContent>
              <ResponseTrendChart
                data={chartData?.responseTrend}
                timeRange={timeRange}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Completion Rate Chart */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardHeader
              title="Completion Rate"
              action={
                <IconButton
                  onClick={() => setFullscreenChart('completion-rate')}
                  size="small"
                >
                  <FullscreenIcon />
                </IconButton>
              }
            />
            <CardContent>
              <CompletionRateChart
                data={analytics?.overallStats}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Secondary Analytics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Real-time Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Real-time Activity" />
            <CardContent>
              <RealTimeActivity
                activities={liveResults?.recentActivity || []}
                isLive={isConnected}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Device Analytics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Device Distribution" />
            <CardContent>
              <DeviceAnalytics
                data={analytics?.demographics?.deviceTypes}
                height={250}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Question Analytics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Question Analytics"
              subheader="Response rates and performance by question"
            />
            <CardContent>
              <QuestionAnalyticsGrid
                questions={liveResults?.questionResults}
                onQuestionClick={(questionId) => {
                  // Handle question drill-down
                  console.log('Question clicked:', questionId);
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Advanced Analytics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Geographic Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Geographic Distribution" />
            <CardContent>
              <GeographicDistribution
                data={analytics?.demographics?.locations}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Response Time Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Response Time Analysis" />
            <CardContent>
              <ResponseTimeAnalysis
                data={analytics?.demographics?.responseTimes}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dropoff Analysis */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Dropoff Analysis"
              subheader="Identify where respondents are leaving the survey"
            />
            <CardContent>
              <DropoffAnalysis
                data={trendData?.completionTrends?.dropoffPoints}
                questions={liveResults?.questionResults}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        surveyId={survey.id!}
        surveyTitle={survey.title}
      />

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        surveyId={survey.id!}
        dashboardUrl={window.location.href}
      />
    </Container>
  );
};

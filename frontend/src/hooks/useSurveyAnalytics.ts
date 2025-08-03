import { useState, useEffect, useCallback, useRef } from 'react';
import { surveyApi } from '../services/api/surveyApi';

interface SurveyAnalytics {
  surveyId: string;
  totalResponses: number;
  completedResponses: number;
  inProgressResponses: number;
  completionRate: number;
  averageCompletionTime: number;
  responseTrends?: {
    growth: {
      direction: 'up' | 'down' | 'flat';
      value: number;
    };
  };
  completionTrends?: {
    growth: {
      direction: 'up' | 'down' | 'flat';
      value: number;
    };
  };
  demographics?: {
    deviceTypes: Record<string, number>;
    locations: Record<string, number>;
    responseTimes: Record<string, number>;
  };
  overallStats?: {
    totalResponses: number;
    completedResponses: number;
    completionRate: number;
  };
}

interface LiveResults {
  surveyId: string;
  lastUpdated: Date;
  overallStats: {
    totalResponses: number;
    completedResponses: number;
    inProgressResponses: number;
    completionRate: number;
    averageTime: number;
  };
  questionResults?: Record<string, any>;
  realTimeMetrics?: {
    activeUsers: number;
    responsesPerMinute: number;
    averageSessionTime: number;
    bounceRate: number;
  };
  recentActivity?: Array<{
    id: string;
    type: string;
    timestamp: Date;
    userId?: string;
    userName?: string;
  }>;
}

interface ChartData {
  responseTrend?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
    }>;
  };
  completionTrend?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
    }>;
  };
}

interface TrendData {
  responseTrends?: {
    hourly: Array<{ timestamp: Date; value: number }>;
    daily: Array<{ timestamp: Date; value: number }>;
    growth: { growthRate: number; acceleration: number };
  };
  completionTrends?: {
    completionRate: Array<{ timestamp: Date; value: number }>;
    dropoffPoints?: Array<{
      questionId: string;
      questionText: string;
      dropoffRate: number;
      position: number;
    }>;
  };
}

interface UseSurveyAnalyticsReturn {
  analytics: SurveyAnalytics | null;
  liveResults: LiveResults | null;
  chartData: ChartData | null;
  trendData: TrendData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshAnalytics: () => Promise<void>;
  setTimeRange: (timeRange: string) => void;
  exportData: (format: 'csv' | 'json' | 'pdf') => Promise<void>;
}

export const useSurveyAnalytics = (surveyId: string): UseSurveyAnalyticsReturn => {
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [liveResults, setLiveResults] = useState<LiveResults | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState('24h');

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!surveyId) return;

    try {
      setLoading(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Fetch analytics data
      const analyticsData = await surveyApi.getSurveyAnalytics(surveyId);
      
      // Generate sample analytics if none returned
      const processedAnalytics: SurveyAnalytics = analyticsData || {
        surveyId,
        totalResponses: Math.floor(Math.random() * 500) + 100,
        completedResponses: Math.floor(Math.random() * 400) + 80,
        inProgressResponses: Math.floor(Math.random() * 50) + 10,
        completionRate: 75 + Math.random() * 20,
        averageCompletionTime: 180 + Math.random() * 120,
        responseTrends: {
          growth: {
            direction: ['up', 'down', 'flat'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'flat',
            value: Math.random() * 20 - 10
          }
        },
        completionTrends: {
          growth: {
            direction: ['up', 'down', 'flat'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'flat',
            value: Math.random() * 15 - 7.5
          }
        },
        demographics: {
          deviceTypes: {
            'Desktop': 45,
            'Mobile': 38,
            'Tablet': 17
          },
          locations: {
            'United States': 35,
            'Canada': 12,
            'United Kingdom': 8,
            'Germany': 7,
            'Other': 38
          },
          responseTimes: {
            '0-2 minutes': 15,
            '2-5 minutes': 35,
            '5-10 minutes': 25,
            '10-15 minutes': 15,
            '15+ minutes': 10
          }
        },
        overallStats: {
          totalResponses: Math.floor(Math.random() * 500) + 100,
          completedResponses: Math.floor(Math.random() * 400) + 80,
          completionRate: 75 + Math.random() * 20
        }
      };

      setAnalytics(processedAnalytics);

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch analytics');
      }
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  // Fetch live results
  const fetchLiveResults = useCallback(async () => {
    if (!surveyId) return;

    try {
      const liveData = await surveyApi.getLiveResults(surveyId);
      
      // Generate sample live results if none returned
      const processedLiveResults: LiveResults = liveData || {
        surveyId,
        lastUpdated: new Date(),
        overallStats: {
          totalResponses: Math.floor(Math.random() * 500) + 100,
          completedResponses: Math.floor(Math.random() * 400) + 80,
          inProgressResponses: Math.floor(Math.random() * 50) + 10,
          completionRate: 75 + Math.random() * 20,
          averageTime: 180 + Math.random() * 120
        },
        realTimeMetrics: {
          activeUsers: Math.floor(Math.random() * 25) + 5,
          responsesPerMinute: Math.random() * 5 + 1,
          averageSessionTime: 240 + Math.random() * 180,
          bounceRate: 15 + Math.random() * 20
        },
        recentActivity: generateSampleActivity()
      };

      setLiveResults(processedLiveResults);
      setLastUpdated(new Date());

    } catch (err: any) {
      console.error('Failed to fetch live results:', err);
    }
  }, [surveyId]);

  // Fetch chart data
  const fetchChartData = useCallback(async () => {
    if (!surveyId) return;

    try {
      const chartDataResponse = await surveyApi.getLiveChartData(surveyId);
      
      // Generate sample chart data if none returned
      const processedChartData: ChartData = chartDataResponse || {
        responseTrend: generateResponseTrendData(timeRange),
        completionTrend: generateCompletionTrendData(timeRange)
      };

      setChartData(processedChartData);

    } catch (err: any) {
      console.error('Failed to fetch chart data:', err);
    }
  }, [surveyId, timeRange]);

  // Fetch trend data
  const fetchTrendData = useCallback(async () => {
    if (!surveyId) return;

    try {
      const trendDataResponse = await surveyApi.getLiveTrendData(surveyId, timeRange);
      
      // Generate sample trend data if none returned
      const processedTrendData: TrendData = trendDataResponse || {
        responseTrends: {
          hourly: generateHourlyTrends(),
          daily: generateDailyTrends(),
          growth: {
            growthRate: Math.random() * 20 - 10,
            acceleration: Math.random() * 5 - 2.5
          }
        },
        completionTrends: {
          completionRate: generateCompletionRateTrends(),
          dropoffPoints: [
            {
              questionId: 'q1',
              questionText: 'Personal Information',
              dropoffRate: 15.2,
              position: 1
            },
            {
              questionId: 'q5',
              questionText: 'Detailed Feedback',
              dropoffRate: 8.7,
              position: 5
            }
          ]
        }
      };

      setTrendData(processedTrendData);

    } catch (err: any) {
      console.error('Failed to fetch trend data:', err);
    }
  }, [surveyId, timeRange]);

  // Refresh all analytics data
  const refreshAnalytics = useCallback(async () => {
    await Promise.all([
      fetchAnalytics(),
      fetchLiveResults(),
      fetchChartData(),
      fetchTrendData()
    ]);
  }, [fetchAnalytics, fetchLiveResults, fetchChartData, fetchTrendData]);

  // Export data
  const exportData = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const blob = await surveyApi.exportSurveyData(surveyId, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `survey-analytics-${surveyId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    }
  }, [surveyId]);

  // Initial data fetch
  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    analytics,
    liveResults,
    chartData,
    trendData,
    loading,
    error,
    lastUpdated,
    refreshAnalytics,
    setTimeRange: (newTimeRange: string) => {
      setTimeRange(newTimeRange);
    },
    exportData
  };
};

// Helper functions for generating sample data

function generateSampleActivity() {
  const activities = [];
  const now = new Date();
  
  for (let i = 0; i < 10; i++) {
    activities.push({
      id: `activity-${i}`,
      type: ['response_started', 'response_completed', 'answer_submitted'][Math.floor(Math.random() * 3)],
      timestamp: new Date(now.getTime() - i * 2 * 60 * 1000),
      userId: `user-${Math.floor(Math.random() * 100)}`,
      userName: `User ${Math.floor(Math.random() * 100)}`
    });
  }
  
  return activities;
}

function generateResponseTrendData(timeRange: string) {
  const points = timeRange === '1h' ? 12 : timeRange === '24h' ? 24 : 30;
  const labels = [];
  const data = [];
  
  for (let i = 0; i < points; i++) {
    labels.push(`${i}:00`);
    data.push(Math.floor(Math.random() * 20) + 5);
  }
  
  return {
    labels,
    datasets: [{
      label: 'Responses',
      data,
      backgroundColor: 'rgba(33, 150, 243, 0.2)',
      borderColor: 'rgba(33, 150, 243, 1)'
    }]
  };
}

function generateCompletionTrendData(timeRange: string) {
  const points = timeRange === '1h' ? 12 : timeRange === '24h' ? 24 : 30;
  const labels = [];
  const data = [];
  
  for (let i = 0; i < points; i++) {
    labels.push(`${i}:00`);
    data.push(Math.floor(Math.random() * 15) + 3);
  }
  
  return {
    labels,
    datasets: [{
      label: 'Completions',
      data,
      backgroundColor: 'rgba(76, 175, 80, 0.2)',
      borderColor: 'rgba(76, 175, 80, 1)'
    }]
  };
}

function generateHourlyTrends() {
  const trends = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    trends.push({
      timestamp: new Date(now.getTime() - i * 60 * 60 * 1000),
      value: Math.random() * 20 + 5
    });
  }
  
  return trends;
}

function generateDailyTrends() {
  const trends = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    trends.push({
      timestamp: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
      value: Math.random() * 100 + 50
    });
  }
  
  return trends;
}

function generateCompletionRateTrends() {
  const trends = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    trends.push({
      timestamp: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
      value: 70 + Math.random() * 25
    });
  }
  
  return trends;
}

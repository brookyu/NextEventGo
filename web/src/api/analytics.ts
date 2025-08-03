import { apiClient } from './client';

// Analytics Types
export interface AnalyticsOverview {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalReads: number;
  uniqueUsers: number;
  avgReadTime: number;
  readingRate: number;
  topPerformingArticles: TopArticle[];
  recentActivity: ActivityItem[];
}

export interface TopArticle {
  id: string;
  title: string;
  author: string;
  views: number;
  reads: number;
  readingRate: number;
  publishedAt: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface ActivityItem {
  id: string;
  type: 'view' | 'read' | 'publish' | 'create';
  articleId: string;
  articleTitle: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DailyStats {
  date: string;
  views: number;
  reads: number;
  uniqueUsers: number;
  avgReadTime: number;
  completionRate: number;
  newArticles: number;
  publishedArticles: number;
}

export interface GeographicStats {
  country: string;
  city?: string;
  count: number;
  percentage: number;
  avgReadTime: number;
}

export interface DeviceStats {
  deviceType: string;
  platform: string;
  browser?: string;
  count: number;
  percentage: number;
  avgReadTime: number;
}

export interface ReferrerStats {
  referrer: string;
  domain: string;
  count: number;
  percentage: number;
  conversionRate: number;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  articleCount: number;
  totalViews: number;
  totalReads: number;
  avgReadTime: number;
  readingRate: number;
  color?: string;
}

export interface AuthorStats {
  author: string;
  articleCount: number;
  totalViews: number;
  totalReads: number;
  avgReadTime: number;
  readingRate: number;
  publishedCount: number;
  draftCount: number;
}

export interface TimeSeriesData {
  timestamp: string;
  views: number;
  reads: number;
  uniqueUsers: number;
}

export interface EngagementMetrics {
  bounceRate: number;
  avgSessionDuration: number;
  pagesPerSession: number;
  returnVisitorRate: number;
  socialShares: number;
  comments: number;
  bookmarks: number;
}

export interface ContentPerformance {
  articleId: string;
  title: string;
  wordCount: number;
  readingTime: number;
  views: number;
  reads: number;
  avgReadDuration: number;
  scrollDepth: number;
  exitRate: number;
  shareCount: number;
  engagementScore: number;
}

export interface AnalyticsFilter {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  author?: string;
  articleId?: string;
  country?: string;
  deviceType?: string;
  referrer?: string;
}

export interface AnalyticsPeriod {
  period: 'today' | '7days' | '30days' | '90days' | '1year' | 'custom';
  startDate?: string;
  endDate?: string;
}

// Analytics API functions
export const analyticsApi = {
  // Overview and Dashboard
  getOverview: (period: AnalyticsPeriod): Promise<AnalyticsOverview> =>
    apiClient.get('/analytics/overview', { params: period }),

  getDailyStats: (period: AnalyticsPeriod, filter?: AnalyticsFilter): Promise<DailyStats[]> =>
    apiClient.get('/analytics/daily', { params: { ...period, ...filter } }),

  getHourlyStats: (period: AnalyticsPeriod, filter?: AnalyticsFilter): Promise<TimeSeriesData[]> =>
    apiClient.get('/analytics/hourly', { params: { ...period, ...filter } }),

  // Geographic Analytics
  getGeographicStats: (period: AnalyticsPeriod, filter?: AnalyticsFilter): Promise<GeographicStats[]> =>
    apiClient.get('/analytics/geographic', { params: { ...period, ...filter } }),

  getCountryStats: (period: AnalyticsPeriod): Promise<GeographicStats[]> =>
    apiClient.get('/analytics/countries', { params: period }),

  getCityStats: (country: string, period: AnalyticsPeriod): Promise<GeographicStats[]> =>
    apiClient.get('/analytics/cities', { params: { country, ...period } }),

  // Device and Platform Analytics
  getDeviceStats: (period: AnalyticsPeriod, filter?: AnalyticsFilter): Promise<DeviceStats[]> =>
    apiClient.get('/analytics/devices', { params: { ...period, ...filter } }),

  getPlatformStats: (period: AnalyticsPeriod): Promise<DeviceStats[]> =>
    apiClient.get('/analytics/platforms', { params: period }),

  getBrowserStats: (period: AnalyticsPeriod): Promise<DeviceStats[]> =>
    apiClient.get('/analytics/browsers', { params: period }),

  // Traffic Sources
  getReferrerStats: (period: AnalyticsPeriod, filter?: AnalyticsFilter): Promise<ReferrerStats[]> =>
    apiClient.get('/analytics/referrers', { params: { ...period, ...filter } }),

  getTopReferrers: (period: AnalyticsPeriod, limit?: number): Promise<ReferrerStats[]> =>
    apiClient.get('/analytics/top-referrers', { params: { ...period, limit } }),

  // Content Analytics
  getCategoryStats: (period: AnalyticsPeriod): Promise<CategoryStats[]> =>
    apiClient.get('/analytics/categories', { params: period }),

  getAuthorStats: (period: AnalyticsPeriod): Promise<AuthorStats[]> =>
    apiClient.get('/analytics/authors', { params: period }),

  getContentPerformance: (period: AnalyticsPeriod, filter?: AnalyticsFilter): Promise<ContentPerformance[]> =>
    apiClient.get('/analytics/content-performance', { params: { ...period, ...filter } }),

  getTopPerformingArticles: (period: AnalyticsPeriod, metric: 'views' | 'reads' | 'engagement', limit?: number): Promise<TopArticle[]> =>
    apiClient.get('/analytics/top-articles', { params: { ...period, metric, limit } }),

  // Engagement Analytics
  getEngagementMetrics: (period: AnalyticsPeriod, filter?: AnalyticsFilter): Promise<EngagementMetrics> =>
    apiClient.get('/analytics/engagement', { params: { ...period, ...filter } }),

  getReadingBehavior: (period: AnalyticsPeriod, filter?: AnalyticsFilter): Promise<{
    avgReadTime: number;
    completionRate: number;
    scrollDepthDistribution: Array<{ depth: number; count: number }>;
    readingTimeDistribution: Array<{ duration: number; count: number }>;
  }> =>
    apiClient.get('/analytics/reading-behavior', { params: { ...period, ...filter } }),

  // Real-time Analytics
  getRealTimeStats: (): Promise<{
    activeUsers: number;
    currentViews: number;
    topPages: Array<{ articleId: string; title: string; views: number }>;
    recentActivity: ActivityItem[];
  }> =>
    apiClient.get('/analytics/realtime'),

  // Export and Reporting
  exportAnalytics: (period: AnalyticsPeriod, filter?: AnalyticsFilter, format: 'csv' | 'xlsx' | 'pdf' = 'csv'): Promise<Blob> =>
    apiClient.get('/analytics/export', { 
      params: { ...period, ...filter, format },
      responseType: 'blob'
    }),

  generateReport: (period: AnalyticsPeriod, filter?: AnalyticsFilter, reportType: 'summary' | 'detailed' | 'executive' = 'summary'): Promise<{
    reportId: string;
    downloadUrl: string;
    generatedAt: string;
  }> =>
    apiClient.post('/analytics/reports', { period, filter, reportType }),

  // Comparison Analytics
  compareArticles: (articleIds: string[], period: AnalyticsPeriod): Promise<{
    articles: Array<{
      id: string;
      title: string;
      metrics: {
        views: number;
        reads: number;
        avgReadTime: number;
        completionRate: number;
        engagementScore: number;
      };
    }>;
    comparison: {
      bestPerforming: string;
      metrics: Record<string, { winner: string; difference: number }>;
    };
  }> =>
    apiClient.post('/analytics/compare', { articleIds, period }),

  comparePeriods: (currentPeriod: AnalyticsPeriod, previousPeriod: AnalyticsPeriod, filter?: AnalyticsFilter): Promise<{
    current: AnalyticsOverview;
    previous: AnalyticsOverview;
    changes: Record<string, { value: number; percentage: number; trend: 'up' | 'down' | 'stable' }>;
  }> =>
    apiClient.post('/analytics/compare-periods', { currentPeriod, previousPeriod, filter }),
};

// Utility functions
export const formatAnalyticsNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatReadingTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${Math.round(remainingSeconds)}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

export const calculateTrend = (current: number, previous: number): { value: number; percentage: number; trend: 'up' | 'down' | 'stable' } => {
  if (previous === 0) {
    return { value: current, percentage: current > 0 ? 100 : 0, trend: current > 0 ? 'up' : 'stable' };
  }
  
  const difference = current - previous;
  const percentage = (difference / previous) * 100;
  
  return {
    value: difference,
    percentage: Math.abs(percentage),
    trend: percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable'
  };
};

export const getAnalyticsPeriodDates = (period: AnalyticsPeriod): { startDate: string; endDate: string } => {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  
  let startDate: string;
  
  switch (period.period) {
    case 'today':
      startDate = endDate;
      break;
    case '7days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case '30days':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case '90days':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case '1year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case 'custom':
      startDate = period.startDate || endDate;
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  }
  
  return { startDate, endDate: period.endDate || endDate };
};

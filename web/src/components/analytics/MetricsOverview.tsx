import React from 'react';
import {
  Eye,
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  Send,
  Edit,
  Minus,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { type AnalyticsOverview, type AnalyticsPeriod, formatAnalyticsNumber, formatReadingTime } from '@/api/analytics';

interface MetricsOverviewProps {
  overview?: AnalyticsOverview;
  isLoading: boolean;
  period: AnalyticsPeriod;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    percentage: number;
    direction: 'up' | 'down' | 'stable';
  };
  subtitle?: string;
  isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />;
      case 'down':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="text-gray-400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          {typeof value === 'number' ? formatAnalyticsNumber(value) : value}
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <Badge
              variant="outline"
              className={`flex items-center gap-1 ${getTrendColor()} border-current`}
            >
              {getTrendIcon()}
              {trend.percentage.toFixed(1)}%
            </Badge>
          )}
          
          {subtitle && (
            <span className="text-gray-500">{subtitle}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  overview,
  isLoading,
  period,
}) => {
  // Calculate reading rate
  const readingRate = overview && overview.totalViews > 0 
    ? (overview.totalReads / overview.totalViews) * 100 
    : 0;

  // Mock trend data (in a real app, this would come from comparing with previous period)
  const mockTrends = {
    views: { value: 1250, percentage: 12.5, direction: 'up' as const },
    reads: { value: 890, percentage: 8.9, direction: 'up' as const },
    users: { value: -45, percentage: 3.2, direction: 'down' as const },
    readTime: { value: 15, percentage: 5.1, direction: 'up' as const },
    articles: { value: 3, percentage: 15.0, direction: 'up' as const },
    published: { value: 2, percentage: 10.0, direction: 'up' as const },
  };

  const getPeriodLabel = () => {
    switch (period.period) {
      case 'today':
        return 'vs yesterday';
      case '7days':
        return 'vs previous 7 days';
      case '30days':
        return 'vs previous 30 days';
      case '90days':
        return 'vs previous 90 days';
      case '1year':
        return 'vs previous year';
      default:
        return 'vs previous period';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* Total Views */}
      <MetricCard
        title="Total Views"
        value={overview?.totalViews || 0}
        icon={<Eye className="h-4 w-4" />}
        trend={mockTrends.views}
        subtitle={getPeriodLabel()}
        isLoading={isLoading}
      />

      {/* Total Reads */}
      <MetricCard
        title="Total Reads"
        value={overview?.totalReads || 0}
        icon={<BookOpen className="h-4 w-4" />}
        trend={mockTrends.reads}
        subtitle={getPeriodLabel()}
        isLoading={isLoading}
      />

      {/* Unique Users */}
      <MetricCard
        title="Unique Users"
        value={overview?.uniqueUsers || 0}
        icon={<Users className="h-4 w-4" />}
        trend={mockTrends.users}
        subtitle={getPeriodLabel()}
        isLoading={isLoading}
      />

      {/* Average Read Time */}
      <MetricCard
        title="Avg Read Time"
        value={overview ? formatReadingTime(overview.avgReadTime) : '0s'}
        icon={<Clock className="h-4 w-4" />}
        trend={mockTrends.readTime}
        subtitle={getPeriodLabel()}
        isLoading={isLoading}
      />

      {/* Total Articles */}
      <MetricCard
        title="Total Articles"
        value={overview?.totalArticles || 0}
        icon={<FileText className="h-4 w-4" />}
        trend={mockTrends.articles}
        subtitle={getPeriodLabel()}
        isLoading={isLoading}
      />

      {/* Published Articles */}
      <MetricCard
        title="Published"
        value={overview?.publishedArticles || 0}
        icon={<Send className="h-4 w-4" />}
        trend={mockTrends.published}
        subtitle={`${overview?.draftArticles || 0} drafts`}
        isLoading={isLoading}
      />

      {/* Reading Rate - spans 2 columns on larger screens */}
      <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Reading Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold mb-1">
                  {readingRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  {overview?.totalReads.toLocaleString()} reads from {overview?.totalViews.toLocaleString()} views
                </div>
                
                {/* Reading Rate Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Completion Rate</span>
                    <span>{readingRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(readingRate, 100)}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement Summary - spans remaining columns */}
      <div className="md:col-span-2 lg:col-span-2 xl:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Engagement Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-6 w-12 mx-auto mb-1" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {overview ? formatAnalyticsNumber(overview.totalViews) : '0'}
                  </div>
                  <div className="text-xs text-gray-500">Page Views</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {overview ? formatAnalyticsNumber(overview.totalReads) : '0'}
                  </div>
                  <div className="text-xs text-gray-500">Completed Reads</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">
                    {overview ? formatAnalyticsNumber(overview.uniqueUsers) : '0'}
                  </div>
                  <div className="text-xs text-gray-500">Unique Visitors</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-600">
                    {overview ? formatReadingTime(overview.avgReadTime) : '0s'}
                  </div>
                  <div className="text-xs text-gray-500">Avg. Read Time</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MetricsOverview;

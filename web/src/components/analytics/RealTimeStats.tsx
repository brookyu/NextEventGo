import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Eye, 
  Activity, 
  Clock, 
  TrendingUp, 
  Globe,
  Smartphone,
  Monitor,
  RefreshCw,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

import { formatAnalyticsNumber } from '@/api/analytics';

interface RealTimeStatsProps {
  data?: {
    activeUsers: number;
    currentViews: number;
    topPages: Array<{ articleId: string; title: string; views: number }>;
    recentActivity: Array<{
      id: string;
      type: 'view' | 'read' | 'publish' | 'create';
      articleId: string;
      articleTitle: string;
      timestamp: string;
      metadata?: Record<string, any>;
    }>;
  };
  isLoading: boolean;
}

const RealTimeStats: React.FC<RealTimeStatsProps> = ({
  data,
  isLoading,
}) => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (data) {
      setLastUpdate(new Date());
      setIsRefreshing(false);
    }
  }, [data]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // The parent component handles the actual refresh via React Query
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="h-3 w-3" />;
      case 'read':
        return <Clock className="h-3 w-3" />;
      case 'publish':
        return <TrendingUp className="h-3 w-3" />;
      case 'create':
        return <Activity className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'view':
        return 'text-blue-600 bg-blue-50';
      case 'read':
        return 'text-green-600 bg-green-50';
      case 'publish':
        return 'text-purple-600 bg-purple-50';
      case 'create':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Real-time Analytics</h2>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.activeUsers || 0}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Online now
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Current Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data?.currentViews || 0}
            </div>
            <div className="text-xs text-gray-500">
              Pages being viewed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Top Article</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {data?.topPages?.[0]?.views || 0}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {data?.topPages?.[0]?.title || 'No data'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Activity</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data?.recentActivity?.length || 0}
            </div>
            <div className="text-xs text-gray-500">
              Recent actions
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Pages Right Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topPages && data.topPages.length > 0 ? (
              <div className="space-y-3">
                {data.topPages.slice(0, 5).map((page, index) => (
                  <div key={page.articleId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <h4 className="font-medium truncate">{page.title}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {page.views}
                      </Badge>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active pages</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.recentActivity.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className={`p-1 rounded-full ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {activity.articleTitle}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {activity.type} • {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                    {activity.metadata?.country && (
                      <Badge variant="outline" className="text-xs">
                        <Globe className="h-2 w-2 mr-1" />
                        {activity.metadata.country}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Real-time Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {data?.activeUsers || 0}
              </div>
              <div className="text-sm text-gray-600 mb-2">Active Users</div>
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {data?.currentViews || 0}
              </div>
              <div className="text-sm text-gray-600 mb-2">Page Views</div>
              <div className="text-xs text-gray-500">In the last minute</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {data?.topPages?.length || 0}
              </div>
              <div className="text-sm text-gray-600 mb-2">Active Pages</div>
              <div className="text-xs text-gray-500">Being viewed now</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeStats;

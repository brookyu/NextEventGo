import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  TrendingUp,
  MousePointer,
  Users,
  Globe,
  Smartphone,
  Calendar,
  Share2,
  ExternalLink,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import { 
  sharingApi, 
  type ShareAnalytics as ShareAnalyticsType,
  getPlatformName,
  getPlatformIcon,
  getPlatformColor,
} from '@/api/sharing';

interface ShareAnalyticsProps {
  shareId: string;
  onClose?: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ShareAnalytics: React.FC<ShareAnalyticsProps> = ({
  shareId,
  onClose,
}) => {
  const [dateRange, setDateRange] = useState('7days');

  // Calculate date range
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case '24hours':
        start.setDate(start.getDate() - 1);
        break;
      case '7days':
        start.setDate(start.getDate() - 7);
        break;
      case '30days':
        start.setDate(start.getDate() - 30);
        break;
      case '90days':
        start.setDate(start.getDate() - 90);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch share analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['share-analytics', shareId, startDate, endDate],
    queryFn: () => sharingApi.getShareAnalytics(shareId, startDate, endDate),
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{new Date(label).toLocaleDateString()}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="capitalize">{entry.dataKey}:</span>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
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
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No analytics data available</p>
          <p className="text-sm">Analytics data will appear here once the share link is used</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span style={{ color: getPlatformColor(analytics.platform) }}>
              {getPlatformIcon(analytics.platform)}
            </span>
            {getPlatformName(analytics.platform)} Analytics
          </h3>
          <p className="text-sm text-gray-600">
            Performance metrics for promotion code: <code className="bg-gray-100 px-1 rounded">{analytics.promotionCode}</code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24hours">Last 24 hours</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.clicks}</div>
            <div className="text-xs text-gray-500">Link clicks</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversions</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversions}</div>
            <div className="text-xs text-gray-500">Completed reads</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Click to read rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Top Referrer</CardTitle>
            <ExternalLink className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.topReferrers[0]?.clicks || 0}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {analytics.topReferrers[0]?.referrer || 'Direct'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.timeSeriesData}>
                <defs>
                  <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="conversionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#clicksGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="conversions"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#conversionsGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.geographicData.length > 0 ? (
              <div className="space-y-3">
                {analytics.geographicData.slice(0, 5).map((geo, index) => (
                  <div key={geo.country} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{geo.country}</span>
                      {geo.city && (
                        <span className="text-sm text-gray-500">({geo.city})</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{geo.clicks}</div>
                      <div className="text-xs text-gray-500">{geo.conversions} conversions</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <div className="text-center">
                  <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No geographic data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Device Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.deviceData.length > 0 ? (
              <div className="space-y-3">
                {analytics.deviceData.slice(0, 5).map((device, index) => (
                  <div key={device.deviceType} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium capitalize">{device.deviceType}</span>
                      <span className="text-sm text-gray-500">({device.platform})</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{device.clicks}</div>
                      <div className="text-xs text-gray-500">{device.conversions} conversions</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <div className="text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No device data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Referrers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Top Referrers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.topReferrers.length > 0 ? (
            <div className="space-y-3">
              {analytics.topReferrers.slice(0, 5).map((referrer, index) => (
                <div key={referrer.referrer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <div>
                      <div className="font-medium">{referrer.referrer}</div>
                      <div className="text-sm text-gray-500">
                        {referrer.conversions} conversions from {referrer.clicks} clicks
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{referrer.clicks}</div>
                    <div className="text-xs text-gray-500">
                      {referrer.clicks > 0 ? ((referrer.conversions / referrer.clicks) * 100).toFixed(1) : 0}% rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <ExternalLink className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No referrer data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareAnalytics;

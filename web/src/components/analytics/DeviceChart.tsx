import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Smartphone, Monitor, Tablet, Chrome, Safari, Firefox } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

import { type DeviceStats, formatAnalyticsNumber, formatReadingTime } from '@/api/analytics';

interface DeviceChartProps {
  data?: DeviceStats[];
  isLoading: boolean;
  title: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const DeviceChart: React.FC<DeviceChartProps> = ({
  data = [],
  isLoading,
  title,
}) => {
  // Group data by device type
  const deviceTypeData = data.reduce((acc, item) => {
    const existing = acc.find(d => d.deviceType === item.deviceType);
    if (existing) {
      existing.count += item.count;
      existing.avgReadTime = (existing.avgReadTime + item.avgReadTime) / 2;
    } else {
      acc.push({
        deviceType: item.deviceType,
        count: item.count,
        percentage: item.percentage,
        avgReadTime: item.avgReadTime,
      });
    }
    return acc;
  }, [] as Array<{ deviceType: string; count: number; percentage: number; avgReadTime: number }>);

  // Group data by platform
  const platformData = data.reduce((acc, item) => {
    const existing = acc.find(d => d.platform === item.platform);
    if (existing) {
      existing.count += item.count;
      existing.avgReadTime = (existing.avgReadTime + item.avgReadTime) / 2;
    } else {
      acc.push({
        platform: item.platform,
        count: item.count,
        percentage: item.percentage,
        avgReadTime: item.avgReadTime,
      });
    }
    return acc;
  }, [] as Array<{ platform: string; count: number; percentage: number; avgReadTime: number }>);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getBrowserIcon = (browser: string) => {
    switch (browser.toLowerCase()) {
      case 'chrome':
        return <Chrome className="h-4 w-4" />;
      case 'safari':
        return <Safari className="h-4 w-4" />;
      case 'firefox':
        return <Firefox className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.deviceType || data.platform}</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-sm">Users:</span>
              <span className="font-medium">{formatAnalyticsNumber(data.count)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm">Percentage:</span>
              <span className="font-medium">{data.percentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm">Avg Read Time:</span>
              <span className="font-medium">{formatReadingTime(data.avgReadTime)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No device data available</p>
              <p className="text-sm">Device data will appear here once you have visitors</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Device Types Chart */}
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-3">Device Types</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="count"
                        label={({ deviceType, percentage }) => `${deviceType} (${percentage.toFixed(1)}%)`}
                        labelLine={false}
                      >
                        {deviceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {deviceTypeData.map((device, index) => (
                    <div key={device.deviceType} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device.deviceType)}
                          <span className="font-medium capitalize">{device.deviceType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {formatAnalyticsNumber(device.count)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {device.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={device.percentage} 
                        className="h-2"
                        style={{ 
                          '--progress-background': COLORS[index % COLORS.length] 
                        } as React.CSSProperties}
                      />
                      <div className="text-xs text-gray-500">
                        {formatReadingTime(device.avgReadTime)} avg read time
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Breakdown */}
            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm text-gray-700 mb-3">Platforms</h4>
              <div className="space-y-3">
                {platformData.slice(0, 5).map((platform, index) => (
                  <div key={platform.platform} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="font-medium">{platform.platform}</div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="outline">
                        {formatAnalyticsNumber(platform.count)}
                      </Badge>
                      <span className="text-gray-500">
                        {platform.percentage.toFixed(1)}%
                      </span>
                      <span className="text-gray-500">
                        {formatReadingTime(platform.avgReadTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Browser Breakdown */}
            {data.some(d => d.browser) && (
              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm text-gray-700 mb-3">Browsers</h4>
                <div className="grid grid-cols-2 gap-3">
                  {data
                    .filter(d => d.browser)
                    .slice(0, 6)
                    .map((browser, index) => (
                      <div key={browser.browser} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getBrowserIcon(browser.browser!)}
                          <span className="text-sm font-medium">{browser.browser}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {browser.percentage.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {deviceTypeData.length}
                </div>
                <div className="text-xs text-gray-500">Device Types</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {formatAnalyticsNumber(data.reduce((sum, item) => sum + item.count, 0))}
                </div>
                <div className="text-xs text-gray-500">Total Sessions</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {data.length > 0 
                    ? formatReadingTime(data.reduce((sum, item) => sum + item.avgReadTime, 0) / data.length)
                    : '0s'
                  }
                </div>
                <div className="text-xs text-gray-500">Avg Read Time</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceChart;

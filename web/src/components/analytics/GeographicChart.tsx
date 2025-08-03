import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Globe, MapPin, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { type GeographicStats, formatAnalyticsNumber, formatReadingTime } from '@/api/analytics';

interface GeographicChartProps {
  data?: GeographicStats[];
  isLoading: boolean;
  title: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

const GeographicChart: React.FC<GeographicChartProps> = ({
  data = [],
  isLoading,
  title,
}) => {
  const [viewType, setViewType] = useState<'pie' | 'bar'>('pie');

  // Process data for charts
  const chartData = data.slice(0, 8).map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.country}</p>
          {data.city && <p className="text-sm text-gray-600">{data.city}</p>}
          <div className="mt-2 space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-sm">Visitors:</span>
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {title}
          </CardTitle>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewType === 'pie' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('pie')}
              className="rounded-r-none"
            >
              Pie
            </Button>
            <Button
              variant={viewType === 'bar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('bar')}
              className="rounded-l-none"
            >
              Bar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No geographic data available</p>
              <p className="text-sm">Geographic data will appear here once you have visitors</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {viewType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ country, percentage }) => `${country} (${percentage.toFixed(1)}%)`}
                      labelLine={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="country" 
                      stroke="#666"
                      fontSize={12}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={formatAnalyticsNumber}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Top Countries List */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">Top Countries</h4>
              <div className="space-y-2">
                {chartData.slice(0, 5).map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: country.color }}
                        />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {country.country}
                        </div>
                        {country.city && (
                          <div className="text-sm text-gray-500">{country.city}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {formatAnalyticsNumber(country.count)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {country.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatReadingTime(country.avgReadTime)} avg read
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {chartData.length}
                </div>
                <div className="text-xs text-gray-500">Countries</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {formatAnalyticsNumber(chartData.reduce((sum, item) => sum + item.count, 0))}
                </div>
                <div className="text-xs text-gray-500">Total Visitors</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {chartData.length > 0 
                    ? formatReadingTime(chartData.reduce((sum, item) => sum + item.avgReadTime, 0) / chartData.length)
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

export default GeographicChart;

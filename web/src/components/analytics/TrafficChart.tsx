import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { Eye, BookOpen, Users, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { type DailyStats, type AnalyticsPeriod, formatAnalyticsNumber } from '@/api/analytics';

interface TrafficChartProps {
  data?: DailyStats[];
  isLoading: boolean;
  title: string;
  period: AnalyticsPeriod;
  showDetailed?: boolean;
}

type ChartType = 'line' | 'area' | 'bar';
type MetricType = 'views' | 'reads' | 'users' | 'all';

const TrafficChart: React.FC<TrafficChartProps> = ({
  data = [],
  isLoading,
  title,
  period,
  showDetailed = false,
}) => {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('all');

  // Process data for chart
  const chartData = useMemo(() => {
    return data.map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      fullDate: item.date,
      views: item.views,
      reads: item.reads,
      users: item.uniqueUsers,
      completionRate: item.completionRate,
      avgReadTime: item.avgReadTime,
    }));
  }, [data]);

  // Calculate totals and trends
  const totals = useMemo(() => {
    if (!data.length) return { views: 0, reads: 0, users: 0, avgReadTime: 0 };
    
    return data.reduce(
      (acc, item) => ({
        views: acc.views + item.views,
        reads: acc.reads + item.reads,
        users: acc.users + item.uniqueUsers,
        avgReadTime: acc.avgReadTime + item.avgReadTime,
      }),
      { views: 0, reads: 0, users: 0, avgReadTime: 0 }
    );
  }, [data]);

  const avgReadTime = data.length > 0 ? totals.avgReadTime / data.length : 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="capitalize">{entry.dataKey}:</span>
              <span className="font-medium">
                {entry.dataKey === 'avgReadTime' 
                  ? `${Math.round(entry.value)}s`
                  : formatAnalyticsNumber(entry.value)
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickLine={false}
              tickFormatter={formatAnalyticsNumber}
            />
            <Tooltip content={<CustomTooltip />} />
            {(selectedMetric === 'all' || selectedMetric === 'views') && (
              <Line
                type="monotone"
                dataKey="views"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'reads') && (
              <Line
                type="monotone"
                dataKey="reads"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'users') && (
              <Line
                type="monotone"
                dataKey="users"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {selectedMetric === 'all' && (
              <Legend />
            )}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="readsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickLine={false}
              tickFormatter={formatAnalyticsNumber}
            />
            <Tooltip content={<CustomTooltip />} />
            {(selectedMetric === 'all' || selectedMetric === 'views') && (
              <Area
                type="monotone"
                dataKey="views"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#viewsGradient)"
                strokeWidth={2}
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'reads') && (
              <Area
                type="monotone"
                dataKey="reads"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#readsGradient)"
                strokeWidth={2}
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'users') && (
              <Area
                type="monotone"
                dataKey="users"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#usersGradient)"
                strokeWidth={2}
              />
            )}
            {selectedMetric === 'all' && (
              <Legend />
            )}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickLine={false}
              tickFormatter={formatAnalyticsNumber}
            />
            <Tooltip content={<CustomTooltip />} />
            {(selectedMetric === 'all' || selectedMetric === 'views') && (
              <Bar dataKey="views" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'reads') && (
              <Bar dataKey="reads" fill="#10b981" radius={[2, 2, 0, 0]} />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'users') && (
              <Bar dataKey="users" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            )}
            {selectedMetric === 'all' && (
              <Legend />
            )}
          </BarChart>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
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
            <TrendingUp className="h-5 w-5" />
            {title}
          </CardTitle>
          
          {showDetailed && (
            <div className="flex items-center gap-2">
              <Select value={selectedMetric} onValueChange={(value: MetricType) => setSelectedMetric(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="reads">Reads</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex border rounded-md">
                <Button
                  variant={chartType === 'area' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('area')}
                  className="rounded-r-none"
                >
                  Area
                </Button>
                <Button
                  variant={chartType === 'line' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('line')}
                  className="rounded-none border-x"
                >
                  Line
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                  className="rounded-l-none"
                >
                  Bar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Views:</span>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {formatAnalyticsNumber(totals.views)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600">Reads:</span>
            <Badge variant="outline" className="text-green-600 border-green-200">
              {formatAnalyticsNumber(totals.reads)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-gray-600">Users:</span>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              {formatAnalyticsNumber(totals.users)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No data available</p>
              <p className="text-sm">Data will appear here once you have traffic</p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrafficChart;

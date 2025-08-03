import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  BookOpen,
  Users,
  Clock,
  BarChart3,
  PieChart,
  Globe,
  Smartphone,
  Share2,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import MetricsOverview from './MetricsOverview';
import TrafficChart from './TrafficChart';
import GeographicChart from './GeographicChart';
import DeviceChart from './DeviceChart';
import ContentPerformanceTable from './ContentPerformanceTable';
import RealTimeStats from './RealTimeStats';
import AnalyticsFilters from './AnalyticsFilters';

import { analyticsApi, type AnalyticsPeriod, type AnalyticsFilter } from '@/api/analytics';

const AnalyticsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>({ period: '30days' });
  const [filters, setFilters] = useState<AnalyticsFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch analytics data
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ['analytics-overview', selectedPeriod, filters],
    queryFn: () => analyticsApi.getOverview(selectedPeriod),
    refetchInterval: activeTab === 'realtime' ? 30000 : 300000, // 30s for realtime, 5min for others
  });

  const { data: dailyStats, isLoading: dailyStatsLoading } = useQuery({
    queryKey: ['analytics-daily', selectedPeriod, filters],
    queryFn: () => analyticsApi.getDailyStats(selectedPeriod, filters),
    enabled: activeTab === 'overview' || activeTab === 'traffic',
  });

  const { data: geographicStats, isLoading: geoLoading } = useQuery({
    queryKey: ['analytics-geographic', selectedPeriod, filters],
    queryFn: () => analyticsApi.getGeographicStats(selectedPeriod, filters),
    enabled: activeTab === 'audience',
  });

  const { data: deviceStats, isLoading: deviceLoading } = useQuery({
    queryKey: ['analytics-devices', selectedPeriod, filters],
    queryFn: () => analyticsApi.getDeviceStats(selectedPeriod, filters),
    enabled: activeTab === 'audience',
  });

  const { data: contentPerformance, isLoading: contentLoading } = useQuery({
    queryKey: ['analytics-content', selectedPeriod, filters],
    queryFn: () => analyticsApi.getContentPerformance(selectedPeriod, filters),
    enabled: activeTab === 'content',
  });

  const { data: realTimeStats, isLoading: realTimeLoading } = useQuery({
    queryKey: ['analytics-realtime'],
    queryFn: () => analyticsApi.getRealTimeStats(),
    enabled: activeTab === 'realtime',
    refetchInterval: 5000, // 5 seconds for real-time
  });

  const { data: categoryStats } = useQuery({
    queryKey: ['analytics-categories', selectedPeriod],
    queryFn: () => analyticsApi.getCategoryStats(selectedPeriod),
    enabled: activeTab === 'content',
  });

  const { data: authorStats } = useQuery({
    queryKey: ['analytics-authors', selectedPeriod],
    queryFn: () => analyticsApi.getAuthorStats(selectedPeriod),
    enabled: activeTab === 'content',
  });

  // Period options
  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: '90days', label: 'Last 90 days' },
    { value: '1year', label: 'Last year' },
    { value: 'custom', label: 'Custom range' },
  ];

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod({ period: period as any });
  };

  const handleFiltersChange = (newFilters: AnalyticsFilter) => {
    setFilters(newFilters);
  };

  const handleExport = async () => {
    try {
      const blob = await analyticsApi.exportAnalytics(selectedPeriod, filters, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${selectedPeriod.period}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  const isLoading = overviewLoading || dailyStatsLoading;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your content performance and audience engagement
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchOverview()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Dialog open={showFilters} onOpenChange={setShowFilters}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {Object.keys(filters).length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {Object.keys(filters).length}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Analytics Filters</DialogTitle>
              </DialogHeader>
              <AnalyticsFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClose={() => setShowFilters(false)}
              />
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Select value={selectedPeriod.period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="traffic" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Traffic
          </TabsTrigger>
          <TabsTrigger value="audience" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Audience
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Real-time
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <MetricsOverview
            overview={overview}
            isLoading={overviewLoading}
            period={selectedPeriod}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrafficChart
              data={dailyStats}
              isLoading={dailyStatsLoading}
              title="Traffic Overview"
              period={selectedPeriod}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Performing Articles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {overview?.topPerformingArticles ? (
                  <div className="space-y-3">
                    {overview.topPerformingArticles.slice(0, 5).map((article, index) => (
                      <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <h4 className="font-medium truncate">{article.title}</h4>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {article.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {article.reads.toLocaleString()}
                            </span>
                            <span>{Math.round(article.readingRate * 100)}% completion</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                      <p>No data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TrafficChart
                data={dailyStats}
                isLoading={dailyStatsLoading}
                title="Traffic Trends"
                period={selectedPeriod}
                showDetailed={true}
              />
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Traffic Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Direct</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Search</span>
                      <span className="text-sm font-medium">32%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Social</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Referral</span>
                      <span className="text-sm font-medium">8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GeographicChart
              data={geographicStats}
              isLoading={geoLoading}
              title="Geographic Distribution"
            />

            <DeviceChart
              data={deviceStats}
              isLoading={deviceLoading}
              title="Device & Platform Stats"
            />
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <ContentPerformanceTable
            data={contentPerformance}
            isLoading={contentLoading}
            categoryStats={categoryStats}
            authorStats={authorStats}
          />
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <RealTimeStats
            data={realTimeStats}
            isLoading={realTimeLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;

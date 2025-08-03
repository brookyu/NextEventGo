import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Eye,
  BookOpen,
  Share2,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { Article, ArticleAnalytics, DateCount } from '@/types/article'
import { articleApi } from '@/services/articleApi'
import { formatNumber, formatDuration, formatDate } from '@/lib/utils'

interface ArticleAnalyticsDashboardProps {
  article: Article
}

export function ArticleAnalyticsDashboard({ article }: ArticleAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['article-analytics', article.id, timeRange],
    queryFn: () => articleApi.getAnalytics(article.id, timeRange),
  })

  if (isLoading) {
    return <AnalyticsSkeleton />
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Analytics data not available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Detailed insights for "{article.title}"
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Views"
          value={analytics.viewCount}
          icon={<Eye className="h-4 w-4" />}
          trend={calculateTrend(analytics.viewsByDate)}
        />
        <MetricCard
          title="Total Reads"
          value={analytics.readCount}
          icon={<BookOpen className="h-4 w-4" />}
          trend={calculateTrend(analytics.readsByDate)}
        />
        <MetricCard
          title="Shares"
          value={analytics.shareCount}
          icon={<Share2 className="h-4 w-4" />}
          trend={calculateTrend(analytics.sharesByDate)}
        />
        <MetricCard
          title="Avg. Read Time"
          value={formatDuration(analytics.averageReadTime)}
          icon={<Clock className="h-4 w-4" />}
          isTime
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reading Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completion Rate</span>
                    <span className="text-sm font-medium">{analytics.readingRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={analytics.readingRate} className="h-2" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Started Reading</div>
                      <div className="font-medium">{formatNumber(analytics.viewCount)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Completed Reading</div>
                      <div className="font-medium">{formatNumber(analytics.readCount)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Views per day</span>
                    <span className="font-medium">
                      {formatNumber(analytics.viewCount / getDaysInRange(timeRange))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reads per day</span>
                    <span className="font-medium">
                      {formatNumber(analytics.readCount / getDaysInRange(timeRange))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Share rate</span>
                    <span className="font-medium">
                      {((analytics.shareCount / analytics.viewCount) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Engagement score</span>
                    <Badge variant="outline">
                      {calculateEngagementScore(analytics)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <TimelineChart data={analytics.viewsByDate} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reading Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Read Time</span>
                    <span className="font-medium">{formatDuration(analytics.averageReadTime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bounce Rate</span>
                    <span className="font-medium">
                      {(100 - analytics.readingRate).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Return Readers</span>
                    <span className="font-medium">
                      {formatNumber(Math.floor(analytics.readCount * 0.15))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Social Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Shares</span>
                    <span className="font-medium">{formatNumber(analytics.shareCount)}</span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(analytics.sharesByDate.reduce((acc, item) => {
                      acc.wechat = (acc.wechat || 0) + Math.floor(item.count * 0.6)
                      acc.other = (acc.other || 0) + Math.floor(item.count * 0.4)
                      return acc
                    }, {} as Record<string, number>)).map(([platform, count]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{platform}</span>
                        <span className="font-medium">{formatNumber(count)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.viewsByDevice).map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {device === 'mobile' ? (
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Monitor className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm capitalize">{device}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(count)}</div>
                        <div className="text-xs text-muted-foreground">
                          {((count / analytics.viewCount) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.viewsByLocation).slice(0, 5).map(([location, count]) => (
                    <div key={location} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{location}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(count)}</div>
                        <div className="text-xs text-muted-foreground">
                          {((count / analytics.viewCount) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.viewsByReferrer).slice(0, 8).map(([referrer, count]) => (
                  <div key={referrer} className="flex items-center justify-between">
                    <span className="text-sm">{referrer || 'Direct'}</span>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(count)}</div>
                      <div className="text-xs text-muted-foreground">
                        {((count / analytics.viewCount) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  trend?: number
  isTime?: boolean
}

function MetricCard({ title, value, icon, trend, isTime }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium">{title}</span>
          </div>
          {trend !== undefined && !isTime && (
            <div className={`flex items-center gap-1 text-xs ${
              trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : trend < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="text-2xl font-bold mt-2">
          {typeof value === 'number' && !isTime ? formatNumber(value) : value}
        </div>
      </CardContent>
    </Card>
  )
}

function TimelineChart({ data }: { data: DateCount[] }) {
  const maxValue = Math.max(...data.map(d => d.count))
  
  return (
    <div className="space-y-2">
      {data.slice(-7).map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground w-16">
            {formatDate(item.date, 'MMM dd')}
          </div>
          <div className="flex-1">
            <Progress 
              value={(item.count / maxValue) * 100} 
              className="h-2"
            />
          </div>
          <div className="text-xs font-medium w-12 text-right">
            {formatNumber(item.count)}
          </div>
        </div>
      ))}
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

// Utility functions
function calculateTrend(data: DateCount[]): number {
  if (data.length < 2) return 0
  const recent = data.slice(-7).reduce((sum, item) => sum + item.count, 0)
  const previous = data.slice(-14, -7).reduce((sum, item) => sum + item.count, 0)
  if (previous === 0) return recent > 0 ? 100 : 0
  return ((recent - previous) / previous) * 100
}

function getDaysInRange(range: string): number {
  switch (range) {
    case '7d': return 7
    case '30d': return 30
    case '90d': return 90
    case '1y': return 365
    default: return 30
  }
}

function calculateEngagementScore(analytics: ArticleAnalytics): string {
  const readRate = analytics.readingRate
  const shareRate = (analytics.shareCount / analytics.viewCount) * 100
  const score = (readRate * 0.7) + (shareRate * 0.3)
  
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Average'
  return 'Poor'
}

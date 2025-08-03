import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings,
  RefreshCw,
  Download,
  Wifi,
  WifiOff,
  Zap,
  BarChart3,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

import { wechatApi } from '@/api/wechat'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function WeChatPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'users' | 'config'>('overview')
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h')

  // WebSocket for real-time updates
  const { isConnected, subscribe } = useWebSocket()

  // Fetch WeChat statistics
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['wechat-statistics', timeRange],
    queryFn: () => wechatApi.getWeChatStatistics({
      dateRange: getDateRange(timeRange)
    }),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Fetch integration health
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['wechat-health'],
    queryFn: () => wechatApi.getIntegrationHealth(),
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  // Fetch message analytics
  const { data: messageAnalytics } = useQuery({
    queryKey: ['wechat-message-analytics', timeRange],
    queryFn: () => wechatApi.getMessageAnalytics({
      dateRange: getDateRange(timeRange)
    }),
    refetchInterval: 60000, // Refetch every minute
  })

  // Fetch user engagement
  const { data: userEngagement } = useQuery({
    queryKey: ['wechat-user-engagement', timeRange],
    queryFn: () => wechatApi.getUserEngagement({
      dateRange: getDateRange(timeRange)
    }),
    refetchInterval: 60000,
  })

  const stats = statsData?.data
  const health = healthData?.data
  const messages = messageAnalytics?.data
  const engagement = userEngagement?.data

  // Subscribe to real-time WeChat updates
  useEffect(() => {
    const unsubscribeMessage = subscribe('wechat:message', () => {
      refetchStats()
    })

    const unsubscribeHealth = subscribe('wechat:health', () => {
      refetchHealth()
    })

    return () => {
      unsubscribeMessage()
      unsubscribeHealth()
    }
  }, [subscribe, refetchStats, refetchHealth])

  function getDateRange(range: string) {
    const now = new Date()
    const start = new Date()

    switch (range) {
      case '24h':
        start.setHours(start.getHours() - 24)
        break
      case '7d':
        start.setDate(start.getDate() - 7)
        break
      case '30d':
        start.setDate(start.getDate() - 30)
        break
    }

    return {
      start: start.toISOString(),
      end: now.toISOString()
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-success-600 bg-success-100'
      case 'warning':
        return 'text-warning-600 bg-warning-100'
      case 'error':
        return 'text-error-600 bg-error-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5" />
      case 'warning':
        return <AlertCircle className="w-5 h-5" />
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WeChat Integration</h1>
          <p className="text-gray-600">Monitor WeChat messages, users, and integration health</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500' : 'bg-error-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="input"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button
            onClick={() => {
              refetchStats()
              refetchHealth()
            }}
            className="btn-secondary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Integration health status */}
      {health && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Integration Health</h3>
              <div className={`flex items-center px-3 py-1 rounded-full ${getHealthStatusColor(health.status)}`}>
                {getHealthIcon(health.status)}
                <span className="ml-2 text-sm font-medium capitalize">{health.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                  health.apiStatus === 'connected' ? 'bg-success-100' : 'bg-error-100'
                }`}>
                  {health.apiStatus === 'connected' ? (
                    <Wifi className="w-5 h-5 text-success-600" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-error-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">API Status</p>
                  <p className="font-medium capitalize">{health.apiStatus}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                  health.webhookStatus === 'active' ? 'bg-success-100' : 'bg-error-100'
                }`}>
                  <Zap className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Webhook</p>
                  <p className="font-medium capitalize">{health.webhookStatus}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                  <Activity className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Response Time</p>
                  <p className="font-medium">{health.responseTime}ms</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uptime</p>
                  <p className="font-medium">{(health.uptime * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {health.issues && health.issues.length > 0 && (
              <div className="mt-6 p-4 bg-warning-50 rounded-lg border border-warning-200">
                <h4 className="text-sm font-medium text-warning-800 mb-2">Active Issues</h4>
                <div className="space-y-2">
                  {health.issues.map((issue, index) => (
                    <div key={index} className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-warning-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-warning-800">{issue.message}</p>
                        <p className="text-xs text-warning-600">
                          {formatDistanceToNow(new Date(issue.timestamp))} ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Statistics cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="card"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary-100">
                  <MessageSquare className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="card"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="p-3 rounded-lg bg-success-100">
                  <Users className="w-6 h-6 text-success-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="card"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
                <div className="p-3 rounded-lg bg-warning-100">
                  <Activity className="w-6 h-6 text-warning-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="card"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.responseMetrics?.responseRate ? `${(stats.responseMetrics.responseRate * 100).toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-error-100">
                  <TrendingUp className="w-6 h-6 text-error-600" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'messages', name: 'Messages', icon: MessageSquare },
            { id: 'users', name: 'Users', icon: Users },
            { id: 'config', name: 'Configuration', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Message trend chart */}
            {stats?.messageTrend && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Message Trend</h3>
                </div>
                <div className="card-body">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.messageTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="inbound"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="Inbound"
                        />
                        <Line
                          type="monotone"
                          dataKey="outbound"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Outbound"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Message types */}
              {stats?.messagesByType && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Message Types</h3>
                  </div>
                  <div className="card-body">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.messagesByType}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Top users */}
              {stats?.topUsers && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Most Active Users</h3>
                  </div>
                  <div className="card-body">
                    <div className="space-y-4">
                      {stats.topUsers.slice(0, 5).map((user, index) => (
                        <div key={user.openId} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-primary-600 text-sm font-medium">
                                {user.nickname?.[0] || '#'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.nickname || 'Anonymous'}</p>
                              <p className="text-xs text-gray-500">
                                Last: {formatDistanceToNow(new Date(user.lastMessageTime))} ago
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{user.messageCount}</p>
                            <p className="text-xs text-gray-500">messages</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'messages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Message Management</h3>
              <p className="text-gray-600">Detailed message analytics and management coming soon...</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">WeChat User Management</h3>
              <p className="text-gray-600">WeChat user analytics and management coming soon...</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'config' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">WeChat Configuration</h3>
              <p className="text-gray-600">WeChat integration settings and configuration coming soon...</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

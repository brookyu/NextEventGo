import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Clock, 
  Users, 
  Calendar,
  Download,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  totalDownloads: number
  avgWatchTime: number
  engagementRate: number
  viewsGrowth: number
  likesGrowth: number
  commentsGrowth: number
}

interface ViewerSession {
  id: string
  cloudVideoId: string
  userId?: string
  startTime: string
  endTime?: string
  duration: number
  interactions: number
  deviceType: string
  location: string
}

const CloudVideoAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [sessions, setSessions] = useState<ViewerSession[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchAnalytics()
    fetchSessions()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // Mock analytics data - in real implementation, this would come from API
      const mockData: AnalyticsData = {
        totalViews: 15420,
        totalLikes: 1240,
        totalComments: 340,
        totalShares: 180,
        totalDownloads: 95,
        avgWatchTime: 245, // seconds
        engagementRate: 8.2, // percentage
        viewsGrowth: 12.5,
        likesGrowth: 8.3,
        commentsGrowth: -2.1
      }
      setAnalytics(mockData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSessions = async () => {
    try {
      // Mock session data - in real implementation, this would come from API
      const mockSessions: ViewerSession[] = [
        {
          id: '1',
          cloudVideoId: 'cv1',
          userId: 'user1',
          startTime: '2024-01-15T10:30:00Z',
          endTime: '2024-01-15T10:45:00Z',
          duration: 900,
          interactions: 5,
          deviceType: 'Desktop',
          location: 'New York, US'
        },
        {
          id: '2',
          cloudVideoId: 'cv2',
          startTime: '2024-01-15T11:00:00Z',
          endTime: '2024-01-15T11:20:00Z',
          duration: 1200,
          interactions: 3,
          deviceType: 'Mobile',
          location: 'London, UK'
        }
      ]
      setSessions(mockSessions)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0
    return (
      <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
        <span className="text-xs font-medium">{Math.abs(growth)}%</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CloudVideo Analytics</h1>
              <p className="text-sm text-gray-500">Track performance and engagement metrics</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.totalViews.toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-end">
                <Eye className="w-8 h-8 text-blue-500" />
                {formatGrowth(analytics?.viewsGrowth || 0)}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.totalLikes.toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-end">
                <Heart className="w-8 h-8 text-red-500" />
                {formatGrowth(analytics?.likesGrowth || 0)}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comments</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.totalComments.toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-end">
                <MessageCircle className="w-8 h-8 text-green-500" />
                {formatGrowth(analytics?.commentsGrowth || 0)}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.engagementRate}%</p>
              </div>
              <div className="flex flex-col items-end">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <div className="text-xs text-gray-500">vs last period</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Shares</h3>
              <Share2 className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics?.totalShares}</p>
            <p className="text-sm text-gray-500 mt-1">Total shares across platforms</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Downloads</h3>
              <Download className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics?.totalDownloads}</p>
            <p className="text-sm text-gray-500 mt-1">Content downloads</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Avg Watch Time</h3>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatDuration(analytics?.avgWatchTime || 0)}</p>
            <p className="text-sm text-gray-500 mt-1">Average session duration</p>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Viewer Sessions</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {session.userId || 'Anonymous'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(session.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.interactions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.deviceType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(session.startTime).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CloudVideoAnalytics

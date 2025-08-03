import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlayCircle, Cloud, Calendar, User, Search, Filter, Plus, Download } from 'lucide-react'

interface CloudVideo {
  id: string
  title: string
  description?: string
  url?: string
  thumbnail?: string
  duration?: string
  size?: string
  format?: string
  created_at?: string
  updated_at?: string
  author?: string
  views?: number
  status?: string
}

export default function CloudVideosPage() {
  const [videos, setVideos] = useState<CloudVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCloudVideos()
  }, [])

  const fetchCloudVideos = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/api/v2/video-sessions')
      if (!response.ok) {
        throw new Error('Failed to fetch cloud videos')
      }
      const data = await response.json()
      setVideos(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cloud videos')
    } finally {
      setLoading(false)
    }
  }

  const filteredVideos = videos.filter(video =>
    video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cloud videos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <PlayCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCloudVideos}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cloud Videos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your cloud-hosted video sessions and recordings
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <Plus className="w-4 h-4 mr-2" />
            Upload Video
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search cloud videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PlayCircle className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Videos</dt>
                  <dd className="text-lg font-medium text-gray-900">{videos.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Cloud className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Cloud Storage</dt>
                  <dd className="text-lg font-medium text-gray-900">2.4 GB</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">This Month</dt>
                  <dd className="text-lg font-medium text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Download className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Downloads</dt>
                  <dd className="text-lg font-medium text-gray-900">156</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <PlayCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cloud videos found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by uploading your first video to the cloud'}
          </p>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Upload Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <PlayCircle className="w-12 h-12 text-gray-400" />
                )}
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-black bg-opacity-75 text-white">
                    <Cloud className="w-3 h-3 mr-1" />
                    Cloud
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                  {video.title || 'Untitled Video'}
                </h3>
                {video.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {video.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {video.author || 'Unknown'}
                  </div>
                  {video.duration && (
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {video.duration}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {video.format && (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 mr-2">
                        {video.format}
                      </span>
                    )}
                    {video.size && (
                      <span>{video.size}</span>
                    )}
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

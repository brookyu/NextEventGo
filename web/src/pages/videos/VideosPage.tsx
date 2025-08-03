import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Video, Play, Calendar, User, Search, Filter, Plus, Share2, Copy, Eye } from 'lucide-react'
import VideoModal from '../../components/video/VideoModal'
import { toast } from 'sonner'

interface VideoItem {
  id: string
  title: string
  description?: string
  url?: string
  playbackUrl?: string
  cloudUrl?: string
  thumbnail?: string
  thumbnailUrl?: string
  coverImage?: string
  promoImage?: string
  duration?: string | number
  created_at?: string
  updated_at?: string
  author?: string
  views?: number
  videoType?: string
  quality?: string
  isOpen?: boolean
  status?: string
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/api/v2/videos')
      if (!response.ok) {
        throw new Error('Failed to fetch videos')
      }
      const data = await response.json()
      setVideos(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  const filteredVideos = videos.filter(video =>
    video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openVideoModal = (video: VideoItem) => {
    setSelectedVideo(video)
    setIsVideoModalOpen(true)
  }

  const closeVideoModal = () => {
    setSelectedVideo(null)
    setIsVideoModalOpen(false)
  }

  const copyVideoUrl = async (video: VideoItem, e: React.MouseEvent) => {
    e.stopPropagation()

    const videoUrl = `${window.location.origin}/videos/${video.id}`

    try {
      await navigator.clipboard.writeText(videoUrl)
      toast.success('Video URL copied to clipboard!')
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = videoUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Video URL copied to clipboard!')
    }
  }

  const shareVideo = async (video: VideoItem, e: React.MouseEvent) => {
    e.stopPropagation()

    const shareData = {
      title: video.title,
      text: video.description || video.title,
      url: `${window.location.origin}/videos/${video.id}`
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to copying URL
        await copyVideoUrl(video, e)
      }
    } catch (error) {
      console.error('Error sharing:', error)
      // Fallback to copying URL
      await copyVideoUrl(video, e)
    }
  }

  const formatDuration = (duration: string | number | undefined) => {
    if (!duration) return null

    const seconds = typeof duration === 'string' ? parseInt(duration) : duration
    if (isNaN(seconds)) return null

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatViews = (views?: number) => {
    if (!views) return '0'

    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  const getBestThumbnail = (video: VideoItem) => {
    return video.thumbnailUrl || video.coverImage || video.promoImage || video.thumbnail
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading videos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchVideos}
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
          <h1 className="text-2xl font-bold text-gray-900">Videos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your video content and media library
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <Plus className="w-4 h-4 mr-2" />
            Add Video
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
              placeholder="Search videos..."
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Video className="h-6 w-6 text-gray-400" />
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
                <Play className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Published</dt>
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
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first video'}
          </p>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Video
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
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => openVideoModal(video)}
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                {getBestThumbnail(video) ? (
                  <>
                    <img
                      src={getBestThumbnail(video)}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Play className="w-6 h-6 text-gray-800 ml-0.5" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <Play className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Duration Badge */}
                {formatDuration(video.duration) && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                )}

                {/* Status Badge */}
                {video.status && (
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      video.isOpen
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {video.isOpen ? 'Public' : 'Private'}
                    </span>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {video.title || 'Untitled Video'}
                </h3>

                {video.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {video.description}
                  </p>
                )}

                {/* Video Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-3">
                    {video.author && (
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        <span>{video.author}</span>
                      </div>
                    )}
                    {video.views !== undefined && (
                      <div className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        <span>{formatViews(video.views)}</span>
                      </div>
                    )}
                  </div>
                  {video.quality && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium uppercase">
                      {video.quality}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => shareVideo(video, e)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs">Share</span>
                    </button>
                    <button
                      onClick={(e) => copyVideoUrl(video, e)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-xs">Copy</span>
                    </button>
                  </div>

                  {video.created_at && (
                    <span className="text-xs text-gray-400">
                      {new Date(video.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Video Modal */}
      <VideoModal
        video={selectedVideo}
        isOpen={isVideoModalOpen}
        onClose={closeVideoModal}
      />
    </div>
  )
}

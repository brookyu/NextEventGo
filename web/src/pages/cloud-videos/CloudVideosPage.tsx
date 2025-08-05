import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlayCircle, Cloud, Calendar, Search, Filter, Plus, Download, FileText, BarChart3, Edit, Trash2 } from 'lucide-react'
import CloudVideoForm from './CloudVideoForm'
import CloudVideoViewer from './CloudVideoViewer'
import CloudVideoModal from '../../components/video/CloudVideoModal'

// Resource info interfaces
interface VideoUploadInfo {
  id: string
  title: string
  playbackUrl: string
  coverUrl: string
  duration: number
  size: number
  format: string
  status: string
}

interface SiteImageInfo {
  id: string
  title: string
  url: string
  filePath: string
  width: number
  height: number
}

interface SiteArticleInfo {
  id: string
  title: string
  summary: string
  content?: string
  creationTime: string
  isPublished: boolean
}

interface SurveyInfo {
  id: string
  title: string
  description: string
  questionCount: number
  isActive: boolean
  creationTime: string
}

interface CategoryInfo {
  id: string
  title: string
  slug: string
}

interface SiteEventInfo {
  id: string
  title: string
  description: string
  eventStartDate: string
  eventEndDate: string
  isActive: boolean
}

// Main CloudVideo interface
interface CloudVideo {
  id: string
  title: string
  summary: string
  videoType: number // 0=basic, 1=uploaded, 2=live
  status: string
  isOpen: boolean
  requireAuth: boolean
  supportInteraction: boolean
  allowDownload: boolean
  enableComments: boolean
  enableLikes: boolean
  enableSharing: boolean
  enableAnalytics: boolean
  viewCount: number
  likeCount: number
  shareCount: number
  commentCount: number
  watchTime: number
  creationTime: string
  lastModificationTime: string

  // Bound Resources
  uploadedVideo?: VideoUploadInfo
  coverImage?: SiteImageInfo
  promotionImage?: SiteImageInfo
  thumbnailImage?: SiteImageInfo
  introArticle?: SiteArticleInfo
  notOpenArticle?: SiteArticleInfo
  survey?: SurveyInfo
  category?: CategoryInfo
  boundEvent?: SiteEventInfo

  // Live Streaming Info (for VideoType = 2)
  streamKey?: string
  cloudUrl?: string
  playbackUrl?: string
  startTime?: string
  videoEndTime?: string
}

// Helper functions
const getVideoTypeLabel = (videoType: number) => {
  switch (videoType) {
    case 1: return 'Uploaded'
    case 2: return 'Live'
    default: return 'Unknown'
  }
}

const getVideoTypeColor = (videoType: number) => {
  switch (videoType) {
    case 1: return 'bg-green-100 text-green-800'
    case 2: return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// CloudVideo Card Component
const CloudVideoCard = ({
  video,
  index,
  onView,
  onEdit,
  onDelete,
  onPlay
}: {
  video: CloudVideo;
  index: number;
  onView: (video: CloudVideo) => void;
  onEdit: (video: CloudVideo) => void;
  onDelete: (video: CloudVideo) => void;
  onPlay: (video: CloudVideo) => void;
}) => {
  const hasPlayableVideo = video.uploadedVideo && 
    video.uploadedVideo.playbackUrl

  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
  >
    <div className="aspect-video bg-gray-200 relative">
      {video.coverImage?.url || video.uploadedVideo?.coverUrl ? (
        <img
          src={video.coverImage?.url || video.uploadedVideo?.coverUrl}
          alt={video.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <PlayCircle className="w-16 h-16" />
        </div>
      )}

      {/* Video Type Badge */}
      <div className="absolute top-2 left-2">
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getVideoTypeColor(video.videoType)}`}>
          {getVideoTypeLabel(video.videoType)}
        </span>
      </div>

      {/* Play Button Overlay for Videos */}
      {hasPlayableVideo && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30">
          <button
            onClick={() => onPlay(video)}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 transition-all transform hover:scale-105"
          >
            <PlayCircle className="w-8 h-8 text-gray-800" />
          </button>
        </div>
      )}

      {/* Duration for uploaded videos */}
      {video.uploadedVideo?.duration && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {Math.floor(video.uploadedVideo.duration / 60)}:{(video.uploadedVideo.duration % 60).toString().padStart(2, '0')}
        </div>
      )}
    </div>

    <div className="p-4">
      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>

      {/* Summary */}
      {video.summary && (
        <div
          className="text-gray-600 text-sm mb-3 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: video.summary.replace(/<[^>]*>/g, '') }}
        />
      )}

      {/* Resource Indicators */}
      <div className="flex flex-wrap gap-2 mb-3">
        {video.uploadedVideo && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
            <PlayCircle className="w-3 h-3 mr-1" />
            Video
          </span>
        )}
        {video.introArticle && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
            <FileText className="w-3 h-3 mr-1" />
            Article
          </span>
        )}
        {video.survey && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
            <BarChart3 className="w-3 h-3 mr-1" />
            Survey ({video.survey.questionCount})
          </span>
        )}
        {video.boundEvent && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
            <Calendar className="w-3 h-3 mr-1" />
            Event
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
        <div className="flex items-center space-x-4">
          <span>{video.viewCount || 0} views</span>
          {video.likeCount > 0 && <span>{video.likeCount} likes</span>}
          {video.commentCount > 0 && <span>{video.commentCount} comments</span>}
        </div>
        <span>{new Date(video.creationTime).toLocaleDateString()}</span>
      </div>

      {/* Status and Access */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
            video.status === 'published' ? 'bg-green-100 text-green-800' :
            video.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {video.status}
          </span>
          {!video.isOpen && (
            <span className="inline-block px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
              Private
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {hasPlayableVideo && (
            <button
              onClick={() => onPlay(video)}
              className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
              title="Play Video"
            >
              Play
            </button>
          )}
          <button
            onClick={() => onView(video)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
          >
            View
          </button>
          <button
            onClick={() => onEdit(video)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(video)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {video.category && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          {video.category.title}
        </div>
      )}
    </div>
  </motion.div>
  )
}

export default function CloudVideosPage() {
  const [videos, setVideos] = useState<CloudVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false) // For background refreshes
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<CloudVideo | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [viewingVideo, setViewingVideo] = useState<CloudVideo | null>(null)
  const [playingVideo, setPlayingVideo] = useState<CloudVideo | null>(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  useEffect(() => {
    fetchCloudVideos()
  }, [])

  const fetchCloudVideos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      const response = await fetch('http://localhost:8080/api/v2/cloud-videos')
      if (!response.ok) {
        throw new Error('Failed to fetch cloud videos')
      }
      const data = await response.json()
      setVideos(data.data || [])
      setError(null) // Clear any previous errors
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cloud videos')
    } finally {
      if (isRefresh) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  const handleCreateVideo = async (formData: any) => {
    try {
      setFormLoading(true)
      const response = await fetch('http://localhost:8080/api/v2/cloud-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create CloudVideo')
      }

      const result = await response.json()
      console.log('CloudVideo created:', result)

      // Close the form first for better UX
      setShowCreateForm(false)
      
      // Refresh the list in the background
      await fetchCloudVideos(true)
    } catch (error) {
      console.error('Error creating CloudVideo:', error)
      throw error
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateVideo = async (formData: any) => {
    if (!editingVideo) return

    try {
      setFormLoading(true)
      const response = await fetch(`http://localhost:8080/api/v2/cloud-videos/${editingVideo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update CloudVideo')
      }

      const result = await response.json()
      console.log('CloudVideo updated:', result)

      // Update the local state immediately with the updated data
      if (result.data) {
        setVideos(prevVideos => 
          prevVideos.map(video => 
            video.id === editingVideo.id ? { ...video, ...result.data } : video
          )
        )
      }

      // Close the form first for better UX
      setEditingVideo(null)
      
      // Refresh the list in the background to ensure consistency
      await fetchCloudVideos(true) // Use refresh mode to avoid full-page loading
    } catch (error) {
      console.error('Error updating CloudVideo:', error)
      throw error
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditVideo = (video: CloudVideo) => {
    setEditingVideo(video)
  }

  const handleCancelForm = () => {
    setShowCreateForm(false)
    setEditingVideo(null)
  }

  const handleViewVideo = (video: CloudVideo) => {
    setViewingVideo(video)
  }

  const handlePlayVideo = (video: CloudVideo) => {
    setPlayingVideo(video)
    setIsVideoModalOpen(true)
  }

  const handleCloseVideoModal = () => {
    setPlayingVideo(null)
    setIsVideoModalOpen(false)
  }

  const handleDeleteVideo = async (video: CloudVideo) => {
    if (!confirm(`Are you sure you want to delete "${video.title}"?`)) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/api/v2/cloud-videos/${video.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete CloudVideo')
      }

      // Refresh the list in the background
      await fetchCloudVideos(true)
    } catch (error) {
      console.error('Error deleting CloudVideo:', error)
      alert('Failed to delete CloudVideo')
    }
  }

  const filteredVideos = videos.filter(video =>
    video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.summary?.toLowerCase().includes(searchTerm.toLowerCase())
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
            onClick={() => fetchCloudVideos()}
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
            Manage content packages that combine videos, articles, surveys, and events
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create CloudVideo
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
        <button 
          onClick={() => fetchCloudVideos(true)}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          {refreshing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
          ) : (
            <Filter className="w-4 h-4 mr-2" />
          )}
          {refreshing ? 'Refreshing...' : 'Refresh'}
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
            <CloudVideoCard
              key={video.id || index}
              video={video}
              index={index}
              onView={handleViewVideo}
              onEdit={handleEditVideo}
              onDelete={handleDeleteVideo}
              onPlay={handlePlayVideo}
            />
          ))}
        </div>
      )}

      {/* CloudVideo Create/Edit Form */}
      {(showCreateForm || editingVideo) && (
        <CloudVideoForm
          cloudVideo={editingVideo}
          onSave={editingVideo ? handleUpdateVideo : handleCreateVideo}
          onCancel={handleCancelForm}
          isLoading={formLoading}
        />
      )}

      {/* CloudVideo Viewer */}
      {viewingVideo && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <CloudVideoViewer
            videoId={viewingVideo.id}
            onClose={() => setViewingVideo(null)}
          />
          <button
            onClick={() => setViewingVideo(null)}
            className="fixed top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-75 transition-colors z-10"
          >
            ✕
          </button>
        </div>
      )}

      {/* CloudVideo Modal for Video Playback */}
      <CloudVideoModal
        video={playingVideo}
        isOpen={isVideoModalOpen}
        onClose={handleCloseVideoModal}
      />
    </div>
  )
}

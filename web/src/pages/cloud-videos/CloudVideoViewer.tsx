import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Play, 
  Heart, 
  MessageCircle, 
  Share2, 
  Download,
  Eye,
  Clock,
  Calendar,
  FileText,
  BarChart3,
  ArrowLeft,
  ExternalLink,
  Bookmark
} from 'lucide-react'
import VideoPlayer from '../../components/video/VideoPlayer'

interface CloudVideoViewerProps {
  videoId?: string
  onClose?: () => void
}

const CloudVideoViewer: React.FC<CloudVideoViewerProps> = ({ videoId: propVideoId, onClose }) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const videoId = propVideoId || id

  const [cloudVideo, setCloudVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'article' | 'survey' | 'comments'>('overview')
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    if (videoId) {
      fetchCloudVideo()
    }
  }, [videoId])

  const fetchCloudVideo = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`http://localhost:8080/api/v2/cloud-videos/${videoId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch CloudVideo')
      }
      
      const data = await response.json()
      setCloudVideo(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CloudVideo')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    // TODO: Implement like functionality
    setIsLiked(!isLiked)
  }

  const handleBookmark = async () => {
    // TODO: Implement bookmark functionality
    setIsBookmarked(!isBookmarked)
  }

  const handleShare = async () => {
    // TODO: Implement share functionality
    if (navigator.share) {
      try {
        await navigator.share({
          title: cloudVideo?.title,
          text: cloudVideo?.summary,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const getVideoUrl = () => {
    if (!cloudVideo?.uploadedVideo) return ''
    
    // Priority: playbackUrl (Ali Cloud) > cloudUrl > local URL fallback
    return cloudVideo.uploadedVideo.playbackUrl || 
           cloudVideo.uploadedVideo.cloudUrl || 
           cloudVideo.uploadedVideo.url || 
           ''
  }

  const getVideoThumbnail = () => {
    if (!cloudVideo) return ''
    
    // Priority: uploadedVideo.coverUrl > coverImage.url > thumbnailUrl
    return cloudVideo.uploadedVideo?.coverUrl ||
           cloudVideo.coverImage?.url ||
           cloudVideo.uploadedVideo?.thumbnailUrl ||
           ''
  }

  const hasVideo = () => {
    return cloudVideo?.uploadedVideo && getVideoUrl() !== ''
  }

  const getVideoTypeLabel = (videoType: number) => {
    switch (videoType) {
      case 0: return 'Basic Package'
      case 1: return 'Video Package'
      case 2: return 'Live Stream'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !cloudVideo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">CloudVideo Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested CloudVideo could not be found.'}</p>
          <button
            onClick={() => onClose ? onClose() : navigate('/cloud-videos')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to CloudVideos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => onClose ? onClose() : navigate('/cloud-videos')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{cloudVideo.title}</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getVideoTypeColor(cloudVideo.videoType)}`}>
                    {getVideoTypeLabel(cloudVideo.videoType)}
                  </span>
                  <span>•</span>
                  <span>{cloudVideo.viewCount || 0} views</span>
                  <span>•</span>
                  <span>{new Date(cloudVideo.creationTime).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isLiked 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                {cloudVideo.likeCount || 0}
              </button>
              
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked 
                    ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </button>
              
              {cloudVideo.allowDownload && (
                <button className="flex items-center px-3 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg text-sm font-medium transition-colors">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {hasVideo() ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-video bg-black">
                  <VideoPlayer
                    src={getVideoUrl()}
                    poster={getVideoThumbnail()}
                    title={cloudVideo.title}
                    autoPlay={false}
                    controls={true}
                    className="w-full h-full rounded-lg"
                  />
                </div>
              </div>
            ) : cloudVideo.uploadedVideo && !getVideoUrl() ? (
              // Show placeholder when video exists but URL is not available (still processing)
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Video is still processing...</p>
                    <p className="text-sm text-gray-500 mt-2">Please check back in a few minutes</p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Cover Image for Non-Video Packages */}
            {!cloudVideo.uploadedVideo && cloudVideo.coverImage && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img
                  src={cloudVideo.coverImage.url}
                  alt={cloudVideo.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Content Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: Eye },
                    ...(cloudVideo.introArticle ? [{ id: 'article', label: 'Article', icon: FileText }] : []),
                    ...(cloudVideo.survey ? [{ id: 'survey', label: 'Survey', icon: BarChart3 }] : []),
                    ...(cloudVideo.enableComments ? [{ id: 'comments', label: 'Comments', icon: MessageCircle }] : [])
                  ].map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                      <div 
                        className="text-gray-600 prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: cloudVideo.summary || 'No description available.' }}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'article' && cloudVideo.introArticle && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{cloudVideo.introArticle.title}</h3>
                      <div 
                        className="text-gray-600 prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: cloudVideo.introArticle.content }}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'survey' && cloudVideo.survey && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{cloudVideo.survey.title}</h3>
                      <p className="text-gray-600 mb-4">{cloudVideo.survey.description}</p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="text-blue-800 font-medium">
                            {cloudVideo.survey.questionCount} questions available
                          </span>
                        </div>
                        <button className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Take Survey
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Comments feature coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Video Information</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Eye className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Views:</span>
                  <span className="ml-auto font-medium">{cloudVideo.viewCount || 0}</span>
                </div>

                {cloudVideo.likeCount > 0 && (
                  <div className="flex items-center text-sm">
                    <Heart className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Likes:</span>
                    <span className="ml-auto font-medium">{cloudVideo.likeCount}</span>
                  </div>
                )}

                {cloudVideo.commentCount > 0 && (
                  <div className="flex items-center text-sm">
                    <MessageCircle className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Comments:</span>
                    <span className="ml-auto font-medium">{cloudVideo.commentCount}</span>
                  </div>
                )}

                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-auto font-medium">{new Date(cloudVideo.creationTime).toLocaleDateString()}</span>
                </div>

                {cloudVideo.uploadedVideo && (
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-auto font-medium">
                      {Math.floor(cloudVideo.uploadedVideo.duration / 60)}:{(cloudVideo.uploadedVideo.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            {cloudVideo.category && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Category</h3>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-primary-600 text-sm font-medium">
                      {cloudVideo.category.title.charAt(0)}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">{cloudVideo.category.title}</span>
                </div>
              </div>
            )}

            {/* Bound Event */}
            {cloudVideo.boundEvent && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Related Event</h3>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">{cloudVideo.boundEvent.title}</h4>
                  <p className="text-sm text-gray-600">{cloudVideo.boundEvent.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(cloudVideo.boundEvent.eventStartDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            {/* Resources */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resources</h3>
              <div className="space-y-3">
                {cloudVideo.uploadedVideo && (
                  <div className="flex items-center text-sm">
                    <Play className="w-4 h-4 text-purple-500 mr-2" />
                    <span className="text-gray-700">Video File</span>
                    <span className="ml-auto text-green-600">✓</span>
                  </div>
                )}

                {cloudVideo.coverImage && (
                  <div className="flex items-center text-sm">
                    <FileText className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-gray-700">Cover Image</span>
                    <span className="ml-auto text-green-600">✓</span>
                  </div>
                )}

                {cloudVideo.introArticle && (
                  <div className="flex items-center text-sm">
                    <FileText className="w-4 h-4 text-orange-500 mr-2" />
                    <span className="text-gray-700">Introduction Article</span>
                    <span className="ml-auto text-green-600">✓</span>
                  </div>
                )}

                {cloudVideo.survey && (
                  <div className="flex items-center text-sm">
                    <BarChart3 className="w-4 h-4 text-teal-500 mr-2" />
                    <span className="text-gray-700">Survey ({cloudVideo.survey.questionCount} questions)</span>
                    <span className="ml-auto text-green-600">✓</span>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Comments</span>
                  <span className={cloudVideo.enableComments ? 'text-green-600' : 'text-gray-400'}>
                    {cloudVideo.enableComments ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Likes</span>
                  <span className={cloudVideo.enableLikes ? 'text-green-600' : 'text-gray-400'}>
                    {cloudVideo.enableLikes ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Sharing</span>
                  <span className={cloudVideo.enableSharing ? 'text-green-600' : 'text-gray-400'}>
                    {cloudVideo.enableSharing ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Analytics</span>
                  <span className={cloudVideo.enableAnalytics ? 'text-green-600' : 'text-gray-400'}>
                    {cloudVideo.enableAnalytics ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Download</span>
                  <span className={cloudVideo.allowDownload ? 'text-green-600' : 'text-gray-400'}>
                    {cloudVideo.allowDownload ? 'Allowed' : 'Not Allowed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CloudVideoViewer

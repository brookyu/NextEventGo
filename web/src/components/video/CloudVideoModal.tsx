import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Download, Heart, Eye } from 'lucide-react'
import VideoPlayer from './VideoPlayer'
import toast from 'react-hot-toast'

interface CloudVideoItem {
  id: string
  title: string
  summary?: string
  cloudUrl?: string
  playbackUrl?: string
  uploadedVideo?: {
    id: string
    playbackUrl?: string
    cloudUrl?: string
    url?: string
    coverUrl?: string
    thumbnailUrl?: string
    duration?: number
  }
  coverImage?: {
    url: string
  }
  duration?: number
  created_at?: string
  videoType?: number
  quality?: string
  isOpen?: boolean
  allowDownload?: boolean
}

interface CloudVideoModalProps {
  video: CloudVideoItem | null
  isOpen: boolean
  onClose: () => void
}

export default function CloudVideoModal({ video, isOpen, onClose }: CloudVideoModalProps) {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const getVideoUrl = () => {
    if (!video?.uploadedVideo) return ''
    
    // Priority: playbackUrl (Ali Cloud) > cloudUrl > local URL fallback
    return video.uploadedVideo.playbackUrl || 
           video.uploadedVideo.cloudUrl || 
           video.uploadedVideo.url || 
           video.cloudUrl ||
           video.playbackUrl ||
           ''
  }

  const getVideoThumbnail = () => {
    if (!video) return ''
    
    // Priority: uploadedVideo.coverUrl > coverImage.url > thumbnailUrl
    return video.uploadedVideo?.coverUrl ||
           video.coverImage?.url ||
           video.uploadedVideo?.thumbnailUrl ||
           ''
  }

  const hasVideo = () => {
    return video?.uploadedVideo && getVideoUrl() !== ''
  }

  const copyVideoUrl = async () => {
    if (!video) return

    const videoUrl = getVideoUrl()

    if (!videoUrl) {
      toast.error('Video URL not available')
      return
    }

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

  const shareVideo = async () => {
    if (!video) return

    const videoUrl = getVideoUrl()

    if (!videoUrl) {
      toast.error('Video URL not available for sharing')
      return
    }

    const shareData = {
      title: video.title,
      text: video.summary || video.title,
      url: videoUrl
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to copying URL
        await copyVideoUrl()
      }
    } catch (error) {
      console.error('Error sharing:', error)
      // Fallback to copying URL
      await copyVideoUrl()
    }
  }

  const formatDuration = (duration: number | undefined) => {
    if (!duration) return 'Unknown'
    
    const minutes = Math.floor(duration / 60)
    const remainingSeconds = duration % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Unknown'
    }
  }

  const getVideoTypeLabel = (videoType?: number) => {
    switch (videoType) {
      case 0: return 'Basic Package'
      case 1: return 'Video Package'
      case 2: return 'Live Streaming'
      default: return 'Unknown'
    }
  }

  if (!video) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose()
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Video Player Section */}
            <div className="aspect-video bg-black">
              {hasVideo() ? (
                <VideoPlayer
                  src={getVideoUrl()}
                  poster={getVideoThumbnail()}
                  title={video.title}
                  onClose={onClose}
                  autoPlay={false}
                  controls={true}
                  className="w-full h-full"
                />
              ) : getVideoThumbnail() ? (
                <div className="w-full h-full relative">
                  <img
                    src={getVideoThumbnail()}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <p className="text-lg mb-2">Video not available</p>
                      <p className="text-sm opacity-75">Video may still be processing</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <p className="text-lg mb-2">No video available</p>
                    <p className="text-sm opacity-75">This CloudVideo doesn't have a video file</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Information Section */}
            <div className="p-6">
              {/* Title and Actions */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 mr-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {video.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {video.uploadedVideo?.duration && (
                      <span>Duration: {formatDuration(video.uploadedVideo.duration)}</span>
                    )}
                    {video.created_at && (
                      <span>Created: {formatDate(video.created_at)}</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={shareVideo}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  
                  <button
                    onClick={copyVideoUrl}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <span>Copy URL</span>
                  </button>

                  {video.allowDownload && hasVideo() && (
                    <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {video.summary && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <div 
                    className="text-gray-700 leading-relaxed prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: video.summary }}
                  />
                </div>
              )}

              {/* Video Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                {video.videoType !== undefined && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type</span>
                    <p className="text-gray-900">{getVideoTypeLabel(video.videoType)}</p>
                  </div>
                )}
                
                {video.quality && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Quality</span>
                    <p className="text-gray-900 uppercase">{video.quality}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <p className="text-gray-900">
                    {video.isOpen ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Private
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Download</span>
                  <p className="text-gray-900">
                    {video.allowDownload ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Allowed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Disabled
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
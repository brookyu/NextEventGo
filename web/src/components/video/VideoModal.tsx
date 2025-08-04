import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Download, Heart, Eye } from 'lucide-react'
import VideoPlayer from './VideoPlayer'
import toast from 'react-hot-toast'

interface VideoItem {
  id: string
  title: string
  description?: string
  url?: string
  playbackUrl?: string
  cloudUrl?: string
  thumbnailUrl?: string
  coverImage?: string
  duration?: string | number
  created_at?: string
  author?: string
  views?: number
  videoType?: string
  quality?: string
  isOpen?: boolean
}

interface VideoModalProps {
  video: VideoItem | null
  isOpen: boolean
  onClose: () => void
}

export default function VideoModal({ video, isOpen, onClose }: VideoModalProps) {
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
    if (!video) return ''
    return video.playbackUrl || video.cloudUrl || video.url || ''
  }

  const copyVideoUrl = async () => {
    if (!video) return

    // Use the actual Ali Cloud video URL instead of local app URL
    const videoUrl = video.playbackUrl || video.cloudUrl || video.url || ''

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

    // Use the actual Ali Cloud video URL for sharing
    const videoUrl = video.playbackUrl || video.cloudUrl || video.url || ''

    if (!videoUrl) {
      toast.error('Video URL not available for sharing')
      return
    }

    const shareData = {
      title: video.title,
      text: video.description || video.title,
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

  const formatDuration = (duration: string | number | undefined) => {
    if (!duration) return 'Unknown'
    
    const seconds = typeof duration === 'string' ? parseInt(duration) : duration
    if (isNaN(seconds)) return 'Unknown'
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
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

  const formatViews = (views?: number) => {
    if (!views) return '0'
    
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
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
              <VideoPlayer
                src={getVideoUrl()}
                poster={video.thumbnailUrl || video.coverImage}
                title={video.title}
                onClose={onClose}
                autoPlay={false}
                controls={true}
                className="w-full h-full"
              />
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
                    {video.views !== undefined && (
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{formatViews(video.views)} views</span>
                      </div>
                    )}
                    {video.duration && (
                      <span>Duration: {formatDuration(video.duration)}</span>
                    )}
                    {video.created_at && (
                      <span>Published: {formatDate(video.created_at)}</span>
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

                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {video.description && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {video.description}
                  </p>
                </div>
              )}

              {/* Video Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                {video.author && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Author</span>
                    <p className="text-gray-900">{video.author}</p>
                  </div>
                )}
                
                {video.videoType && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type</span>
                    <p className="text-gray-900 capitalize">{video.videoType}</p>
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
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
